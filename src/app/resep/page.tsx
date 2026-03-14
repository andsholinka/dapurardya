import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { getDb } from "@/lib/mongodb";
import { getMemberSession, getAdminSession } from "@/lib/auth";

const COLLECTION = "recipes";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function getRecipes(searchParams: { q?: string; category?: string }): Promise<(Recipe & { _id?: string })[]> {
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const filter: Record<string, unknown> = { published: true };
    const q = searchParams.q?.trim();
    const category = searchParams.category?.trim();
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { ingredients: { $elemMatch: { $regex: q, $options: "i" } } },
      ];
    }
    const list = await col.find(filter).sort({ updatedAt: -1 }).toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() }));
  } catch {
    return [];
  }
}

function SearchBarFallback() {
  return (
    <div className="w-full max-w-md h-10 rounded-xl bg-muted animate-pulse" />
  );
}

export default async function ResepPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [recipes, member, isAdmin] = await Promise.all([getRecipes(params), getMemberSession(), getAdminSession()]);
  const isMember = !!member || isAdmin;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-4">Semua Resep</h1>
      <Suspense fallback={<SearchBarFallback />}>
        <SearchBar />
      </Suspense>
      {params.q && (
        <p className="mt-3 text-sm text-muted-foreground">
          Hasil untuk &quot;{params.q}&quot;
        </p>
      )}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} isMember={isMember} />
        ))}
      </div>
      {recipes.length === 0 && (
        <p className="text-muted-foreground py-12 text-center">
          Tidak ada resep yang cocok.
        </p>
      )}
    </div>
  );
}
