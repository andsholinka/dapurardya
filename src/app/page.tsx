import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { buttonVariants } from "@/lib/button-variants";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth-v2";
import { cn } from "@/lib/utils";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { RecipeCard } from "@/components/RecipeCard";
import { RequestModal } from "@/components/RequestModal";

// Force dynamic rendering for fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

const COLLECTION = "recipes";

export const metadata: Metadata = {
  title: "Dapur Ardya – Resep Masakan Mudah & Enak",
  description: "Kumpulan resep masakan yang mudah diikuti dan enak. Gratis untuk semua. Temukan resep favoritmu di Dapur Ardya.",
  openGraph: {
    title: "Dapur Ardya – Resep Masakan Mudah & Enak",
    description: "Kumpulan resep masakan yang mudah diikuti dan enak. Gratis untuk semua.",
    type: "website",
  },
};


async function getFeaturedRecipes(): Promise<(Recipe & { _id?: string })[]> {
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const recipes = await col.find({ published: true }).sort({ updatedAt: -1 }).limit(6).toArray();

    if (recipes.length === 0) return [];

    const ids = recipes.map((r) => r._id!.toString());
    const ratings = await db.collection("recipe_ratings").aggregate([
      { $match: { recipeId: { $in: ids } } },
      { $group: { _id: "$recipeId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();

    const ratingMap = new Map(ratings.map((r) => [r._id, { avg: Math.round(r.avg * 10) / 10, count: r.count }]));

    return recipes.map((r) => {
      const rid = r._id?.toString();
      const rdata = rid ? ratingMap.get(rid) : undefined;
      return { ...r, _id: rid, avgRating: rdata?.avg ?? 0, ratingCount: rdata?.count ?? 0 };
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [recipes, session] = await Promise.all([getFeaturedRecipes(), getSession()]);
  const isMember = !!session;
  const member = session;


  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-12">
      <section className="text-center py-8 md:py-12">
        <Link 
          href="/kulkas"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 text-primary text-xs font-semibold border border-primary/20 hover:scale-105 transition-all shadow-sm mb-6 animate-pulse"
        >
          <Sparkles className="size-3 shrink-0" />
          <span>Baru: AI dari Kulkasmu</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Dapur Ardya
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Kumpulan resep masakan yang mudah diikuti dan enak.<br className="hidden sm:block" /> Gratis untuk semua.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-md mx-auto">
          <Link 
            href="/resep" 
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "rounded-xl px-2 sm:px-8 text-[11px] sm:text-sm whitespace-nowrap shadow-md")}
          >
            Lihat Semua Resep
          </Link>
          {member ? (
            <RequestModal memberId={member.id} memberName={member.name} size="lg" className="w-full text-[11px] sm:text-sm shadow-sm" />
          ) : (
            <Link 
              href="/member/auth?tab=register" 
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl px-2 sm:px-8 text-[11px] sm:text-sm whitespace-nowrap shadow-sm")}
            >
              Request Resep
            </Link>
          )}
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
              <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} isMember={isMember} />
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
    </div>
  );
}
