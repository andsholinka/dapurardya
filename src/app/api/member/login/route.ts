import { NextRequest, NextResponse } from "next/server";
import { verifyMemberLogin, setAuthCookie } from "@/lib/auth-v2";
import { validateOrThrow, loginSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = validateOrThrow(loginSchema, body);

    const session = await verifyMemberLogin(email, password);

    if (!session) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    await setAuthCookie(session);

    return NextResponse.json({
      success: true,
      redirectTo: "/member",
    });
  } catch (e: any) {
    logger.error("Member login gagal", "MEMBER_LOGIN", e);
    return NextResponse.json({ error: e.message || "Gagal login" }, { status: 400 });
  }
}
