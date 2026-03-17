# 🔧 Credits Sync Issue - Root Cause & Solution

## ❌ Problem

Credits di header sering tidak sync dengan database:
- Database: 46 credits
- Header: 56 credits (cached value)
- Terjadi berulang kali meskipun sudah ada `credits:update` event

## 🔍 Root Cause Analysis

### 1. Session Caching
```typescript
// OLD CODE - PROBLEM
const member = {
  credits: session.credits || 0  // ❌ Menggunakan cached session
};
```

Session di Next.js di-cache dan tidak auto-refresh setiap request. Ketika credits berubah di database, session masih menyimpan nilai lama.

### 2. API Response Caching
```typescript
// OLD CODE - PROBLEM
export async function GET() {
  // ❌ Tidak ada cache control headers
  return NextResponse.json({ member, aiStatus });
}
```

Next.js 15+ secara default cache API responses. Tanpa explicit cache control, response di-cache dan tidak fetch fresh data.

### 3. Client-Side Initial State
```typescript
// OLD CODE - PROBLEM
const [displayCredits, setDisplayCredits] = useState<number>(
  member?.credits ?? 0  // ❌ Initial state dari cached session
);
```

Component dimulai dengan cached value, kemudian fetch fresh data. Tapi jika fetch juga return cached response, credits tetap tidak sync.

## ✅ Solution Implemented

### 1. Force Fresh Database Query
```typescript
// NEW CODE - FIXED
export async function GET() {
  const session = await getSession();
  
  // ✅ Fetch fresh credits from database
  const db = await getDb();
  const membersCol = db.collection("members");
  const memberDoc = await membersCol.findOne({ email: session.email });
  
  const freshCredits = memberDoc?.credits ?? 0;
  
  const member = {
    credits: freshCredits  // ✅ Always fresh from DB
  };
  
  return NextResponse.json({ member, aiStatus });
}
```

### 2. Disable API Caching
```typescript
// NEW CODE - FIXED
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { member, aiStatus },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
```

### 3. Client-Side No-Cache Fetch
```typescript
// NEW CODE - FIXED
const [displayCredits, setDisplayCredits] = useState<number | null>(null);
const [creditsLoading, setCreditsLoading] = useState(true);

useEffect(() => {
  fetch("/api/member/ai-status", {
    cache: "no-store",  // ✅ Force no cache
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    },
  })
    .then(res => res.json())
    .then(data => {
      setDisplayCredits(data.member?.credits);
    });
}, []);
```

### 4. Loading State
```typescript
// NEW CODE - FIXED
{creditsLoading ? (
  <Loader2 className="animate-spin" />
) : (
  <span>{displayCredits ?? 0}</span>
)}
```

User melihat loading indicator saat fetch fresh credits, jadi tahu data sedang di-update.

## 📊 Flow Comparison

### Before (Broken)
```
1. Server renders with cached session (56 credits)
2. Client mounts with 56 credits
3. Client fetch /api/member/ai-status
4. API returns cached response (56 credits)
5. Header still shows 56 credits ❌
```

### After (Fixed)
```
1. Server renders with cached session (56 credits)
2. Client mounts with loading state
3. Client fetch /api/member/ai-status (no-cache)
4. API queries fresh DB (46 credits)
5. API returns with no-cache headers
6. Header updates to 46 credits ✅
```

## 🎯 Why This Happens Often

Next.js 15+ has aggressive caching by default:
- Server Components cached
- API Routes cached
- Session data cached
- Fetch requests cached

Without explicit cache control, stale data persists across:
- Page navigations
- Component re-renders
- API calls
- Session reads

## 🔧 Files Changed

1. **`src/app/api/member/ai-status/route.ts`**
   - Added `export const dynamic = "force-dynamic"`
   - Added `export const revalidate = 0`
   - Changed to fetch fresh credits from DB
   - Added no-cache response headers

2. **`src/components/HeaderMenu.tsx`**
   - Changed initial state to `null` with loading state
   - Added no-cache fetch options
   - Added loading indicator
   - Better error handling with fallback

## ✅ Testing

### Test 1: Fresh Page Load
1. Open browser DevTools Network tab
2. Navigate to any page
3. Check `/api/member/ai-status` request
4. Verify response headers include `Cache-Control: no-store`
5. Verify credits match database

### Test 2: After Credit Deduction
1. Scan image (costs 2 credits)
2. Check header updates immediately
3. Refresh page
4. Verify credits still correct (not reverting to old value)

### Test 3: Multiple Tabs
1. Open 2 tabs
2. Deduct credits in tab 1
3. Refresh tab 2
4. Verify tab 2 shows updated credits

## 🚀 Expected Behavior

- ✅ Credits always match database
- ✅ No stale cached values
- ✅ Loading state shows data is updating
- ✅ Works across page navigations
- ✅ Works across browser tabs
- ✅ Works after hard refresh

## 📝 Prevention Tips

For future features that need fresh data:

1. **Always add cache control for dynamic data**
   ```typescript
   export const dynamic = "force-dynamic";
   export const revalidate = 0;
   ```

2. **Fetch from DB, not from session**
   ```typescript
   // ❌ BAD
   const credits = session.credits;
   
   // ✅ GOOD
   const member = await membersCol.findOne({ email: session.email });
   const credits = member?.credits;
   ```

3. **Add no-cache headers to responses**
   ```typescript
   return NextResponse.json(data, {
     headers: {
       "Cache-Control": "no-store, no-cache, must-revalidate",
     },
   });
   ```

4. **Use no-cache fetch on client**
   ```typescript
   fetch(url, {
     cache: "no-store",
     headers: { "Cache-Control": "no-cache" },
   });
   ```

## 🎊 Status

✅ **FIXED** - Credits should now always sync correctly with database.

Test thoroughly and report if issue persists!
