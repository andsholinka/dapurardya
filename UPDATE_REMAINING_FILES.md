# 🔄 UPDATE REMAINING FILES - QUICK REFERENCE

## Files Still Using Old Auth (Need Manual Update)

### Critical (Update Now):
1. `src/components/Header.tsx`
2. `src/app/resep/[slug]/page.tsx`
3. `src/app/resep/page.tsx`
4. `src/app/admin/layout.tsx`
5. `src/app/api/auth/session/route.ts`
6. `src/app/api/admin/analytics/route.ts`
7. `src/app/api/recipes/[id]/route.ts`
8. `src/app/api/ratings/[recipeId]/route.ts`
9. `src/app/api/requests/route.ts`
10. `src/app/api/upload/route.ts`

### Pattern Replacements:

#### Pattern 1: Simple Admin Check
```typescript
// OLD:
const isAdmin = await getAdminSession();
if (!isAdmin) return unauthorized();

// NEW:
try {
  await requireAdmin();
} catch {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Pattern 2: Member Check
```typescript
// OLD:
const member = await getMemberSession();
if (!member) return unauthorized();

// NEW:
const session = await getSession();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

#### Pattern 3: Both Admin & Member
```typescript
// OLD:
const [member, isAdmin] = await Promise.all([getMemberSession(), getAdminSession()]);
const isMember = !!member || isAdmin;

// NEW:
const session = await getSession();
const isMember = !!session;
const isAdmin = session?.role === "admin";
```

#### Pattern 4: Optional Member (for features)
```typescript
// OLD:
const member = await getMemberSession();
// use member?.id

// NEW:
const session = await getSession();
// use session?.id
```

## Auto-Replace Commands

Run these in VS Code (Ctrl+Shift+H):

### Replace 1:
Find: `const isAdmin = await getAdminSession\(\);`
Replace: `const session = await getSession(); const isAdmin = session?.role === "admin";`

### Replace 2:
Find: `const member = await getMemberSession\(\);`
Replace: `const session = await getSession();`

### Replace 3:
Find: `getMemberSession\(\)`
Replace: `getSession()`

### Replace 4:
Find: `getAdminSession\(\)`
Replace: `getSession()`

## After Replacement, Update Logic:

1. Change `if (!member)` → `if (!session)`
2. Change `member.id` → `session.id`
3. Change `member.email` → `session.email`
4. Change `member.name` → `session.name`
5. Change `member.credits` → `session.credits`
6. Change `if (isAdmin)` → `if (session?.role === "admin")`

## Test After Each File:
```bash
npm run build
```
