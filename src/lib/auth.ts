import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

const ADMIN_COOKIE = "admin_session";
const MEMBER_COOKIE = "member_session"; // format: memberId|name|email
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  try {
    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email: email.toLowerCase().trim() });
    console.log("[AUTH] admin found:", !!admin, "hash:", admin?.passwordHash?.substring(0, 10));
    if (!admin) return false;
    const result = await bcrypt.compare(password, admin.passwordHash);
    console.log("[AUTH] bcrypt result:", result);
    return result;
  } catch (e) {
    console.error("[AUTH] verifyAdminCredentials error:", e);
    return false;
  }
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}

// ─── Member ───────────────────────────────────────────────────────────────────

export interface MemberSession {
  id: string;
  name: string;
  email: string;
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(MEMBER_COOKIE)?.value;
  if (!val) return null;
  try {
    return JSON.parse(Buffer.from(val, "base64").toString("utf-8")) as MemberSession;
  } catch {
    return null;
  }
}

export async function setMemberSession(member: MemberSession): Promise<void> {
  const cookieStore = await cookies();
  const val = Buffer.from(JSON.stringify(member)).toString("base64");
  cookieStore.set(MEMBER_COOKIE, val, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearMemberSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_COOKIE);
}
