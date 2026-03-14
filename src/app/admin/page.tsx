import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import type { RecipeRequestDoc } from "@/types/recipe-request";
import { buttonVariants } from "@/lib/button-variants";
import { AdminRecipeCard } from "@/components/AdminRecipeCard";
import { cn } from "@/lib/utils";

async function getAllRecipes(): Promise<(Recipe & { _id?: string })[]> {
  try {
    const db = await getDb();
    const list = await db.collection<RecipeDoc>("recipes").find({}).sort({ updatedAt: -1 }).toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() }));
  } catch { return []; }
}

async function getPendingCount(): Promise<number> {
  try {
    const db = await getDb();
    return db.collection<RecipeRequestDoc>("recipe_requests").countDocuments({ status: "pending" });
  } catch { return 0; }
}

export default async function AdminPage() {
  const [recipes, pendingCount] = await Promise.all([getAllRecipes(), getPendingCount()]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/requests" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl relative")}>
          Request Resep
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5">
              {pendingCount}
            </span>
          )}
        </Link>
        <Link href="/admin/resep/new" className={cn(buttonVariants(), "rounded-xl")}>
          + Tambah Resep
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          Belum ada resep. <Link href="/admin/resep/new" className="text-primary underline">Tambah resep pertama</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <AdminRecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </>
  );
}
