/**
 * Script untuk membuat MongoDB indexes.
 * Jalankan sekali sebelum deploy: node scripts/ensure-indexes.mjs
 */
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

async function ensureIndexes() {
  await client.connect();
  const db = client.db(dbName);

  console.log(`📦 Connected to "${dbName}". Creating indexes...\n`);

  // recipes
  await db.collection("recipes").createIndexes([
    { key: { slug: 1 }, unique: true, name: "slug_unique" },
    { key: { published: 1, updatedAt: -1 }, name: "published_updated" },
    { key: { category: 1, published: 1 }, name: "category_published" },
    { key: { title: "text", description: "text" }, name: "text_search" },
  ]);
  console.log("✅ recipes indexes created");

  // members
  await db.collection("members").createIndexes([
    { key: { email: 1 }, unique: true, name: "email_unique" },
    { key: { createdAt: -1 }, name: "created_desc" },
  ]);
  console.log("✅ members indexes created");

  // recipe_ratings
  await db.collection("recipe_ratings").createIndexes([
    { key: { recipeId: 1, memberId: 1 }, unique: true, name: "recipe_member_unique" },
    { key: { recipeId: 1 }, name: "recipe_id" },
  ]);
  console.log("✅ recipe_ratings indexes created");

  // recipe_requests
  await db.collection("recipe_requests").createIndexes([
    { key: { status: 1, createdAt: -1 }, name: "status_created" },
    { key: { memberId: 1 }, name: "member_id" },
  ]);
  console.log("✅ recipe_requests indexes created");

  // push_subscriptions
  await db.collection("push_subscriptions").createIndexes([
    { key: { endpoint: 1 }, unique: true, name: "endpoint_unique" },
    { key: { memberId: 1 }, name: "member_id" },
  ]);
  console.log("✅ push_subscriptions indexes created");

  // credit_usage
  await db.collection("credit_usage").createIndexes([
    { key: { memberId: 1, createdAt: -1 }, name: "member_created" },
  ]);
  console.log("✅ credit_usage indexes created");

  // payment_logs (idempotency)
  await db.collection("payment_logs").createIndexes([
    { key: { paymentId: 1 }, unique: true, name: "payment_id_unique" },
    { key: { email: 1, createdAt: -1 }, name: "email_created" },
  ]);
  console.log("✅ payment_logs indexes created");

  console.log("\n🎉 All indexes created successfully!");
}

ensureIndexes()
  .catch((err) => { console.error("❌ Error:", err.message); process.exit(1); })
  .finally(() => client.close());
