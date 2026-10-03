import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const memoryServer = { instance: null };

/**
 * Connects to MongoDB using MONGODB_URI when present.
 * Falls back to an in-process mongodb-memory-server so a fresh clone can be
 * seeded and demoed without installing mongod or provisioning a cluster.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.startsWith('mongodb://127.0.0.1:27017/healthplate-fallback')) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[db] connected to MONGODB_URI (${mongoose.connection.name})`);
    return { inMemory: false };
  }

  if (uri) {
    console.warn('[db] MONGODB_URI looks like the fallback placeholder, ignoring it');
  }

  console.log('[db] no MONGODB_URI set, starting in-memory MongoDB fallback');
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const server = await MongoMemoryServer.create({
    instance: { dbName: 'healthplate-fallback' },
  });
  memoryServer.instance = server;
  await mongoose.connect(server.getUri('healthplate-fallback'));
  console.log('[db] connected to in-memory MongoDB (data is discarded on exit)');
  return { inMemory: true };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer.instance) {
    await memoryServer.instance.stop();
  }
}

export async function syncIndexes() {
  await Promise.all([
    mongoose.model('Restaurant').syncIndexes(),
    mongoose.model('Dish').syncIndexes(),
    mongoose.model('User').syncIndexes(),
  ]);
}
