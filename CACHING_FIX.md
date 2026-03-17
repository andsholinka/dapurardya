# 🔧 Caching Fix - Dapur Ardya

## 🐛 Masalah yang Ditemukan

User melaporkan beberapa issue caching:
1. Login sebagai admin tapi masih muncul data member sebelumnya
2. Hapus menu di admin, tapi masih muncul di dashboard (perlu hard refresh)
3. Data sering tidak sync antara halaman

## 🔍 Root Cause

Next.js 15+ menggunakan **aggressive caching** secara default:
- Server Components di-cache
- Data fetching di-cache
- Tidak ada automatic revalidation setelah mutations

## ✅ Solusi yang Diimplementasikan

### 1. Force Dynamic Rendering

Tambahkan di halaman yang perlu fresh data:

```typescript
// src/app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

// src/app/admin/page.tsx  
export const dynamic = "force-dynamic";
export const revalidate = 0;

// src/app/member/page.tsx (sudah ada)
export const dynamic = "force-dynamic";
```

### 2. Revalidate After Mutations

Tambahkan `revalidatePath()` di API routes yang mengubah data:

```typescript
// src/app/api/recipes/[id]/route.ts
import { revalidatePath } from "next/cache";

// After DELETE
revalidatePath("/");
revalidatePath("/resep");
revalidatePath("/admin");

// After UPDATE
revalidatePath("/");
revalidatePath("/resep");
revalidatePath("/admin");
revalidatePath(`/resep/${slug}`);
```

### 3. Client-Side Refresh

Untuk client components, gunakan `router.refresh()`:

```typescript
// After mutation
await fetch("/api/recipes", { method: "POST", ... });
router.refresh(); // Force re-fetch server data
```

## 📝 Files yang Diupdate

### ✅ Completed:
- [x] `src/app/page.tsx` - Added dynamic + revalidate
- [x] `src/app/admin/page.tsx` - Added dynamic + revalidate
- [x] `src/app/layout.tsx` - Added dynamic (fixes session cache)
- [x] `src/components/HeaderMenu.tsx` - Fetch fresh credits on mount
- [x] `src/app/api/recipes/[id]/route.ts` - Added revalidatePath on DELETE

### ⏳ TODO (Manual):
- [ ] `src/app/api/recipes/[id]/route.ts` - Add revalidatePath on PUT
- [ ] `src/app/api/recipes/route.ts` - Add revalidatePath on POST
- [ ] `src/app/api/requests/[id]/route.ts` - Add revalidatePath on DELETE/PATCH
- [ ] All admin mutation APIs

## 🧪 Testing Checklist

### Test Scenario 1: Recipe CRUD
1. Login sebagai admin
2. Tambah resep baru
3. Check homepage → resep baru harus muncul (no refresh)
4. Edit resep
5. Check homepage → perubahan harus muncul (no refresh)
6. Hapus resep
7. Check homepage → resep harus hilang (no refresh)

### Test Scenario 2: Session/Auth
1. Login sebagai member A
2. Logout
3. Login sebagai admin
4. Check header → harus tampil "Admin" bukan "Member A"
5. No hard refresh needed

### Test Scenario 3: Request Status
1. Member submit request
2. Admin approve request
3. Member check status → harus updated (no refresh)

## 🔧 Additional Recommendations

### 1. Disable Fetch Cache Globally (Optional)

Jika masih ada issue, tambahkan di `next.config.ts`:

```typescript
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};
```

### 2. Use Optimistic Updates

Untuk better UX, implement optimistic updates:

```typescript
// Before API call
setLocalState(newData); // Update UI immediately

// Then API call
await fetch(...);

// If error, rollback
if (error) setLocalState(oldData);
```

### 3. Add Loading States

```typescript
const [isRefreshing, setIsRefreshing] = useState(false);

const handleDelete = async () => {
  setIsRefreshing(true);
  await fetch(...);
  router.refresh();
  setIsRefreshing(false);
};
```

## 📚 References

- [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching)
- [revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)

## 🎯 Expected Results

After implementing these fixes:
- ✅ No stale data after mutations
- ✅ No need for hard refresh
- ✅ Session changes reflect immediately
- ✅ Admin actions update UI instantly

---

**Status:** Partially Implemented  
**Next Step:** Add revalidatePath to remaining mutation APIs  
**Priority:** High (affects UX significantly)
