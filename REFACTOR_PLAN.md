# 🔧 REFACTOR PLAN: AUTHENTICATION SYSTEM

## Problem Statement
Sistem autentikasi saat ini menggunakan pendekatan hybrid yang tidak konsisten:
- Admin: Simple cookie dengan value "1" (tidak aman, tidak scalable)
- Member: Dual system (NextAuth untuk Google + Custom cookie untuk email/password)
- Session data di-fetch dari DB setiap request (performance issue)
- Tidak ada proper session management

## Recommended Solution: Unified JWT-Based Auth

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Auth Flow                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Login (Admin/Member)                                    │
│         ↓                                                │
│  Verify Credentials (DB)                                 │
│         ↓                                                │
│  Generate JWT Token                                      │
│    - Payload: { id, email, role, credits }              │
│    - Signed with AUTH_SECRET                             │
│    - Expires: 7 days                                     │
│         ↓                                                │
│  Set httpOnly Cookie                                     │
│    - Name: "auth_token"                                  │
│    - Secure, SameSite=lax                                │
│         ↓                                                │
│  Middleware validates JWT on protected routes            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1: Install jose (JWT library for Edge Runtime)
```bash
npm install jose
```

#### Step 2: Create unified auth utility
**File**: `src/lib/auth-v2.ts`

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthSession {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  credits?: number;
}

// Generate JWT token
export async function createAuthToken(session: AuthSession): Promise<string> {
  return await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify and decode JWT
export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthSession;
  } catch {
    return null;
  }
}

// Get current session from cookie
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAuthToken(token);
}

// Set auth cookie
export async function setAuthCookie(session: AuthSession): Promise<void> {
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

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Verify admin credentials
export async function verifyAdminLogin(email: string, password: string): Promise<AuthSession | null> {
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
}

// Verify member credentials
export async function verifyMemberLogin(email: string, password: string): Promise<AuthSession | null> {
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
}

// Register new member
export async function registerMember(name: string, email: string, password: string): Promise<AuthSession | null> {
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

// Refresh credits from DB (call after payment/usage)
export async function refreshSessionCredits(session: AuthSession): Promise<AuthSession> {
  if (session.role !== "member") return session;
  
  const db = await getDb();
  const member = await db.collection("members").findOne({ email: session.email });
  
  return {
    ...session,
    credits: member?.credits || 0,
  };
}
```

#### Step 3: Create middleware for route protection
**File**: `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth-v2";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/member/auth", request.url));
    }

    const session = await verifyAuthToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/member/auth", request.url));
    }
  }

  // Member-only routes
  if (pathname.startsWith("/member") && !pathname.startsWith("/member/auth")) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/member/auth?tab=login", request.url));
    }

    const session = await verifyAuthToken(token);
    if (!session) {
      return NextResponse.redirect(new URL("/member/auth?tab=login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
```

#### Step 4: Update API routes
Replace all `getMemberSession()` and `getAdminSession()` calls with `getSession()`.

Example:
```typescript
// Before
const member = await getMemberSession();
const isAdmin = await getAdminSession();

// After
const session = await getSession();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (session.role === "admin") { /* admin logic */ }
if (session.role === "member") { /* member logic */ }
```

#### Step 5: Update login/register routes
**File**: `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminLogin, verifyMemberLogin, setAuthCookie } from "@/lib/auth-v2";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

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
    redirectTo: session.role === "admin" ? "/admin" : "/member"
  });
}
```

#### Step 6: Handle Google OAuth
Keep NextAuth for Google, but after successful sign-in, create JWT token:

```typescript
// src/lib/next-auth.ts
callbacks: {
  async signIn({ user }) {
    const db = await getDb();
    await db.collection("members").updateOne(
      { email: user.email },
      {
        $set: { name: user.name, email: user.email, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), provider: "google", credits: 3 },
      },
      { upsert: true }
    );

    // Create JWT session
    const member = await db.collection("members").findOne({ email: user.email });
    const session: AuthSession = {
      id: member!._id.toString(),
      email: user.email!,
      name: user.name!,
      role: "member",
      credits: member!.credits || 0,
    };
    
    // Set JWT cookie (need to use cookies() here)
    await setAuthCookie(session);
    
    return true;
  },
}
```

### Migration Strategy

1. **Phase 1**: Implement auth-v2.ts alongside existing auth.ts
2. **Phase 2**: Create middleware.ts
3. **Phase 3**: Update all API routes one by one
4. **Phase 4**: Update login/register forms
5. **Phase 5**: Test thoroughly
6. **Phase 6**: Remove old auth.ts
7. **Phase 7**: Deploy with zero downtime (JWT validates both old and new sessions during transition)

### Benefits
- ✅ Single source of truth for authentication
- ✅ No DB query on every request (JWT is self-contained)
- ✅ Proper role-based access control
- ✅ Scalable and secure
- ✅ Works with Edge Runtime
- ✅ Easy to extend (add more roles, permissions, etc.)

### Security Considerations
- JWT secret must be strong (min 32 characters)
- Use HTTPS in production
- Implement rate limiting on login endpoints
- Add CSRF protection for state-changing operations
- Consider adding refresh token for long-lived sessions
