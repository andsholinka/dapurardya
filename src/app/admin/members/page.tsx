import { getDb } from "@/lib/mongodb";
import { AdminMemberPlans } from "@/components/AdminMemberPlans";
import type { MemberDoc } from "@/types/member";

async function getLatestMembers() {
  try {
    const db = await getDb();
    const list = await db
      .collection<MemberDoc>("members")
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return list.map((member) => ({
      id: member._id?.toString() || "",
      name: member.name || member.email,
      email: member.email,
      aiPlan: member.aiPlan === "premium" ? "premium" : "free",
      createdAt: member.createdAt instanceof Date ? member.createdAt.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function AdminMembersPage() {
  const latestMembers = await getLatestMembers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Kelola Member Premium</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gunakan laman khusus ini untuk mengaktifkan premium setelah pembayaran upgrade diverifikasi.
        </p>
      </div>

      <AdminMemberPlans initialMembers={latestMembers} />
    </div>
  );
}
