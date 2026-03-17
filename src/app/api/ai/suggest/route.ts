import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { getRecipeSuggestions } from "@/lib/gemini";
import { getMemberAIUsageStatus } from "@/lib/member-ai";
import { getFallbackRecipeSuggestions } from "@/lib/recipe-suggestion-fallback";
import { deductMemberCredits, recordCreditUsage } from "@/lib/member-credits";
import type { RecipeDoc } from "@/types/recipe";
import { apiError, logger } from "@/lib/logger";

// Cache saran AI — key: hash bahan+resep, value: { suggestions, expiresAt }
const aiCache = new Map<string, { suggestions: unknown[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

function makeCacheKey(ingredients: string[], recipeSlugs: string[]): string {
  const ing = [...ingredients].sort().join(",").toLowerCase();
  const slugs = recipeSlugs.slice(0, 20).join(","); // pakai 20 slug pertama sebagai fingerprint
  return `${ing}|${slugs}`;
}

function getCached(key: string): unknown[] | null {
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { aiCache.delete(key); return null; }
  return entry.suggestions;
}

function setCache(key: string, suggestions: unknown[]) {
  // Batasi ukuran cache agar tidak bocor memori
  if (aiCache.size > 200) {
    const firstKey = aiCache.keys().next().value;
    if (firstKey) aiCache.delete(firstKey);
  }
  aiCache.set(key, { suggestions, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Fitur Chef AI hanya untuk member. Silakan masuk atau daftar dulu.", code: "MEMBER_REQUIRED" },
        { status: 401 }
      );
    }

    const member = {
      id: session.id,
      name: session.name,
      email: session.email,
      credits: session.credits || (session.role === "admin" ? 999 : 0)
    };

    const { ingredients } = await request.json();
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Bahan-bahan diperlukan" }, { status: 400 });
    }

    const db = await getDb();
    const usageStatus = await getMemberAIUsageStatus(db, member.id);
    if (session.role !== "admin" && !usageStatus.canUseAI) {
      return NextResponse.json(
        {
          error: "Kamu tidak memiliki Credit yang cukup untuk menggunakan Chef AI. Silakan kumpulkan Credit atau Top Up paket Credits.",
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

    // Cek cache dulu sebelum panggil Gemini
    const cacheKey = makeCacheKey(ingredients, recipes.map((r: any) => r.slug));
    const cached = getCached(cacheKey);

    let result: unknown[];
    let usedRealAI = false;
    let fromCache = false;

    if (cached) {
      result = cached;
      fromCache = true;
      usedRealAI = true; // ✅ Cache berasal dari AI sebelumnya, jadi tetap dianggap dari AI
      logger.info(`[AI_SUGGEST] Using cached AI suggestions (${cached.length} results)`, "AI_SUGGEST");
      // Cache berasal dari AI sebelumnya — kredit sudah dipotong saat itu, jangan potong lagi
    } else {
      logger.info(`[AI_SUGGEST] Calling Gemini AI with ${ingredients.length} ingredients`, "AI_SUGGEST");
      const aiSuggestions = await getRecipeSuggestions(ingredients, recipes);
      usedRealAI = aiSuggestions.length > 0;
      
      logger.info(`[AI_SUGGEST] Gemini returned ${aiSuggestions.length} suggestions, usedRealAI: ${usedRealAI}`, "AI_SUGGEST");

      const suggestions =
        aiSuggestions.length > 0 ? aiSuggestions : getFallbackRecipeSuggestions(ingredients, recipes);
      
      if (aiSuggestions.length === 0) {
        logger.warn(`[AI_SUGGEST] Gemini failed, using fallback suggestions`, "AI_SUGGEST");
      }

      // Kalau fallback juga kosong, tampilkan 3 resep terbaru sebagai default
      const finalSuggestions = suggestions.length > 0
        ? suggestions
        : recipes.slice(0, 3).map((r: any) => ({
            recipeSlug: r.slug,
            matchScore: 0,
            reason: "Resep pilihan dari Dapur Ardya yang mungkin kamu suka.",
          }));

      result = finalSuggestions.map((s: any) => {
        const fullRecipe = recipes.find((r: any) => r.slug === s.recipeSlug);
        if (!fullRecipe) return null;
        return { ...fullRecipe, _id: fullRecipe._id.toString(), matchScore: s.matchScore, reason: s.reason };
      }).filter(Boolean);

      // Hanya cache kalau hasil dari AI (bukan fallback)
      if (usedRealAI) setCache(cacheKey, result);
    }

    // Potong kredit HANYA kalau hasil dari AI sungguhan (bukan cache, bukan fallback)
    if (member.id !== "admin" && usedRealAI && !fromCache) {
      const deducted = await deductMemberCredits(db, member.id, 1);
      if (!deducted) {
        return NextResponse.json({ error: "Gagal memproses Credit" }, { status: 500 });
      }
      await recordCreditUsage(db, member.id, {
        action: "ai_suggest",
        amount: 1,
        description: `Chef AI Suggestion with ${ingredients.length} ingredients`,
        metadata: { ingredientsCount: ingredients.length, suggestionsCount: result.length },
      });
    }
    const updatedStatus = await getMemberAIUsageStatus(db, member.id);
    return NextResponse.json({ suggestions: result, aiStatus: updatedStatus, fromAI: usedRealAI, fromCache });
  } catch (error) { return apiError("AI_SUGGEST", error, "Terjadi kesalahan pada AI"); }
}
