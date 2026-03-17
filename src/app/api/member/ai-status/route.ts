import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { getMemberAIUsageStatus } from "@/lib/member-ai";
import { apiError } from "@/lib/logger";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ member: null, aiStatus: null });
  }

  try {
    const db = await getDb();
    
    // Fetch fresh credits from database instead of using cached session
    const membersCol = db.collection("members");
    const memberDoc = await membersCol.findOne({ email: session.email });
    
    const freshCredits = memberDoc?.credits ?? (session.role === "admin" ? 999 : 0);
    
    const member = {
      id: session.id,
      name: session.name,
      email: session.email,
      credits: freshCredits
    };

    const aiStatus = await getMemberAIUsageStatus(db, member.id);
    
    return NextResponse.json(
      { member, aiStatus },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) { 
    return apiError("MEMBER_AI_STATUS", error, "Gagal mengambil status AI"); 
  }
}
