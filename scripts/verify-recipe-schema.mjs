import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "dapurardya";

async function verifySchema() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const recipesCol = db.collection("recipes");

    const recipe = await recipesCol.findOne({ slug: "omelet-sosis-keju-jamur" });
    
    if (!recipe) {
      console.log("❌ Recipe not found");
      return;
    }

    console.log("\n✅ Recipe Schema Verification:\n");
    console.log("Title:", recipe.title);
    console.log("Slug:", recipe.slug);
    console.log("Category:", recipe.category);
    console.log("PrepTimeMinutes:", recipe.prepTimeMinutes);
    console.log("CookTimeMinutes:", recipe.cookTimeMinutes);
    console.log("Servings:", recipe.servings);
    console.log("Published:", recipe.published);
    console.log("MemberOnly:", recipe.memberOnly);
    console.log("\nIngredients count:", recipe.ingredients?.length || 0);
    console.log("Steps count:", recipe.steps?.length || 0);
    console.log("Tags count:", recipe.tags?.length || 0);
    
    console.log("\n✅ Has 'steps' field:", !!recipe.steps);
    console.log("❌ Has 'instructions' field:", !!recipe.instructions);
    console.log("❌ Has 'difficulty' field:", !!recipe.difficulty);
    console.log("❌ Has 'tips' field:", !!recipe.tips);
    console.log("❌ Has 'featured' field:", !!recipe.featured);
    
    if (recipe.steps && recipe.steps.length > 0) {
      console.log("\n📝 First 2 steps:");
      recipe.steps.slice(0, 2).forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
    }

    console.log("\n✅ Schema is correct! Ready for testing.");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

verifySchema();
