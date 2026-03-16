import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret-change-in-production");

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Admin routes — require admin role
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/member/auth?redirect=/admin", request.url));
    }

    const session = await verifyToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/member/auth?redirect=/admin", request.url));
    }

    return NextResponse.next();
  }

  // Member routes (except /member/auth) — require any authenticated user
  if (pathname.startsWith("/member") && !pathname.startsWith("/member/auth") && !pathname.startsWith("/member/upgrade/success")) {
    if (!token) {
      const redirectUrl = new URL("/member/auth", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("tab", "login");
      return NextResponse.redirect(redirectUrl);
    }

    const session = await verifyToken(token);
    if (!session) {
      const redirectUrl = new URL("/member/auth", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("tab", "login");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // Redirect /login to /member/auth
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/member/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/member/:path*",
    "/login",
  ],
};
