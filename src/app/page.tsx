import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { getDb } from "@/lib/mongodb";
import { cn } from "@/lib/utils";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { RecipeCard } from "@/components/RecipeCard";
import { RequestForm } from "@/components/RequestForm";

const COLLECTION = "recipes";

async function getFeaturedRecipes(): Promise<(Recipe & { _id?: string })[]> {
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const list = await col
      .find({ published: true })
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const recipes = await getFeaturedRecipes();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-12">
      <section className="text-center py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Dapur Ardya
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Kumpulan resep masakan yang mudah diikuti dan enak. Gratis untuk semua.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/resep" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
            Lihat Semua Resep
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Resep Terbaru
        </h2>
        {recipes.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            Belum ada resep. Nantikan resep-resep lezat dari Dapur Ardya!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} />
            ))}
          </div>
        )}
        {recipes.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/resep" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>
              Lihat Semua Resep
            </Link>
          </div>
        )}
      </section>

      <section className="mt-12">
        <RequestForm />
      </section>
    </div>
  );
}
