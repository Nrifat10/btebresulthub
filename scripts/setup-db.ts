/**
 * Create the MongoDB indexes. Run once after creating the database:
 *   npm run db:setup
 */
import { existsSync } from "node:fs";
import { MongoClient } from "mongodb";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) process.loadEnvFile(f);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (put it in .env.local)");
  const client = await new MongoClient(uri).connect();
  try {
    const db = client.db(process.env.MONGODB_DB || "btebresult");
    await db.collection("results").createIndexes([
      { key: { curriculumId: 1, roll: 1 } },
      { key: { roll: 1 } },
      { key: { fileHash: 1, roll: 1 }, unique: true },
      { key: { instituteCode: 1, curriculumId: 1, semester: 1, date: -1 } },
      { key: { date: -1 } },
    ]);
    await db.collection("publications").createIndexes([{ key: { fileHash: 1 }, unique: true }, { key: { date: -1 } }]);
    await db.collection("institutes").createIndexes([{ key: { code: 1 }, unique: true }]);
    console.log("Indexes created on results, publications, institutes.");
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
