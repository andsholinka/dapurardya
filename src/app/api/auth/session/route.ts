import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";

export async function GET() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";
  return NextResponse.json({ isAdmin });
}
