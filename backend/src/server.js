import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB, syncIndexes } from './db.js';
import { config } from './config.js';
import { assertJwtSecret } from './utils/token.js';

async function start() {
  assertJwtSecret();

  const dbInfo = await connectDB();
  await syncIndexes();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[api] HealthPlate listening on http://localhost:${config.port}`);
    console.log(`[api] mode: ${dbInfo.inMemory ? 'in-memory db' : 'MONGODB_URI'}`);
    console.log(
      `[api] google places: ${config.useGooglePlaces ? 'enabled' : 'disabled, using seeded restaurants'}`
    );
  });
}

start().catch((err) => {
  console.error('[fatal] failed to start server:', err.message);
  process.exit(1);
});
