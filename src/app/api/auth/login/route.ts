import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const valid = await verifyAdminCredentials(email, password);
    console.log("[ADMIN LOGIN] email:", email, "valid:", valid);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}
