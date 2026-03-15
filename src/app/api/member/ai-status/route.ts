import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getMemberAIUsageStatus } from "@/lib/member-ai";

export async function GET() {
  let member = await getMemberSession();
  
  // If not a member, check if it's an admin
  if (!member) {
    const { getAdminSession } = await import("@/lib/auth");
    const isAdmin = await getAdminSession();
    if (isAdmin) {
      member = {
        id: "admin",
        name: "Admin",
        email: "admin@dapurardya.com",
        credits: 999
      };
    }
  }

  if (!member) {
    return NextResponse.json({ member: null, aiStatus: null });
  }

  try {
    const db = await getDb();
    const aiStatus = await getMemberAIUsageStatus(db, member.id);
    return NextResponse.json({ member, aiStatus });
  } catch (error) {
    console.error("[MEMBER_AI_STATUS]", error);
    return NextResponse.json({ member, aiStatus: null }, { status: 500 });
  }
}
