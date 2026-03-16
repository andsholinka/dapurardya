import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth-v2";

const COLLECTION = "recipes";
const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

async function getRecipes(searchParams: { q?: string; category?: string; page?: string }) {
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const page = Math.max(1, parseInt(searchParams.page || "1", 10));
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
    const [total, list] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    ]);
    return {
      recipes: list.map((r) => ({ ...r, _id: r._id?.toString() })) as (Recipe & { _id?: string })[],
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  } catch {
    return { recipes: [], total: 0, page: 1, totalPages: 1 };
  }
}

function buildUrl(params: Record<string, string | undefined>, page: number) {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.category) p.set("category", params.category);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return `/resep${qs ? `?${qs}` : ""}`;
}

export default async function ResepPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();
  const { recipes, total, page, totalPages } = await getRecipes(params);
  const isMember = !!session;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-4">Semua Resep</h1>
      <Suspense fallback={<div className="w-full max-w-md h-10 rounded-xl bg-muted animate-pulse" />}>
        <SearchBar />
      </Suspense>

      {params.q && (
        <p className="mt-3 text-sm text-muted-foreground">
          Hasil untuk &quot;{params.q}&quot; — {total} resep ditemukan
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={buildUrl(params, page - 1)}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
            >
              ← Sebelumnya
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-2">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl(params, page + 1)}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
            >
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
