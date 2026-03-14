import { config } from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import readline from "readline";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "dapurardya";

if (!uri) {
  console.error("❌ MONGODB_URI is not set");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const email = await ask("Email admin: ");
const password = await ask("Password admin: ");
rl.close();

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("admins");

  const existing = await col.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log("⚠️  Admin dengan email ini sudah ada.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await col.insertOne({
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date(),
  });

  console.log(`✅ Admin "${email}" berhasil dibuat.`);
} catch (err) {
  console.error("❌ Error:", err.message);
} finally {
  await client.close();
}
