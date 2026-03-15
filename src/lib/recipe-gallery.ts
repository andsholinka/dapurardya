import type { RecipeImageAsset } from "@/types/recipe";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const MIN_OFFSET = -100;
const MAX_OFFSET = 100;

export function normalizeRecipeImageAsset(
  image: Partial<RecipeImageAsset> | null | undefined
): RecipeImageAsset | null {
  const url = image?.url?.trim();
  if (!url) return null;

  return {
    url,
    zoom: clampNumber(image.zoom, MIN_ZOOM, MAX_ZOOM, 1),
    offsetX: clampNumber(image.offsetX, MIN_OFFSET, MAX_OFFSET, 0),
    offsetY: clampNumber(image.offsetY, MIN_OFFSET, MAX_OFFSET, 0),
    width: clampDimension(image.width),
    height: clampDimension(image.height),
  };
}

export function normalizeRecipeGallery(
  gallery?: Partial<RecipeImageAsset>[],
  images?: string[],
  image?: string
) {
  if (Array.isArray(gallery) && gallery.length > 0) {
    return gallery
      .map((item) => normalizeRecipeImageAsset(item))
      .filter((item): item is RecipeImageAsset => Boolean(item));
  }

  const legacyImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : [];

  return legacyImages
    .map((url) => normalizeRecipeImageAsset({ url }))
    .filter((item): item is RecipeImageAsset => Boolean(item));
}

export function getLegacyRecipeImagesFromGallery(gallery?: Partial<RecipeImageAsset>[]) {
  return normalizeRecipeGallery(gallery).map((item) => item.url);
}

export function getPrimaryRecipeImageAsset(
  gallery?: Partial<RecipeImageAsset>[],
  images?: string[],
  image?: string
) {
  return normalizeRecipeGallery(gallery, images, image)[0] ?? null;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampDimension(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return undefined;
  return value;
}
