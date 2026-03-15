import type { RecipeImageAsset } from "@/types/recipe";
import { normalizeRecipeImageAsset } from "@/lib/recipe-gallery";

export function getRecipeImageStyles(image?: Partial<RecipeImageAsset> | null) {
  const normalized = normalizeRecipeImageAsset(image);
  if (!normalized) return undefined;
  const bounds = getRecipeImageBounds(normalized);
  const translateX = bounds.maxTranslateX * ((normalized.offsetX ?? 0) / 100);
  const translateY = bounds.maxTranslateY * ((normalized.offsetY ?? 0) / 100);

  return {
    objectPosition: "center",
    transform: `translate3d(${translateX}%, ${translateY}%, 0) scale(${normalized.zoom})`,
    transformOrigin: "center",
    willChange: "transform",
  } as const;
}

export function getRecipeImageBounds(image?: Partial<RecipeImageAsset> | null) {
  const normalized = normalizeRecipeImageAsset(image);
  if (!normalized || !normalized.width || !normalized.height) {
    return { maxTranslateX: 0, maxTranslateY: 0 };
  }

  const aspectRatio = normalized.width / normalized.height;
  const baseWidth = Math.max(1, aspectRatio);
  const baseHeight = Math.max(1, 1 / aspectRatio);
  const scaledWidth = baseWidth * (normalized.zoom ?? 1);
  const scaledHeight = baseHeight * (normalized.zoom ?? 1);

  return {
    maxTranslateX: Math.max(0, (scaledWidth - 1) * 50),
    maxTranslateY: Math.max(0, (scaledHeight - 1) * 50),
  };
}
