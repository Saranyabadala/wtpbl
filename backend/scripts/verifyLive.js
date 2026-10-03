/**
 * Live end-to-end check: seeds an in-memory DB, boots the API, exercises the
 * real HTTP surface, then shuts everything down. Used to verify the frontend's
 * expected response shapes.
 */

import 'dotenv/config';
import assert from 'node:assert';
import { connectDB, disconnectDB } from '../src/db.js';
import { createApp } from '../src/app.js';
import { seedDatabase } from './seed.js';

let baseUrl;

async function get(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const body = await res.json();
  return { status: res.status, body };
}

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `\n        ${detail}`}`);
}

async function run() {
  await connectDB();
  const totals = await seedDatabase({ quiet: true });

  const server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  console.log(`\nLive API verification at ${baseUrl}\n`);

  const health = await get('/api/health');
  check('health endpoint responds', health.status === 200 && health.body.status === 'ok');

  const list = await get('/api/restaurants?limit=50');
  check(
    'restaurant list returns the 30 seeded restaurants',
    list.status === 200 && list.body.data.length === 30,
    `got ${list.body.data?.length}`
  );

  const sample = list.body.data[0];
  check(
    'restaurant shape has id, name, distance, preview_dishes',
    Boolean(sample?.id && sample?.name && sample?.distance_label && Array.isArray(sample?.preview_dishes))
  );
  check(
    'preview dish carries tags for badge rendering',
    Array.isArray(sample?.preview_dishes?.[0]?.health_tags)
  );

  const filtered = await get('/api/restaurants?health_tags=diabetic_friendly,gluten_free&limit=50');
  check(
    'multi-tag filter returns a subset',
    filtered.status === 200 && filtered.body.data.length > 0 && filtered.body.data.length < 30,
    `got ${filtered.body.data?.length}`
  );

  const sortCheck = await get('/api/restaurants?limit=50&sort=distance');
  const distances = sortCheck.body.data.map((r) => r.distance_km);
  check(
    'distance sort is ascending',
    distances.every((d, i) => i === 0 || d >= distances[i - 1])
  );

  const options = await get('/api/restaurants/meta/filters');
  check(
    'filter options include all 6 health tags with counts',
    options.body.health_tags?.length === 6
  );

  const restaurantId = list.body.data.find((r) => r.preview_dishes.length > 0)?.id;
  const detail = await get(`/api/restaurants/${restaurantId}`);
  check('restaurant detail returns dishes array', Array.isArray(detail.body.dishes));

  const dishId = detail.body.dishes[0]?._id || detail.body.dishes[0]?.id;
  const dish = await get(`/api/dishes/${dishId}`);
  check(
    'dish detail includes confidence and restaurant',
    typeof dish.body.data?.confidence === 'number' && Boolean(dish.body.data?.restaurant)
  );

  const dishes = await get('/api/dishes?sort=confidence&limit=50');
  check(
    'dish list is confidence ordered',
    dishes.body.data.every((d, i, arr) => i === 0 || arr[i - 1].confidence >= d.confidence)
  );
  check('dish list embeds restaurant for card display', Boolean(dishes.body.data[0]?.restaurant?.name));

  // Anonymous "Safe for me" must degrade quietly.
  const anonSafe = await get('/api/restaurants?safe_for_me=true&limit=50');
  check('anonymous safe-for-me does not error', anonSafe.status === 200);

  // Logged-in safe-for-me with the demo profile.
  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@healthplate.app', password: 'demo1234' }),
  }).then((r) => r.json());

  const safeRes = await fetch(`${baseUrl}/api/restaurants?safe_for_me=true&limit=50`, {
    headers: { Authorization: `Bearer ${login.token}` },
  }).then((r) => r.json());
  check(
    'demo safe-for-me applies saved diabetic_friendly preference',
    safeRes.data.length > 0 &&
      safeRes.data.every((r) => r.preview_dishes.every((d) => d.health_tags.includes('diabetic_friendly'))),
    `${safeRes.data?.length} restaurants`
  );

  const voteTarget = safeRes.data[0]?.preview_dishes[0]?.id;
  const vote = await fetch(`${baseUrl}/api/dishes/${voteTarget}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ direction: 'up' }),
  }).then((r) => r.json());
  check(
    'vote returns votes + confidence + my_vote',
    vote.data?.community_votes?.up >= 1 && typeof vote.data.confidence === 'number' && vote.data.my_vote === 'up'
  );

  const create = await fetch(`${baseUrl}/api/dishes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({
      name: 'Live Verify Dish',
      restaurant_id: restaurantId,
      health_tags: ['gluten_free'],
      tip: 'Ask for less oil.',
    }),
  });
  check('dish creation returns 201', create.status === 201);

  const created = await create.json();
  const patch = await fetch(`${baseUrl}/api/dishes/${created.data.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ tip: 'Updated: skip the ghee.' }),
  }).then((r) => r.json());
  check('tip edit persists', patch.data?.tip === 'Updated: skip the ghee.');

  const profilePatch = await fetch(`${baseUrl}/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ allergies: ['dairy'] }),
  }).then((r) => r.json());
  check('profile allergy update persists', profilePatch.user?.allergies?.includes('dairy'));

  const afterAllergy = await fetch(`${baseUrl}/api/restaurants?safe_for_me=true&limit=50`, {
    headers: { Authorization: `Bearer ${login.token}` },
  }).then((r) => r.json());
  check(
    'safe-for-me now excludes dairy',
    afterAllergy.data.every((r) => r.preview_dishes.every((d) => !d.allergens.includes('dairy')))
  );

  console.log(`\nSeed totals: ${totals.restaurants} restaurants, ${totals.dishes} dishes`);
  const passed = checks.filter((c) => c.ok).length;
  console.log(`${passed}/${checks.length} checks passed`);

  server.close();
  await disconnectDB();
  process.exit(passed === checks.length ? 0 : 1);
}

run().catch(async (err) => {
  console.error('[verify] crashed:', err);
  await disconnectDB();
  process.exit(1);
});
