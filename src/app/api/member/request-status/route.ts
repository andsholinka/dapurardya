import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { getMemberRecipeRequestStatus } from "@/lib/member-request";
import { apiError } from "@/lib/logger";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ member: null, requestStatus: null }, { status: 401 });
  }

  try {
    const db = await getDb();
    const requestStatus = await getMemberRecipeRequestStatus(db, session.id);

    return NextResponse.json({
      member: {
        id: session.id,
        name: session.name,
        email: session.email,
      },
      requestStatus,
    });
  } catch (error) { return apiError("REQUEST_STATUS", error, "Gagal memuat status request resep"); }
}
