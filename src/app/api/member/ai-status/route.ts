import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getMemberAIUsageStatus } from "@/lib/member-ai";

export async function GET() {
  const member = await getMemberSession();
  if (!member) {
    return NextResponse.json({ member: null, aiStatus: null });
  }

  try {
    const db = await getDb();
    const aiStatus = await getMemberAIUsageStatus(db, member.id, member.aiPlan);
    return NextResponse.json({ member, aiStatus });
  } catch (error) {
    console.error("[MEMBER_AI_STATUS]", error);
    return NextResponse.json({ member, aiStatus: null }, { status: 500 });
  }
}
