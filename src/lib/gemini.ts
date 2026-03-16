import { GoogleGenAI } from "@google/genai";
import type { RecipeDoc } from "@/types/recipe";
import { logger } from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const genAI = new GoogleGenAI({ apiKey });

const TIMEOUT_MS = 20_000; // 20 detik
const MAX_RETRIES = 2;

export interface AISuggestion {
  recipeSlug: string;
  matchScore: number;
  reason: string;
}

type SuggestionRecipe = Pick<RecipeDoc, "title" | "slug" | "ingredients">;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function getRecipeSuggestions(
  userIngredients: string[],
  availableRecipes: SuggestionRecipe[]
): Promise<AISuggestion[]> {
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY belum dikonfigurasi", "GEMINI");
    return [];
  }

  const prompt = `
    Kamu adalah Chef AI dari "Dapur Ardya".
    Punya daftar resep di database:
    ${availableRecipes.map(r => `- ${r.title} (Slug: ${r.slug}): Bahan: ${r.ingredients.join(", ")}`).join("\n")}

    User punya bahan sisa: ${userIngredients.join(", ")}.

    Tugas:
    1. Pilih maksimal 3 resep yang paling cocok dengan bahan tersebut.
    2. Berikan skor kecocokan (0-100).
    3. Berikan alasan singkat dalam Bahasa Indonesia kenapa resep ini cocok.

    Format JSON Output:
    [
      { "recipeSlug": "slug-resep", "matchScore": 85, "reason": "Alasan singkat..." }
    ]
    Balas HANYA dengan JSON.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(
        genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.2 },
        }),
        TIMEOUT_MS
      );

      const jsonText = (result.text || "").trim();
      logger.info(`Gemini raw response: "${jsonText.slice(0, 200)}"`, "GEMINI");
      if (!jsonText) return [];

      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item): item is AISuggestion =>
          item &&
          typeof item.recipeSlug === "string" &&
          typeof item.matchScore === "number" &&
          typeof item.reason === "string"
        )
        .slice(0, 3);
    } catch (error) {
      const isLast = attempt === MAX_RETRIES;
      logger.warn(
        `Chef AI attempt ${attempt}/${MAX_RETRIES} failed${isLast ? " — using fallback" : ", retrying..."}`,
        "GEMINI",
        { error: error instanceof Error ? error.message : String(error), model: modelName }
      );
      if (isLast) return [];
      // Tunggu sebentar sebelum retry
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  return [];
}
