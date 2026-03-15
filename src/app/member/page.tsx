import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { RecipeRequestDoc, RecipeRequest } from "@/types/recipe-request";
import { getMemberRecipeRequestStatus } from "@/lib/member-request";
import MemberDashboard from "./MemberDashboard";

export const dynamic = "force-dynamic";

async function getMemberRequests(session: { id: string; email: string }): Promise<RecipeRequest[]> {
  try {
    const db = await getDb();
    const list = await db.collection<RecipeRequestDoc>("recipe_requests")
      .find({
        $or: [
          { memberId: session.id },
          { memberId: session.email },
          { memberEmail: session.email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    return list.map((r) => ({ ...r, _id: r._id?.toString() })) as RecipeRequest[];
  } catch { return []; }
}


export default async function MemberPage() {
  const session = await getMemberSession();
  if (!session) redirect("/member/auth");
  const db = await getDb();
  const [requests, requestStatus] = await Promise.all([
    getMemberRequests(session),
    getMemberRecipeRequestStatus(db, session.id, session.aiPlan),
  ]);
  return <MemberDashboard session={session} requests={requests} requestStatus={requestStatus} />;
}
