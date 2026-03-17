import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { buttonVariants } from "@/lib/button-variants";
import { AdminRecipeCard } from "@/components/AdminRecipeCard";
import { AdminAnalytics } from "@/components/AdminAnalyticsLazy";
import { cn } from "@/lib/utils";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllRecipes(): Promise<(Recipe & { _id?: string })[]> {
  try {
    const db = await getDb();
    const list = await db.collection<RecipeDoc>("recipes").find({}).sort({ updatedAt: -1 }).toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() }));
  } catch { return []; }
}

async function getAnalytics() {
  try {
    const db = await getDb();

    const [totalRecipes, totalMembers, totalRequests, pendingRequests] = await Promise.all([
      db.collection("recipes").countDocuments({ published: true }),
      db.collection("members").countDocuments({}),
      db.collection("recipe_requests").countDocuments({}),
      db.collection("recipe_requests").countDocuments({ status: "pending" }),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const requestsByMonth = await db.collection("recipe_requests").aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).toArray();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = requestsByMonth.find((r) => r._id.year === year && r._id.month === month);
      chartData.push({ month: monthNames[month - 1], requests: found?.count ?? 0 });
    }

    return { totalRecipes, totalMembers, totalRequests, pendingRequests, chartData };
  } catch {
    return { totalRecipes: 0, totalMembers: 0, totalRequests: 0, pendingRequests: 0, chartData: [] };
  }
}

export default async function AdminPage() {
  const [recipes, analytics] = await Promise.all([getAllRecipes(), getAnalytics()]);

  return (
    <>
      <AdminAnalytics data={analytics} />

      <div className="flex items-center justify-between mb-6">
        <div />
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
