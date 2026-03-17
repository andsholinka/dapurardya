import { GoogleGenAI } from "@google/genai";
import { logger } from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "";
const visionModelName = process.env.GEMINI_VISION_MODEL || "";
const genAI = new GoogleGenAI({ apiKey });

const TIMEOUT_MS = 30_000; // 30 detik untuk vision
const MAX_RETRIES = 2;

interface DetectedIngredient {
  name: string;
  confidence: number;
}

interface RecipeSuggestionWithNutrition {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  category: string;
  servings?: number;
  matchScore: number;
  reason: string;
  estimatedCalories?: number;
  nutritionInfo?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Scan image and detect ingredients using Gemini Vision
 */
export async function scanImageForIngredients(imageBase64: string): Promise<DetectedIngredient[]> {
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not configured", "GEMINI_VISION");
    return [];
  }

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `
    Kamu adalah AI vision expert dari "Dapur Ardya".
    Analisis foto ini dan deteksi semua bahan makanan yang terlihat.
    
    Tugas:
    1. Identifikasi semua bahan makanan (sayuran, buah, daging, bumbu, dll)
    2. Berikan confidence score (0.0 - 1.0) untuk setiap bahan
    3. Gunakan nama bahan dalam Bahasa Indonesia
    4. Hanya deteksi bahan yang jelas terlihat (confidence > 0.6)
    
    Format Output (JSON array):
    [
      { "name": "Tomat", "confidence": 0.95 },
      { "name": "Bawang Merah", "confidence": 0.88 }
    ]
    
    PENTING: Balas HANYA dengan JSON array, tanpa teks tambahan.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(
        genAI.models.generateContent({
          model: visionModelName,
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: { 
            temperature: 0.3,
          },
        }),
        TIMEOUT_MS
      );

      let jsonText = (result.text || "").trim();
      logger.info(`Gemini Vision response: "${jsonText.slice(0, 200)}"`, "GEMINI_VISION");
      
      if (!jsonText) return [];

      // Clean up response - remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item): item is DetectedIngredient =>
          item &&
          typeof item.name === "string" &&
          typeof item.confidence === "number" &&
          item.confidence > 0.6
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 15); // Max 15 ingredients
    } catch (error) {
      const isLast = attempt === MAX_RETRIES;
      logger.warn(
        `Vision scan attempt ${attempt}/${MAX_RETRIES} failed${isLast ? " — returning empty" : ", retrying..."}`,
        "GEMINI_VISION",
        { error: error instanceof Error ? error.message : String(error) }
      );
      if (isLast) return [];
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return [];
}

/**
 * Get recipe suggestions with nutrition information
 */
export async function getRecipeSuggestionsWithNutrition(
  userIngredients: string[],
  availableRecipes: any[]
): Promise<RecipeSuggestionWithNutrition[]> {
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not configured", "GEMINI_VISION");
    return [];
  }

  const prompt = `
    Kamu adalah Chef AI dari "Dapur Ardya" dengan expertise nutrisi.
    
    Daftar resep di database:
    ${availableRecipes.map(r => `- ${r.title} (Slug: ${r.slug}): Bahan: ${r.ingredients.join(", ")}`).join("\n")}

    User punya bahan: ${userIngredients.join(", ")}.

    Tugas:
    1. Pilih maksimal 3 resep yang paling cocok
    2. Berikan skor kecocokan (0-100)
    3. Berikan alasan singkat dalam Bahasa Indonesia
    4. Estimasi total kalori per porsi
    5. Estimasi makronutrien (protein, karbohidrat, lemak dalam gram)

    Format Output (JSON array):
    [
      {
        "recipeSlug": "slug-resep",
        "matchScore": 85,
        "reason": "Alasan singkat...",
        "estimatedCalories": 450,
        "nutritionInfo": {
          "protein": 25,
          "carbs": 50,
          "fat": 15
        }
      }
    ]
    
    PENTING: Balas HANYA dengan JSON array, tanpa teks tambahan.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(
        genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { 
            temperature: 0.2,
          },
        }),
        TIMEOUT_MS
      );

      let jsonText = (result.text || "").trim();
      logger.info(`Gemini nutrition response: "${jsonText.slice(0, 200)}"`, "GEMINI_VISION");
      
      if (!jsonText) return [];

      // Clean up response - remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) return [];

      // Map to full recipe objects
      const suggestions: RecipeSuggestionWithNutrition[] = [];
      
      logger.info(`Mapping ${parsed.length} AI suggestions to recipes`, "GEMINI_VISION", {
        aiSlugs: parsed.map((p: any) => p.recipeSlug),
        availableCount: availableRecipes.length,
      });
      
      for (const item of parsed.slice(0, 3)) {
        const recipe = availableRecipes.find(r => r.slug === item.recipeSlug);
        if (recipe) {
          suggestions.push({
            _id: recipe._id?.toString() || recipe._id,
            title: recipe.title,
            slug: recipe.slug,
            description: recipe.description || "",
            image: recipe.image,
            images: recipe.images,
            category: recipe.category || "",
            servings: recipe.servings,
            matchScore: item.matchScore || 0,
            reason: item.reason || "",
            estimatedCalories: item.estimatedCalories,
            nutritionInfo: item.nutritionInfo,
          });
          logger.info(`Matched recipe: ${recipe.slug}`, "GEMINI_VISION");
        } else {
          logger.warn(`Recipe not found in database: ${item.recipeSlug}`, "GEMINI_VISION");
        }
      }

      logger.info(`Final suggestions count: ${suggestions.length}`, "GEMINI_VISION");
      return suggestions;
    } catch (error) {
      const isLast = attempt === MAX_RETRIES;
      logger.warn(
        `Nutrition suggestion attempt ${attempt}/${MAX_RETRIES} failed${isLast ? " — returning empty" : ", retrying..."}`,
        "GEMINI_VISION",
        { error: error instanceof Error ? error.message : String(error) }
      );
      if (isLast) return [];
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return [];
}

/**
 * Chat with Chef AI about a specific recipe
 */
export async function chatWithChefAI(
  recipe: any,
  userMessage: string,
  history: Array<{ role: string; content: string }>
): Promise<string> {
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not configured", "GEMINI_VISION");
    return "Maaf, Chef AI sedang tidak tersedia.";
  }

  const recipeContext = `
    Resep: ${recipe.title}
    Deskripsi: ${recipe.description || ""}
    Bahan: ${recipe.ingredients?.join(", ") || ""}
    Langkah: ${recipe.steps?.join(" ") || ""}
    Porsi: ${recipe.servings || "tidak disebutkan"}
    Kategori: ${recipe.category || ""}
  `;

  const conversationHistory = history
    .map(msg => `${msg.role === "user" ? "User" : "Chef AI"}: ${msg.content}`)
    .join("\n");

  const prompt = `
    Kamu adalah Chef AI dari "Dapur Ardya" yang ramah, natural, dan helpful.
    Kamu sedang membantu user memasak resep berikut:
    
    ${recipeContext}
    
    Riwayat percakapan:
    ${conversationHistory}
    
    User bertanya: ${userMessage}
    
    PENTING - Cara menjawab:
    1. Langsung jawab pertanyaan tanpa basa-basi seperti "Wah, pertanyaan bagus!"
    2. Gunakan bahasa natural dan bervariasi, jangan repetitif
    3. Berikan panduan step-by-step jika diminta
    4. Berikan tips praktis yang berguna
    5. Jika user bertanya di luar konteks resep, arahkan kembali ke resep dengan natural
    6. Jawab dalam 2-4 kalimat yang informatif dan to-the-point
    
    Contoh jawaban yang BAIK:
    - "Untuk omelet yang lembut, gunakan api kecil dan jangan terlalu lama memasak. Tambahkan sedikit susu agar teksturnya lebih creamy."
    - "Kamu bisa ganti keju cheddar dengan keju mozzarella atau keju parmesan sesuai selera."
    
    Contoh jawaban yang BURUK (jangan seperti ini):
    - "Wah, pertanyaan yang sangat bagus! Untuk omelet yang lembut..."
    - "Pertanyaan bagus sekali! Kamu bisa ganti keju..."
  `;

  try {
    const result = await withTimeout(
      genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { temperature: 0.7 },
      }),
      TIMEOUT_MS
    );

    const reply = (result.text || "").trim();
    logger.info("Chef AI chat reply generated", "GEMINI_VISION", { replyLength: reply.length });
    
    return reply || "Maaf, saya tidak bisa menjawab sekarang. Coba tanya lagi.";
  } catch (error) {
    logger.error("Error in chatWithChefAI", "GEMINI_VISION", { error });
    return "Maaf, saya sedang sibuk di dapur. Coba tanya lagi nanti ya!";
  }
}
