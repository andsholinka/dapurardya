import { NextResponse } from "next/server";
import { clearMemberSession } from "@/lib/auth";

export async function POST() {
  await clearMemberSession();
  return NextResponse.json({ success: true });
}
