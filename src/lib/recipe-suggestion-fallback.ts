import type { RecipeDoc } from "@/types/recipe";
import type { AISuggestion } from "@/lib/gemini";

type SuggestionRecipe = Pick<RecipeDoc, "title" | "slug" | "ingredients">;

export function getFallbackRecipeSuggestions(
  userIngredients: string[],
  availableRecipes: SuggestionRecipe[]
): AISuggestion[] {
  const normalizedUserIngredients = uniqueStrings(userIngredients.map(normalizeIngredient)).filter(Boolean);
  if (normalizedUserIngredients.length === 0) return [];

  return availableRecipes
    .map((recipe) => scoreRecipeAgainstIngredients(recipe, normalizedUserIngredients))
    .filter((item): item is AISuggestion => Boolean(item))
    .sort((first, second) => second.matchScore - first.matchScore)
    .slice(0, 3);
}

function scoreRecipeAgainstIngredients(
  recipe: SuggestionRecipe,
  normalizedUserIngredients: string[]
): AISuggestion | null {
  const normalizedRecipeIngredients = uniqueStrings(recipe.ingredients.map(normalizeIngredient)).filter(Boolean);
  if (normalizedRecipeIngredients.length === 0) return null;

  const matchedIngredients = normalizedUserIngredients.filter((userIngredient) =>
    normalizedRecipeIngredients.some((recipeIngredient) => ingredientsMatch(userIngredient, recipeIngredient))
  );

  if (matchedIngredients.length === 0) return null;

  const ingredientCoverage = matchedIngredients.length / normalizedUserIngredients.length;
  const recipeCoverage =
    normalizedRecipeIngredients.filter((recipeIngredient) =>
      normalizedUserIngredients.some((userIngredient) => ingredientsMatch(userIngredient, recipeIngredient))
    ).length / normalizedRecipeIngredients.length;

  const matchScore = Math.max(
    1,
    Math.min(100, Math.round(ingredientCoverage * 75 + recipeCoverage * 25))
  );

  return {
    recipeSlug: recipe.slug,
    matchScore,
    reason: buildReason(matchedIngredients, normalizedUserIngredients.length),
  };
}

function buildReason(matchedIngredients: string[], totalUserIngredients: number) {
  const prettyMatches = matchedIngredients.slice(0, 3).join(", ");
  const coverageText =
    matchedIngredients.length === totalUserIngredients
      ? "Semua bahanmu terpakai di resep ini."
      : `${matchedIngredients.length} dari ${totalUserIngredients} bahanmu cocok untuk resep ini.`;

  return prettyMatches
    ? `Cocok karena ada bahan ${prettyMatches}. ${coverageText}`
    : coverageText;
}

function ingredientsMatch(userIngredient: string, recipeIngredient: string) {
  return (
    userIngredient === recipeIngredient ||
    recipeIngredient.includes(userIngredient) ||
    userIngredient.includes(recipeIngredient)
  );
}

function normalizeIngredient(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}
