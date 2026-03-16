import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { RecipeDoc, Recipe } from "@/types/recipe";
import { RecipeCard } from "@/components/RecipeCard";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Resep Tersimpan – Dapur Ardya" };

async function getSavedRecipes(memberId: string): Promise<(Recipe & { _id: string })[]> {
  try {
    const db = await getDb();
    const bookmark = await db.collection("member_bookmarks").findOne({ memberId });
    const ids: string[] = bookmark?.recipeIds ?? [];
    if (ids.length === 0) return [];

    const objectIds = ids.map((id) => {
      try { return new ObjectId(id); } catch { return null; }
    }).filter(Boolean) as ObjectId[];

    const docs = await db.collection<RecipeDoc>("recipes")
      .find({ _id: { $in: objectIds }, published: true })
      .toArray();

    return docs.map((d) => ({ ...d, _id: d._id!.toString() })) as (Recipe & { _id: string })[];
  } catch { return []; }
}

export default async function SavedPage() {
  const session = await getSession();
  if (!session) redirect("/member/auth?tab=login");

  const recipes = await getSavedRecipes(session.id);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/member" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-1")}>
          ← Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Resep Tersimpan</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {recipes.length > 0 ? `${recipes.length} resep tersimpan` : "Belum ada resep yang disimpan"}
      </p>

      {recipes.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🔖</p>
          <p className="text-muted-foreground">Kamu belum menyimpan resep apapun.</p>
          <Link href="/resep" className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl mt-2")}>
            Jelajahi Resep
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((r) => (
            <RecipeCard key={r._id} recipe={r} isMember={true} />
          ))}
        </div>
      )}
    </div>
  );
}
