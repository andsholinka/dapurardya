import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "dapurardya";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function importRecipes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(MONGODB_DB_NAME);
    const recipesCol = db.collection("recipes");

    // Read sample recipes
    const recipesPath = join(__dirname, "..", "sample-recipes-scanner-test.json");
    const recipesData = JSON.parse(readFileSync(recipesPath, "utf-8"));

    console.log(`📦 Found ${recipesData.length} recipes to import`);

    // Convert date strings to Date objects
    const recipesToInsert = recipesData.map(recipe => ({
      ...recipe,
      createdAt: new Date(recipe.createdAt.$date),
      updatedAt: new Date(recipe.updatedAt.$date),
    }));

    // Check if recipes already exist
    for (const recipe of recipesToInsert) {
      const existing = await recipesCol.findOne({ slug: recipe.slug });
      if (existing) {
        console.log(`⏭️  Skipping "${recipe.title}" - already exists`);
        continue;
      }

      await recipesCol.insertOne(recipe);
      console.log(`✅ Imported: ${recipe.title}`);
    }

    console.log("\n🎉 Import completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   - Omelet Sosis Keju Jamur (COCOK dengan foto kulkas)");
    console.log("   - Salad Segar Alpukat Apel (COCOK dengan foto kulkas)");
    console.log("   - Rendang Daging Sapi Padang (TIDAK COCOK - untuk testing)");
    console.log("\n💡 Sekarang coba scan foto kulkas lagi!");

  } catch (error) {
    console.error("❌ Error importing recipes:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n👋 Connection closed");
  }
}

importRecipes();
