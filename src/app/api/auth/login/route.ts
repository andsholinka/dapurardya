import { NextRequest, NextResponse } from "next/server";
import { verifyAdminLogin, verifyMemberLogin, setAuthCookie } from "@/lib/auth-v2";
import { validateOrThrow, loginSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Rate limit: 10 attempts per 15 minutes per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`login:${ip}`, { limit: 10, windowSec: 15 * 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = validateOrThrow(loginSchema, body);

    // Try admin first
    let session = await verifyAdminLogin(email, password);

    // If not admin, try member
    if (!session) {
      session = await verifyMemberLogin(email, password);
    }

    if (!session) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    await setAuthCookie(session);

    return NextResponse.json({
      success: true,
      role: session.role,
      redirectTo: session.role === "admin" ? "/admin" : "/member",
    });
  } catch (e: any) {
    logger.error("Login gagal", "AUTH_LOGIN", e);
    return NextResponse.json({ error: e.message || "Gagal login" }, { status: 400 });
  }
}
