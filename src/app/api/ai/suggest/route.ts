import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getRecipeSuggestions } from "@/lib/gemini";
import { getMemberAIUsageStatus, recordMemberAIUsage } from "@/lib/member-ai";
import { getFallbackRecipeSuggestions } from "@/lib/recipe-suggestion-fallback";
import type { RecipeDoc } from "@/types/recipe";

export async function POST(request: NextRequest) {
  try {
    const member = await getMemberSession();
    if (!member) {
      return NextResponse.json(
        { error: "Fitur Chef AI hanya untuk member. Silakan masuk atau daftar dulu.", code: "MEMBER_REQUIRED" },
        { status: 401 }
      );
    }

    const { ingredients } = await request.json();
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Bahan-bahan diperlukan" }, { status: 400 });
    }

    const db = await getDb();
    const usageStatus = await getMemberAIUsageStatus(db, member.id, member.aiPlan);
    if (!usageStatus.canUseAI) {
      return NextResponse.json(
        {
          error: "Kuota Chef AI mingguan kamu sudah habis. Upgrade paket berbayar untuk akses lebih banyak.",
          code: "AI_QUOTA_EXCEEDED",
          aiStatus: usageStatus,
        },
        { status: 403 }
      );
    }

    // Ambil resep yang dipublikasi
    const recipes = await db.collection<RecipeDoc>("recipes")
      .find({ published: true })
      .project({ title: 1, slug: 1, ingredients: 1, image: 1, category: 1, servings: 1 })
      .toArray();

    if (recipes.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const aiSuggestions = await getRecipeSuggestions(ingredients, recipes);
    const suggestions =
      aiSuggestions.length > 0 ? aiSuggestions : getFallbackRecipeSuggestions(ingredients, recipes);

    await recordMemberAIUsage(db, member.id, {
      ingredientsCount: ingredients.length,
      suggestionsCount: suggestions.length,
    });
    const updatedStatus = await getMemberAIUsageStatus(db, member.id, member.aiPlan);

    // Gabungkan data resep lengkap dengan saran AI
    const result = suggestions.map(s => {
      const fullRecipe = recipes.find(r => r.slug === s.recipeSlug);
      if (!fullRecipe) return null;
      return {
        ...fullRecipe,
        _id: fullRecipe._id.toString(),
        matchScore: s.matchScore,
        reason: s.reason
      };
    }).filter(Boolean);

    return NextResponse.json({ suggestions: result, aiStatus: updatedStatus });
  } catch (error) {
    console.error("[AI_SUGGEST_API]", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada AI" }, { status: 500 });
  }
}
