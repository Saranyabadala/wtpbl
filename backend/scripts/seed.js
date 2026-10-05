/**
 * Seeds HealthPlate with ~30 restaurants and ~150 dishes.
 *
 *   npm run seed          upsert, keeps existing data
 *   npm run seed:fresh    drop the collections first (clean re-seed)
 *
 * Works against MONGODB_URI or the in-memory fallback so the demo never needs
 * a live database.
 */

import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { connectDB, disconnectDB, syncIndexes } from '../src/db.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { Dish } from '../src/models/Dish.js';
import { User } from '../src/models/User.js';
import { RESTAURANTS, DISHES, coordsFor } from '../src/seedData.js';
import { HEALTH_TAGS, ALLERGENS } from '../src/constants.js';

const shouldDrop = process.argv.includes('--drop');

/** Deterministic PRNG so re-seeding produces the same vote distribution. */
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function fakeVotes(rand, tagCount) {
  // Better-tagged dishes attract more votes, which makes confidence sorting
  // produce a believable ordering in the demo.
  const base = 2 + tagCount * 4;
  const up = Math.floor(base * (0.75 + rand() * 0.3));
  const down = Math.floor(up * rand() * 0.25);
  return { up, down };
}

/**
 * Seeds the database. Exported so the smoke test can reuse it, and also
 * runnable directly via `npm run seed`.
 */
export async function seedDatabase({ drop = false, quiet = false } = {}) {
  const log = quiet ? () => {} : (...args) => console.log(...args);

  if (drop) {
    await Promise.all([Restaurant.deleteMany({}), Dish.deleteMany({}), User.deleteMany({})]);
    log('[seed] dropped existing collections');
  }

  // One demo account so contributions and votes can be tried immediately.
  const demoEmail = 'demo@healthplate.app';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo User',
      email: demoEmail,
      password_hash: 'demo1234',
      dietary_preferences: ['diabetic_friendly'],
      allergies: [],
    });
    log('[seed] created demo user demo@healthplate.app / demo1234');
  } else {
    demoUser.password_hash = 'demo1234';
    await demoUser.save();
  }

  const rand = seededRandom(20260801);
  let restaurantCount = 0;
  let dishCount = 0;
  let untagged = 0;

  for (const [index, entry] of RESTAURANTS.entries()) {
    const { lat, lng } = coordsFor(index + 1, entry.area);

    const restaurant = await Restaurant.findOneAndUpdate(
      { name: entry.name },
      {
        $set: {
          name: entry.name,
          location: { lat, lng },
          address: `${entry.area}, Mumbai, Maharashtra`,
          cuisine_type: entry.cuisine,
          price_range: entry.price,
          rating: entry.rating,
          google_place_id: null,
          source: 'seed',
          image_query: `${entry.cuisine} Indian restaurant food`,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    restaurantCount += 1;

    for (const dish of DISHES[entry.name] || []) {
      const tags = dish.tags.filter((t) => HEALTH_TAGS.includes(t));
      const allergens = dish.allergens.filter((a) => ALLERGENS.includes(a));
      if (!tags.length) untagged += 1;

      const votes = fakeVotes(rand, tags.length);
      await Dish.findOneAndUpdate(
        { restaurant_id: restaurant._id, name: dish.name },
        {
          $set: {
            restaurant_id: restaurant._id,
            name: dish.name,
            description: dish.tip,
            image_query: `${dish.name} Indian food`,
            health_tags: tags,
            allergens,
            community_votes: votes,
            tip: dish.tip,
            created_by: demoUser._id,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      dishCount += 1;
    }
  }

  await syncIndexes();

  const totals = {
    restaurants: await Restaurant.countDocuments(),
    dishes: await Dish.countDocuments(),
    processedRestaurants: restaurantCount,
    processedDishes: dishCount,
    untagged,
  };

  if (!quiet) {
    console.log('[seed] ---------------------------------------');
    console.log(`[seed] restaurants processed : ${totals.processedRestaurants}`);
    console.log(`[seed] dishes processed     : ${totals.processedDishes}`);
    console.log(`[seed] dishes with no tags  : ${totals.untagged}`);
    console.log(`[seed] DB now holds          : ${totals.restaurants} restaurants, ${totals.dishes} dishes`);
    console.log('[seed] demo login            : demo@healthplate.app / demo1234');
    console.log('[seed] ---------------------------------------');
  }

  return totals;
}

/** Entry point used by `npm run seed`. */
async function main() {
  const dbInfo = await connectDB();
  console.log(`[seed] connected (${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'})`);

  await seedDatabase({ drop: shouldDrop });

  if (dbInfo.inMemory) {
    console.log('[seed] NOTE: in-memory DB, data is discarded when this process exits.');
    console.log('[seed] Set MONGODB_URI in backend/.env to persist the seed data.');
  }
}

// Only run when invoked directly, not when imported by the smoke test.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[seed] failed:', err);
      try {
        await disconnectDB();
      } catch {
        // Already disconnected.
      }
      process.exit(1);
    });
}
