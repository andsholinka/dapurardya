# 🔄 MIGRATION GUIDE: Old Auth → New Auth (JWT)

## Files Created
✅ `src/lib/auth-v2.ts` — Unified JWT-based authentication
✅ `src/lib/validation.ts` — Zod schemas for input validation
✅ `src/middleware.ts` — Route protection middleware
✅ Updated API routes: `/api/auth/login`, `/api/auth/logout`, `/api/member/*`

## Migration Map

### Old → New Function Mapping

```typescript
// OLD (auth.ts)
import { getMemberSession, getAdminSession } from "@/lib/auth";
const member = await getMemberSession();
const isAdmin = await getAdminSession();

// NEW (auth-v2.ts)
import { getSession, isAdmin, isMember } from "@/lib/auth-v2";
const session = await getSession();
const admin = await isAdmin(session);
const member = await isMember(session);
```

### Session Structure Change

```typescript
// OLD
interface MemberSession {
  id: string;
  name: string;
  email: string;
  credits: number;
}

// NEW
interface AuthSession {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";  // ← NEW: unified role
  credits?: number;
}
```

## Files That Need Manual Update

Run this search-replace across your codebase:

1. **Import statements**:
   - Find: `from "@/lib/auth"`
   - Replace: `from "@/lib/auth-v2"`

2. **getMemberSession() calls**:
   ```typescript
   // Before
   const member = await getMemberSession();
   if (!member) return unauthorized();
   
   // After
   const session = await getSession();
   if (!session || session.role !== "member") return unauthorized();
   ```

3. **getAdminSession() calls**:
   ```typescript
   // Before
   const isAdmin = await getAdminSession();
   if (!isAdmin) return unauthorized();
   
   // After
   const session = await getSession();
   if (!session || session.role !== "admin") return unauthorized();
   ```

## Testing Checklist

- [ ] Admin login works
- [ ] Member email/password login works
- [ ] Google OAuth login works
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Credits display correctly
- [ ] Payment updates credits
- [ ] AI features deduct credits

## Rollback Plan

If issues occur, revert these files:
1. `src/middleware.ts` (delete)
2. `src/lib/auth-v2.ts` (delete)
3. Restore old API routes from git history
