import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getRecipeSuggestions } from "@/lib/gemini";
import { getMemberAIUsageStatus } from "@/lib/member-ai";
import { getFallbackRecipeSuggestions } from "@/lib/recipe-suggestion-fallback";
import { deductMemberCredit, recordCreditUsage } from "@/lib/member-credits";
import type { RecipeDoc } from "@/types/recipe";

export async function POST(request: NextRequest) {
  try {
    let member = await getMemberSession();
    
    // If not member, check admin
    if (!member) {
      const { getAdminSession } = await import("@/lib/auth");
      const isAdmin = await getAdminSession();
      if (isAdmin) {
        member = {
          id: "admin",
          name: "Admin",
          email: "admin@dapurardya.com",
          credits: 999
        };
      }
    }

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
    const usageStatus = await getMemberAIUsageStatus(db, member.id);
    if (!usageStatus.canUseAI) {
      return NextResponse.json(
        {
          error: "Kamu tidak memiliki Credit yang cukup untuk menggunakan Chef AI. Silakan kumpulkan Credit atau beli paket premium.",
          code: "AI_QUOTA_EXCEEDED",
          aiStatus: usageStatus,
        },
        { status: 403 }
      );
    }

    // Ambil resep yang dipublikasi
    const recipes = (await db.collection<RecipeDoc>("recipes")
      .find({ published: true })
      .project({ title: 1, slug: 1, ingredients: 1, image: 1, category: 1, servings: 1 })
      .toArray()) as any[];

    if (recipes.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const aiSuggestions = await getRecipeSuggestions(ingredients, recipes);
    const suggestions =
      aiSuggestions.length > 0 ? aiSuggestions : getFallbackRecipeSuggestions(ingredients, recipes);

    if (member.id !== "admin") {
      const deducted = await deductMemberCredit(db, member.id);
      if (!deducted) {
         return NextResponse.json({ error: "Gagal memproses Credit" }, { status: 500 });
      }

      await recordCreditUsage(db, member.id, {
        action: "ai_suggest",
        amount: 1,
        description: `Chef AI Suggestion with ${ingredients.length} ingredients`,
        metadata: {
          ingredientsCount: ingredients.length,
          suggestionsCount: suggestions.length,
        },
      });
    }
    const updatedStatus = await getMemberAIUsageStatus(db, member.id);

    // Gabungkan data resep lengkap dengan saran AI
    const result = suggestions.map((s: any) => {
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
