import { NextRequest, NextResponse } from "next/server";
import { registerMember, setAuthCookie } from "@/lib/auth-v2";
import { validateOrThrow, registerSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per hour per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowSec: 60 * 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan pendaftaran. Coba lagi dalam 1 jam." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password } = validateOrThrow(registerSchema, body);

    const session = await registerMember(name, email, password);
    await setAuthCookie(session);

    return NextResponse.json({
      success: true,
      redirectTo: "/member",
    });
  } catch (e: any) {
    logger.error("Register gagal", "MEMBER_REGISTER", e);
    return NextResponse.json({ error: e.message || "Gagal mendaftar" }, { status: 400 });
  }
}
