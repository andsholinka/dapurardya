import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { AdminMemberPlans, type AdminMemberSummary } from "@/components/AdminMemberPlans";
import type { MemberDoc } from "@/types/member";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function getMembers(page: number, q?: string) {
  try {
    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (q?.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ];
    }

    const [total, list] = await Promise.all([
      db.collection("members").countDocuments(filter),
      db.collection<MemberDoc>("members")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .toArray(),
    ]);

    return {
      members: list.map((m) => ({
        id: m._id?.toString() || "",
        name: m.name || m.email,
        email: m.email,
        credits: m.credits || 0,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : null,
      })) as AdminMemberSummary[],
      total,
    };
  } catch {
    return { members: [], total: 0 };
  }
}

export default async function AdminMembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const q = params.q;
  const { members, total } = await getMembers(page, q);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (p > 1) qs.set("page", String(p));
    return `/admin/members${qs.toString() ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau email..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          Cari
        </button>
        {q && (
          <Link href="/admin/members" className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors">
            Reset
          </Link>
        )}
      </form>

      <AdminMemberPlans initialMembers={members} total={total} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
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
    </div>
  );
}
