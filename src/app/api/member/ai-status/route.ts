import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { getMemberAIUsageStatus } from "@/lib/member-ai";
import { apiError } from "@/lib/logger";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ member: null, aiStatus: null });
  }

  const member = {
    id: session.id,
    name: session.name,
    email: session.email,
    credits: session.credits || (session.role === "admin" ? 999 : 0)
  };

  try {
    const db = await getDb();
    const aiStatus = await getMemberAIUsageStatus(db, member.id);
    return NextResponse.json({ member, aiStatus });
  } catch (error) { return apiError("MEMBER_AI_STATUS", error, "Gagal mengambil status AI"); }
}
