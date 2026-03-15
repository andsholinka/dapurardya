import { getDb } from "@/lib/mongodb";
import { AdminMemberPlans, type AdminMemberSummary } from "@/components/AdminMemberPlans";
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
      credits: member.credits || 0,
      createdAt: member.createdAt instanceof Date ? member.createdAt.toISOString() : null,
    })) as AdminMemberSummary[];
  } catch {
    return [];
  }
}

export default async function AdminMembersPage() {
  const latestMembers = await getLatestMembers();

  return (
    <div className="space-y-6">

      <AdminMemberPlans initialMembers={latestMembers} />
    </div>
  );
}
