import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/logger";

const apiKey = process.env.GEMINI_IMAGE_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Nano Banana = gemini-2.5-flash-image, $0.039/image
const IMAGE_MODEL = "gemini-2.5-flash-image";
const TIMEOUT_MS = 60_000;

export type IconPerspective =
  | "isometric"
  | "front"
  | "back"
  | "side"
  | "three-quarter"
  | "top-down";

const PERSPECTIVE_PROMPTS: Record<IconPerspective, string> = {
  isometric: "isometric 3D view, 45-degree angle, slight elevation",
  front: "front facing view, straight on, eye level",
  back: "back facing view, rear angle",
  side: "side facing view, profile angle, 90 degrees",
  "three-quarter": "three-quarter view, 30-degree angle, slightly elevated",
  "top-down": "top down view, bird's eye perspective, overhead",
};

const BASE_STYLE = [
  "highly detailed 3D render",
  "realistic materials and textures",
  "natural soft lighting with subtle shadows",
  "clean pure white background",
  "centered composition, square format",
  "photorealistic quality, octane render style",
  "sharp details, high resolution",
  "no text, no letters, no watermark",
].join(", ");

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Imagen timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

async function callGeminiWithRetry(params: Parameters<typeof genAI.models.generateContent>[0]) {
  try {
    return await withTimeout(genAI.models.generateContent(params), TIMEOUT_MS);
  } catch (err: any) {
    if (err?.cause?.code === "ECONNRESET" || err?.message?.includes("fetch failed")) {
      logger.info("Retrying after network error...", "IMAGEN");
      await new Promise((r) => setTimeout(r, 2000));
      return await withTimeout(genAI.models.generateContent(params), TIMEOUT_MS);
    }
    throw err;
  }
}

export async function generateIcon(
  prompt: string,
  perspective: IconPerspective = "isometric",
  referenceImageBase64?: string,
  referenceImageMimeType?: string
): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_IMAGE_API_KEY belum dikonfigurasi");

  const perspectivePrompt = PERSPECTIVE_PROMPTS[perspective];
  const extraDesc = prompt.trim() ? ` Additional styling: ${prompt.trim()}.` : "";
  const fullPrompt = referenceImageBase64
    ? `Look at this reference photo carefully. Convert every person in it into a 3D chibi figurine character while STRICTLY preserving:
- Their exact pose, body position, and posture from the photo
- Their exact facing direction (if facing right in photo, face right in output; if facing left, face left)
- Their exact position relative to each other (who is standing where, who is in front/behind)
- Their exact facial features, skin tone, eye shape
- Their exact hairstyle and hair color
- Their exact outfit: every clothing item, color, pattern, accessories (suit, dress, hijab, bouquet, etc.)
Style requirements:
- Chibi proportions: large round head, big expressive eyes with highlights, small nose
- Smooth matte plastic material, subtle soft shading, gentle ambient occlusion
- Soft warm studio lighting, light gray or white gradient background
- Full body visible, high quality 3D CGI render, sharp details
- No text, no watermark${extraDesc}`
    : `A ${perspectivePrompt} 3D render of: ${prompt.trim()}. ${BASE_STYLE}`;

  const contents: any = referenceImageBase64
    ? [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: referenceImageMimeType || "image/jpeg", data: referenceImageBase64 } },
            { text: fullPrompt },
          ],
        },
      ]
    : fullPrompt;

  const response = await callGeminiWithRetry({
      model: IMAGE_MODEL,
      contents,
      config: {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 1,
      },
    });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));

  if (!imagePart?.inlineData?.data) {
    throw new Error("Model tidak menghasilkan gambar. Coba deskripsi yang berbeda.");
  }

  const { data: imageBytes, mimeType } = imagePart.inlineData;
  const dataUri = `data:${mimeType};base64,${imageBytes}`;

  const cropMode = referenceImageBase64 ? "pad" : "fill";
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: "ardya-icons",
    transformation: [{ width: 512, height: 512, crop: cropMode, background: "white" }],
  });

  logger.info(`Icon generated: ${uploaded.secure_url} [${perspective}]`, "IMAGEN");
  return uploaded.secure_url;
}
