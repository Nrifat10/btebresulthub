import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection, cached across hot reloads / serverless invocations.
 * When MONGODB_URI is not set, getDb() returns null and the app falls back
 * to the bundled sample data (see sample-data.ts). That lets the project run
 * on Vercel with zero configuration for a demo, and switch to real data the
 * moment you add the env var.
 */
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "btebresult";

type Cache = { client: MongoClient | null; promise: Promise<MongoClient> | null };
const g = globalThis as unknown as { __mongo?: Cache };
const cache: Cache = g.__mongo ?? { client: null, promise: null };
g.__mongo = cache;

export function hasDatabase() {
  return Boolean(uri);
}

export async function getDb(): Promise<Db | null> {
  if (!uri) return null;
  if (cache.client) return cache.client.db(dbName);
  if (!cache.promise) {
    cache.promise = new MongoClient(uri, { maxPoolSize: 10 }).connect();
  }
  cache.client = await cache.promise;
  return cache.client.db(dbName);
}

/** Create the indexes the queries rely on. Safe to run repeatedly. */
export async function ensureIndexes(db: Db) {
  await db.collection("results").createIndexes([
    { key: { curriculumId: 1, roll: 1 } },
    { key: { roll: 1 } },
    { key: { fileHash: 1, roll: 1 }, unique: true },
    { key: { instituteCode: 1, curriculumId: 1, semester: 1, date: -1 } },
    { key: { date: -1 } },
  ]);
  await db.collection("publications").createIndexes([
    { key: { fileHash: 1 }, unique: true },
    { key: { date: -1 } },
  ]);
  await db.collection("institutes").createIndexes([
    { key: { code: 1 }, unique: true },
    { key: { name: "text", district: "text" } },
  ]);
}
