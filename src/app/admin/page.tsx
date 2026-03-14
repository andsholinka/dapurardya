import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import type { RecipeRequest, RecipeRequestDoc } from "@/types/recipe-request";
import { buttonVariants } from "@/lib/button-variants";
import { AdminRecipeCard } from "@/components/AdminRecipeCard";
import { RequestList } from "@/components/RequestList";
import { cn } from "@/lib/utils";

const COLLECTION = "recipes";
const REQ_COLLECTION = "recipe_requests";

async function getAllRecipes(): Promise<(Recipe & { _id?: string })[]> {
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const list = await col.find({}).sort({ updatedAt: -1 }).toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() }));
  } catch {
    return [];
  }
}

async function getRequests(): Promise<RecipeRequest[]> {
  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(REQ_COLLECTION);
    const list = await col.find({}).sort({ createdAt: -1 }).toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() })) as RecipeRequest[];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const [recipes, requests] = await Promise.all([getAllRecipes(), getRequests()]);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Link href="/admin/resep/new" className={cn(buttonVariants(), "rounded-xl")}>
          + Tambah Resep
        </Link>
      </div>

      {/* Request Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Request Resep
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5">
              {pendingCount}
            </span>
          )}
        </h2>
        <RequestList requests={requests} />
      </div>

      {/* Recipes Section */}
      <h2 className="text-lg font-semibold mb-3">Resep</h2>
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
