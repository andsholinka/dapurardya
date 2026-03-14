import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "dapurardya";

if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  console.log(`✅ Connected to database "${dbName}" successfully.`);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
} finally {
  await client.close();
}
