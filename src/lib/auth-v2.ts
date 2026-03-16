import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret-change-in-production");
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthSession {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  credits?: number;
  iat?: number;
  exp?: number;
}

// ─── JWT Token Management ─────────────────────────────────────────────────────

export async function createAuthToken(session: Omit<AuthSession, "iat" | "exp">): Promise<string> {
  return await new SignJWT(session as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

// ─── Session Management ───────────────────────────────────────────────────────

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAuthToken(token);
}

export async function setAuthCookie(session: Omit<AuthSession, "iat" | "exp">): Promise<void> {
  const token = await createAuthToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Admin Authentication ─────────────────────────────────────────────────────

export async function verifyAdminLogin(email: string, password: string): Promise<AuthSession | null> {
  try {
    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email: email.toLowerCase().trim() });
    if (!admin) return null;

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return null;

    return {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name || "Admin",
      role: "admin",
    };
  } catch (e) {
    console.error("[AUTH_V2] verifyAdminLogin error:", e);
    return null;
  }
}

// ─── Member Authentication ────────────────────────────────────────────────────

export async function verifyMemberLogin(email: string, password: string): Promise<AuthSession | null> {
  try {
    const db = await getDb();
    const member = await db.collection("members").findOne({ email: email.toLowerCase().trim() });
    if (!member || !member.passwordHash) return null;

    const valid = await bcrypt.compare(password, member.passwordHash);
    if (!valid) return null;

    return {
      id: member._id.toString(),
      email: member.email,
      name: member.name,
      role: "member",
      credits: member.credits || 0,
    };
  } catch (e) {
    console.error("[AUTH_V2] verifyMemberLogin error:", e);
    return null;
  }
}

export async function registerMember(name: string, email: string, password: string): Promise<AuthSession> {
  const db = await getDb();
  const existing = await db.collection("members").findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new Error("Email sudah terdaftar");

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.collection("members").insertOne({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    credits: 3, // Welcome bonus
    provider: "email",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: result.insertedId.toString(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    role: "member",
    credits: 3,
  };
}

// ─── Google OAuth Integration ─────────────────────────────────────────────────

export async function handleGoogleSignIn(email: string, name: string, image?: string): Promise<AuthSession> {
  const db = await getDb();
  
  await db.collection("members").updateOne(
    { email: email.toLowerCase() },
    {
      $set: { name, email: email.toLowerCase(), image, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date(), provider: "google", credits: 3 },
    },
    { upsert: true }
  );

  const member = await db.collection("members").findOne({ email: email.toLowerCase() });
  
  return {
    id: member!._id.toString(),
    email: email.toLowerCase(),
    name: name,
    role: "member",
    credits: member!.credits || 0,
  };
}

// ─── Session Refresh ──────────────────────────────────────────────────────────

export async function refreshSessionCredits(session: AuthSession): Promise<AuthSession> {
  if (session.role !== "member") return session;

  try {
    const db = await getDb();
    const oid = new ObjectId(session.id);
    const member = await db.collection("members").findOne({ _id: oid });

    return {
      ...session,
      credits: member?.credits || 0,
    };
  } catch {
    return session;
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

export async function isAdmin(session: AuthSession | null): Promise<boolean> {
  return session?.role === "admin";
}

export async function isMember(session: AuthSession | null): Promise<boolean> {
  return session?.role === "member" || session?.role === "admin";
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.role !== "admin") throw new Error("Admin access required");
  return session;
}

export async function requireMember(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.role !== "member" && session.role !== "admin") throw new Error("Member access required");
  return session;
}
