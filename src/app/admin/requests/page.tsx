import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { RecipeRequest, RecipeRequestDoc } from "@/types/recipe-request";
import { RequestList } from "@/components/RequestList";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

async function getRequests(): Promise<RecipeRequest[]> {
  try {
    const db = await getDb();
    const list = await db.collection<RecipeRequestDoc>("recipe_requests")
      .find({}).sort({ createdAt: -1 }).toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() })) as RecipeRequest[];
  } catch { return []; }
}

export default async function AdminRequestsPage() {
  const requests = await getRequests();
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-1 mb-4 inline-block")}>
        ← Kembali
      </Link>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Request Resep</h2>
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5">
            {pendingCount}
          </span>
        )}
      </div>
      <RequestList requests={requests} />
    </>
  );
}
