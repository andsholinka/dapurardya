import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { RecipeRequest, RecipeRequestDoc } from "@/types/recipe-request";
import { RequestList } from "@/components/RequestList";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

async function getRequests(page: number, status?: string): Promise<{ requests: RecipeRequest[]; total: number }> {
  try {
    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    const [total, list] = await Promise.all([
      db.collection("recipe_requests").countDocuments(filter),
      db.collection<RecipeRequestDoc>("recipe_requests")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .toArray(),
    ]);

    return {
      requests: list.map((r) => ({ ...r, _id: r._id?.toString() })) as RecipeRequest[],
      total,
    };
  } catch { return { requests: [], total: 0 }; }
}

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const status = params.status;
  const { requests, total } = await getRequests(page, status);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = status ? requests.filter((r) => r.status === "pending").length : undefined;

  function buildUrl(p: number) {
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (p > 1) qs.set("page", String(p));
    return `/admin/requests${qs.toString() ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-1 mb-4 inline-block")}>
        ← Kembali
      </Link>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Request Resep</h2>
        {pendingCount != null && pendingCount > 0 && (
          <span className="inline-flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5">
            {pendingCount}
          </span>
        )}
        <span className="text-sm text-muted-foreground ml-auto">{total} total</span>
      </div>

      {/* Filter status */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "pending", "done"].map((s) => (
          <Link
            key={s}
            href={`/admin/requests${s !== "all" ? `?status=${s}` : ""}`}
            className={cn(
              "px-3 py-1 rounded-full text-xs border transition-colors",
              (status === s || (!status && s === "all"))
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            {s === "all" ? "Semua" : s === "pending" ? "Pending" : "Selesai"}
          </Link>
        ))}
      </div>

      <RequestList requests={requests} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={buildUrl(page - 1)} className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors">
              ← Sebelumnya
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-2">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl(page + 1)} className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors">
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
