import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "dapurardya";

async function deleteTestRecipes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(MONGODB_DB_NAME);
    const recipesCol = db.collection("recipes");

    const testSlugs = [
      "omelet-sosis-keju-jamur",
      "salad-segar-alpukat-apel",
      "rendang-daging-sapi-padang"
    ];

    const result = await recipesCol.deleteMany({ slug: { $in: testSlugs } });
    console.log(`🗑️  Deleted ${result.deletedCount} test recipes`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

deleteTestRecipes();
