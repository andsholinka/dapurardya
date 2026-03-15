import { GoogleGenAI } from "@google/genai";
import type { RecipeDoc } from "@/types/recipe";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const genAI = new GoogleGenAI({ apiKey });

export interface AISuggestion {
  recipeSlug: string;
  matchScore: number;
  reason: string;
}

type SuggestionRecipe = Pick<RecipeDoc, "title" | "slug" | "ingredients">;

export async function getRecipeSuggestions(
  userIngredients: string[],
  availableRecipes: SuggestionRecipe[]
): Promise<AISuggestion[]> {
  if (!apiKey) {
    console.error("Chef AI Error: GEMINI_API_KEY belum dikonfigurasi.");
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

  try {
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const jsonText = (result.text || "").trim();
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is AISuggestion => {
        return (
          item &&
          typeof item.recipeSlug === "string" &&
          typeof item.matchScore === "number" &&
          typeof item.reason === "string"
        );
      })
      .slice(0, 3);
  } catch (error) {
    console.error(`Chef AI Error [${modelName}]:`, error);
    return [];
  }
}
