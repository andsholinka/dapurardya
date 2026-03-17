import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "dapurardya";

async function checkRecipes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const recipesCol = db.collection("recipes");

    const count = await recipesCol.countDocuments();
    console.log(`\n📊 Total recipes in database: ${count}`);

    if (count > 0) {
      const recipes = await recipesCol.find({}).project({ title: 1, slug: 1, published: 1 }).toArray();
      console.log("\n📋 Recipes:");
      recipes.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.title} (${r.slug}) - ${r.published ? "✅ Published" : "❌ Draft"}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

checkRecipes();
