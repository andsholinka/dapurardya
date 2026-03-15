import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getMemberRecipeRequestStatus } from "@/lib/member-request";

export async function GET() {
  const member = await getMemberSession();

  if (!member) {
    return NextResponse.json({ member: null, requestStatus: null }, { status: 401 });
  }

  try {
    const db = await getDb();
    const requestStatus = await getMemberRecipeRequestStatus(db, member.id, member.aiPlan);

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        aiPlan: member.aiPlan,
      },
      requestStatus,
    });
  } catch (error) {
    console.error("[MEMBER_REQUEST_STATUS] Error:", error);
    return NextResponse.json({ error: "Gagal memuat status request resep" }, { status: 500 });
  }
}
