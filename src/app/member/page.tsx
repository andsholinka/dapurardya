import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { RecipeRequestDoc, RecipeRequest } from "@/types/recipe-request";
import MemberDashboard from "./MemberDashboard";

async function getMemberRequests(memberId: string): Promise<RecipeRequest[]> {
  try {
    const db = await getDb();
    const list = await db.collection<RecipeRequestDoc>("recipe_requests")
      .find({ memberId })
      .sort({ createdAt: -1 })
      .toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() })) as RecipeRequest[];
  } catch { return []; }
}

export default async function MemberPage() {
  const session = await getMemberSession();
  if (!session) redirect("/member/auth");
  const requests = await getMemberRequests(session.id);
  return <MemberDashboard session={session} requests={requests} />;
}
