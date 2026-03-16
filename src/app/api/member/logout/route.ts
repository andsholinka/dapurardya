import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth-v2";
import { apiError } from "@/lib/logger";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (e) { return apiError("MEMBER_LOGOUT", e, "Gagal logout"); }
}
