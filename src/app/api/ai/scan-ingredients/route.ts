import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { scanImageForIngredients, getRecipeSuggestionsWithNutrition } from "@/lib/gemini-vision";
import { logger, apiError } from "@/lib/logger";

const SCAN_CREDIT_COST = 2;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image } = await req.json();
    
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image data required" }, { status: 400 });
    }

    const db = await getDb();
    const membersCol = db.collection("members");
    const member = await membersCol.findOne({ email: session.email });
    
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check credits
    const credits = member.credits ?? 0;
    const isAdmin = session.role === "admin";
    
    if (!isAdmin && credits < SCAN_CREDIT_COST) {
      return NextResponse.json(
        { 
          error: "Credit tidak cukup untuk scan. Butuh 2 credit.",
          aiStatus: { credits, canUseAI: false }
        },
        { status: 403 }
      );
    }

    // Scan image for ingredients
    logger.info("Scanning image for ingredients", "SCAN_AI", { memberId: member._id });
    const detectedIngredients = await scanImageForIngredients(image);
    
    if (detectedIngredients.length === 0) {
      return NextResponse.json({
        ingredients: [],
        recipes: [],
        message: "Tidak ada bahan yang terdeteksi. Coba foto yang lebih jelas.",
      });
    }

    // Get recipe suggestions with nutrition info
    const ingredientNames = detectedIngredients.map((ing: { name: string }) => ing.name);
    const recipesCol = db.collection("recipes");
    const allRecipes = await recipesCol
      .find({ published: true })
      .project({ title: 1, slug: 1, ingredients: 1, description: 1, image: 1, images: 1, category: 1, servings: 1 })
      .toArray();

    const suggestions = await getRecipeSuggestionsWithNutrition(ingredientNames, allRecipes);
    
    // Deduct credits (admin tidak dipotong)
    if (!isAdmin) {
      await membersCol.updateOne(
        { _id: member._id },
        { $inc: { credits: -SCAN_CREDIT_COST } }
      );
    }

    const newCredits = isAdmin ? credits : credits - SCAN_CREDIT_COST;
    
    logger.info("Scan completed successfully", "SCAN_AI", {
      memberId: member._id,
      ingredientsFound: detectedIngredients.length,
      recipesFound: suggestions.length,
      creditsRemaining: newCredits,
    });

    return NextResponse.json({
      ingredients: detectedIngredients,
      recipes: suggestions,
      aiStatus: {
        credits: newCredits,
        canUseAI: isAdmin || newCredits >= SCAN_CREDIT_COST,
      },
    });
  } catch (error) {
    return apiError("SCAN_AI", error, "Gagal memindai gambar. Coba lagi.");
  }
}
