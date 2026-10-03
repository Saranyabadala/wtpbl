/**
 * End-to-end smoke test for the HealthPlate API.
 *
 * Seeds an in-memory DB, boots the app on a random port, then exercises the
 * full feature set: signup, login, filters, safe-for-me, dish CRUD and voting.
 *
 *   npm run smoke
 */

import 'dotenv/config';
import assert from 'node:assert';
import { connectDB, disconnectDB, syncIndexes } from '../src/db.js';
import { createApp } from '../src/app.js';
import { seedDatabase } from './seed.js';
import { HEALTH_TAGS } from '../src/constants.js';

let server;
let baseUrl;
let token;

function api(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function json(path, options) {
  const res = await api(path, options);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

const results = [];
function check(name, fn) {
  return (async () => {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`  PASS  ${name}`);
    } catch (err) {
      results.push({ name, ok: false, err });
      console.log(`  FAIL  ${name}\n        ${err.message}`);
    }
  })();
}

async function run() {
  const dbInfo = await connectDB();
  await seedDatabase();
  await syncIndexes();

  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  console.log(`\nHealthPlate API smoke test (${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'})`);
  console.log(`Target: ${baseUrl}\n`);

  await check('GET /api/health returns ok', async () => {
    const { status, body } = await json('/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
  });

  await check('signup rejects a short password', async () => {
    const { status } = await json('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'X', email: 'x@y.com', password: '123' }),
    });
    assert.equal(status, 400);
  });

  await check('signup rejects an invalid health tag', async () => {
    const { status } = await json('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bad Tag',
        email: 'bad@example.com',
        password: 'password1',
        dietary_preferences: ['not_a_real_tag'],
      }),
    });
    assert.equal(status, 400);
  });

  await check('signup issues a JWT and profile', async () => {
    const { status, body } = await json('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Tester',
        email: 'smoke@example.com',
        password: 'password1',
        dietary_preferences: ['diabetic_friendly', 'gluten_free'],
        allergies: ['dairy'],
      }),
    });
    assert.equal(status, 201);
    assert.ok(body.token, 'expected a token');
    assert.equal(body.user.dietary_preferences.length, 2);
    assert.equal(body.user.allergies[0], 'dairy');
    assert.equal(body.user.password_hash, undefined, 'must not leak password hash');
    token = body.token;
  });

  await check('duplicate signup is rejected', async () => {
    const { status } = await json('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Dupe', email: 'smoke@example.com', password: 'password1' }),
    });
    assert.equal(status, 409);
  });

  await check('login works with correct credentials', async () => {
    const { status, body } = await json('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'smoke@example.com', password: 'password1' }),
    });
    assert.equal(status, 200);
    assert.ok(body.token);
  });

  await check('login rejects a wrong password', async () => {
    const { status } = await json('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'smoke@example.com', password: 'wrongpass' }),
    });
    assert.equal(status, 401);
  });

  await check('GET /api/auth/me returns the profile', async () => {
    const { status, body } = await json('/api/auth/me');
    assert.equal(status, 200);
    assert.equal(body.user.email, 'smoke@example.com');
  });

  await check('restaurant list includes seeded data and distances', async () => {
    const { status, body } = await json('/api/restaurants?limit=50');
    assert.equal(status, 200);
    assert.ok(body.data.length >= 25, `expected >=25 restaurants, got ${body.data.length}`);
    const withDistance = body.data.filter((r) => typeof r.distance_km === 'number');
    assert.ok(withDistance.length > 0, 'expected haversine distances');
    assert.ok(body.meta.data_source === 'seed');
  });

  await check('restaurant list sorts by distance', async () => {
    const { body } = await json('/api/restaurants?limit=50&sort=distance');
    const distances = body.data.map((r) => r.distance_km);
    const sorted = [...distances].sort((a, b) => a - b);
    assert.deepEqual(distances, sorted);
  });

  await check('health tag filter narrows results', async () => {
    const all = await json('/api/restaurants?limit=50');
    const filtered = await json('/api/restaurants?limit=50&health_tags=diabetic_friendly');
    assert.ok(filtered.body.data.length < all.body.data.length, 'filter should reduce results');
    assert.ok(filtered.body.data.length > 0, 'filter should still match something');
    for (const restaurant of filtered.body.data) {
      assert.ok(
        restaurant.preview_dishes.some((d) => d.health_tags.includes('diabetic_friendly')),
        `${restaurant.name} should only show diabetic-friendly previews`
      );
    }
  });

  await check('cuisine and price filters work', async () => {
    const { body } = await json('/api/restaurants?cuisine=Jain&price=$&limit=50');
    for (const r of body.data) {
      assert.equal(r.cuisine_type, 'Jain');
      assert.equal(r.price_range, '$');
    }
  });

  await check('radius filter excludes far restaurants', async () => {
    const { body } = await json('/api/restaurants?limit=50&radius_km=3');
    for (const r of body.data) {
      assert.ok(r.distance_km <= 3, `${r.name} at ${r.distance_km}km exceeds 3km`);
    }
  });

  await check('"Safe for me" requires every saved preference', async () => {
    const { body } = await json('/api/restaurants?limit=50&safe_for_me=true');
    assert.ok(body.data.length > 0, 'expected some safe matches');
    assert.deepEqual(
      body.meta.active_filters.health_tags.sort(),
      ['diabetic_friendly', 'gluten_free'].sort()
    );
    for (const restaurant of body.data) {
      for (const dish of restaurant.preview_dishes) {
        assert.ok(
          dish.health_tags.includes('diabetic_friendly'),
          `${dish.name} missing diabetic_friendly`
        );
        assert.ok(dish.health_tags.includes('gluten_free'), `${dish.name} missing gluten_free`);
      }
    }
  });

  await check('"Safe for me" excludes allergen dishes (dairy)', async () => {
    const { body } = await json('/api/restaurants?limit=50&safe_for_me=true');
    for (const restaurant of body.data) {
      for (const dish of restaurant.preview_dishes) {
        assert.ok(!dish.allergens.includes('dairy'), `${dish.name} should exclude dairy`);
      }
    }
  });

  await check('anonymous "Safe for me" does not 500', async () => {
    const saved = token;
    token = null;
    const { status } = await json('/api/restaurants?safe_for_me=true');
    token = saved;
    assert.equal(status, 200);
  });

  await check('restaurant detail returns filtered dishes', async () => {
    const { body: list } = await json('/api/restaurants?limit=1');
    const id = list.data[0].id;
    const { status, body } = await json(`/api/restaurants/${id}?health_tags=gluten_free`);
    assert.equal(status, 200);
    for (const dish of body.dishes) {
      assert.ok(dish.health_tags.includes('gluten_free'), `${dish.name} not gluten free`);
    }
  });

  await check('restaurant detail 404s for a bad id', async () => {
    const { status } = await json('/api/restaurants/64b7f9c2e13b1c0000000000');
    assert.equal(status, 404);
  });

  await check('dish list sorts by vote confidence', async () => {
    const { status, body } = await json('/api/dishes?sort=confidence&limit=50');
    assert.equal(status, 200);
    assert.ok(body.data.length > 0);
    for (let i = 1; i < body.data.length; i += 1) {
      assert.ok(
        body.data[i - 1].confidence >= body.data[i].confidence,
        'confidence should be non-increasing'
      );
    }
  });

  await check('dish search matches by name', async () => {
    const { body } = await json('/api/dishes?search=dosa');
    assert.ok(body.data.length > 0, 'expected dosa matches');
    for (const d of body.data) {
      assert.ok(/dosa/i.test(d.name), `${d.name} does not match search`);
    }
  });

  let createdDishId;
  await check('authenticated user can add a dish', async () => {
    const { body: list } = await json('/api/restaurants?limit=1');
    const restaurantId = list.data[0].id;
    const { status, body } = await json('/api/dishes', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Test Khichdi',
        restaurant_id: restaurantId,
        health_tags: ['gluten_free', 'low_oil', 'kidney_friendly'],
        allergens: [],
        tip: 'No oil needed, keep it light.',
      }),
    });
    assert.equal(status, 201);
    assert.equal(body.data.total_votes, 0, 'new dishes start unvoted');
    createdDishId = body.data.id;
  });

  await check('dish requires at least one health tag', async () => {
    const { body: list } = await json('/api/restaurants?limit=1');
    const { status } = await json('/api/dishes', {
      method: 'POST',
      body: JSON.stringify({ name: 'No Tags Dish', restaurant_id: list.data[0].id, health_tags: [] }),
    });
    assert.equal(status, 400);
  });

  await check('anonymous dish creation is blocked', async () => {
    const saved = token;
    token = null;
    const { body: list } = await json('/api/restaurants?limit=1');
    const { status } = await json('/api/dishes', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Anon Dish',
        restaurant_id: list.data[0].id,
        health_tags: ['low_oil'],
      }),
    });
    token = saved;
    assert.equal(status, 401);
  });

  await check('duplicate dish at same restaurant is rejected', async () => {
    const { body: list } = await json('/api/restaurants?limit=1');
    const { status } = await json('/api/dishes', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Test Khichdi',
        restaurant_id: list.data[0].id,
        health_tags: ['low_oil'],
      }),
    });
    assert.equal(status, 409);
  });

  await check('upvote increments and sets my_vote', async () => {
    const { status, body } = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'up' }),
    });
    assert.equal(status, 200);
    assert.equal(body.data.community_votes.up, 1);
    assert.equal(body.data.my_vote, 'up');
    assert.ok(body.data.confidence > 0, 'confidence should be positive after an upvote');
  });

  await check('repeating the same vote retracts it', async () => {
    const { body } = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'up' }),
    });
    assert.equal(body.data.community_votes.up, 0);
    assert.equal(body.data.my_vote, null);
  });

  await check('flipping a vote moves the count between directions', async () => {
    await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'up' }),
    });
    const { body } = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'down' }),
    });
    assert.equal(body.data.community_votes.up, 0);
    assert.equal(body.data.community_votes.down, 1);
    assert.equal(body.data.my_vote, 'down');
  });

  await check('a second user adds an independent vote', async () => {
    const saved = token;
    const { body: login } = await json('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'demo@healthplate.app', password: 'demo1234' }),
    });
    assert.ok(login.token, `demo login failed: ${JSON.stringify(login)}`);
    token = login.token;

    // Demo user has not voted yet, so down goes 1 -> 2.
    const first = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'down' }),
    });
    assert.equal(first.body.data.community_votes.down, 2);
    assert.equal(first.body.data.my_vote, 'down');

    // The demo user voting again retracts their own vote only, never the first user's.
    const repeat = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'down' }),
    });
    assert.equal(repeat.body.data.community_votes.down, 1, 'only the repeat vote is retracted');
    token = saved;
  });

  await check('invalid vote direction is rejected', async () => {
    const { status } = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'sideways' }),
    });
    assert.equal(status, 400);
  });

  await check('anonymous voting is blocked', async () => {
    const saved = token;
    token = null;
    const { status } = await json(`/api/dishes/${createdDishId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction: 'up' }),
    });
    token = saved;
    assert.equal(status, 401);
  });

  await check('dish detail shows the voter vote state', async () => {
    const { body } = await json(`/api/dishes/${createdDishId}`);
    assert.equal(body.data.my_vote, 'down');
    assert.ok(body.data.restaurant, 'dish detail should embed the restaurant');
  });

  await check('tip can be edited by a contributor', async () => {
    const { status, body } = await json(`/api/dishes/${createdDishId}`, {
      method: 'PATCH',
      body: JSON.stringify({ tip: 'Updated tip: skip the ghee entirely.', health_tags: ['gluten_free', 'low_oil', 'diabetic_friendly'] }),
    });
    assert.equal(status, 200);
    assert.match(body.data.tip, /Updated tip/);
    assert.ok(body.data.health_tags.includes('diabetic_friendly'));
  });

  await check('profile update changes safe-for-me preferences', async () => {
    const { status, body } = await json('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ dietary_preferences: ['heart_healthy'], allergies: ['nuts', 'soy'] }),
    });
    assert.equal(status, 200);
    assert.deepEqual(body.user.dietary_preferences, ['heart_healthy']);

    const { body: list } = await json('/api/restaurants?limit=50&safe_for_me=true');
    for (const restaurant of list.data) {
      for (const dish of restaurant.preview_dishes) {
        assert.ok(dish.health_tags.includes('heart_healthy'));
        assert.ok(!dish.allergens.includes('nuts') && !dish.allergens.includes('soy'));
      }
    }
  });

  await check('filter options expose cuisines and tag counts', async () => {
    const { status, body } = await json('/api/restaurants/meta/filters');
    assert.equal(status, 200);
    assert.ok(body.cuisines.length > 0);
    const tagNames = body.health_tags.map((t) => t.tag);
    for (const tag of HEALTH_TAGS) {
      assert.ok(tagNames.includes(tag), `missing tag ${tag} in filter options`);
    }
  });

  await check('cart requires auth', async () => {
    const saved = token;
    token = null;
    const { status } = await json('/api/cart');
    token = saved;
    assert.equal(status, 401);
  });

  await check('add to cart increments quantity for the same dish', async () => {
    const { body: dishes } = await json('/api/dishes?limit=1');
    const dish = dishes.data[0];
    const dishId = dish._id || dish.id;
    assert.ok(dishId, 'expected a seeded dish');

    const first = await json('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ dish_id: dishId }),
    });
    assert.ok([200, 201].includes(first.status), `unexpected add status ${first.status}`);
    assert.equal(first.body.data.items.length, 1);
    assert.equal(first.body.data.items[0].quantity, 1);
    assert.ok(first.body.data.items[0].price_at_add > 0);
    assert.ok(Array.isArray(first.body.data.items[0].dish.health_tags));

    const second = await json('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ dish_id: dishId }),
    });
    assert.equal(second.status, 200);
    assert.equal(second.body.data.items.length, 1);
    assert.equal(second.body.data.items[0].quantity, 2);
    assert.equal(second.body.data.item_count, 2);
  });

  await check('update cart quantity and remove item', async () => {
    const { body } = await json('/api/cart');
    const itemId = body.data.items[0].id;
    const updated = await json('/api/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ item_id: itemId, quantity: 3 }),
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.items[0].quantity, 3);

    const removed = await json(`/api/cart/remove/${itemId}`, { method: 'DELETE' });
    assert.equal(removed.status, 200);
    assert.equal(removed.body.data.items.length, 0);
  });

  await check('empty cart cannot checkout', async () => {
    const { status, body } = await json('/api/checkout', { method: 'POST' });
    assert.equal(status, 400);
    assert.match(body.error, /empty/i);
  });

  await check('mock checkout creates an order and clears the cart', async () => {
    const { body: dishes } = await json('/api/dishes?limit=1');
    const dishId = dishes.data[0]._id || dishes.data[0].id;
    await json('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ dish_id: dishId, quantity: 2 }),
    });

    const { status, body } = await json('/api/checkout', { method: 'POST' });
    assert.equal(status, 201);
    assert.match(body.data.order_number, /^HP-\d+$/);
    assert.equal(body.data.status, 'placed');
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].quantity, 2);
    assert.ok(body.data.total_amount > 0);
    assert.equal(body.data.mock, true);

    const cart = await json('/api/cart');
    assert.equal(cart.body.data.items.length, 0);

    const history = await json('/api/orders');
    assert.equal(history.status, 200);
    assert.ok(history.body.data.length >= 1);
    assert.equal(history.body.data[0].order_number, body.data.order_number);
  });

  await check('unknown route returns 404 JSON', async () => {
    const { status, body } = await json('/api/does-not-exist');
    assert.equal(status, 404);
    assert.ok(body.error);
  });

  await check('google places endpoint degrades gracefully without a key', async () => {
    const { status, body } = await json('/api/restaurants/search-nearby?query=thali', {
      method: 'POST',
    });
    assert.equal(status, 200);
    assert.equal(body.meta.source, 'seed');
    assert.match(body.meta.message, /Google Places is not configured/);
  });

  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} checks passed`);

  if (passed !== results.length) {
    console.log('\nFailures:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}: ${r.err.message}`));
  }

  server.close();
  await disconnectDB();
  process.exit(passed === results.length ? 0 : 1);
}

run().catch(async (err) => {
  console.error('[smoke] crashed:', err);
  if (server) server.close();
  await disconnectDB();
  process.exit(1);
});
