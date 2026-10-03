/**
 * One-command demo: seeds the database and starts the API in a single process.
 *
 * Needed because the in-memory MongoDB fallback lives inside the server process,
 * so a separately-run `npm run seed` would write to a database that no longer
 * exists by the time the server starts.
 *
 *   npm run dev:seed
 */

import 'dotenv/config';
import { connectDB, syncIndexes } from '../src/db.js';
import { seedDatabase } from './seed.js';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { assertJwtSecret } from '../src/utils/token.js';

async function start() {
  assertJwtSecret();

  const dbInfo = await connectDB();
  console.log(`[db] ${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'}`);

  const totals = await seedDatabase();
  await syncIndexes();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`\n[api] HealthPlate ready on http://localhost:${config.port}`);
    console.log(`[api] ${totals.restaurants} restaurants, ${totals.dishes} dishes`);
    console.log('[api] demo login: demo@healthplate.app / demo1234');
    console.log(
      `[api] google places: ${config.useGooglePlaces ? 'enabled' : 'disabled, using seeded data'}\n`
    );
  });
}

start().catch((err) => {
  console.error('[fatal] failed to start:', err.message);
  process.exit(1);
});
