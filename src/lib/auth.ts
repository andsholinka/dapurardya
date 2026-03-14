import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

const ADMIN_COOKIE = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const COLLECTION = "admins";

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  try {
    const db = await getDb();
    const admin = await db.collection(COLLECTION).findOne({ email: email.toLowerCase().trim() });
    if (!admin) return false;
    return bcrypt.compare(password, admin.passwordHash);
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
  const session = cookieStore.get(ADMIN_COOKIE);
  return session?.value === "1";
}
