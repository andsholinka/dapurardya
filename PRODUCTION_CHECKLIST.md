# ✅ PRODUCTION READINESS CHECKLIST

## 🔴 CRITICAL (Must Fix Before Launch)

### 1. Authentication System
- [ ] **Refactor to unified JWT-based auth** (see REFACTOR_PLAN.md)
- [ ] Remove dual cookie system (admin_session + member_session)
- [ ] Implement proper middleware for route protection
- [ ] Add rate limiting on login endpoints (prevent brute force)

### 2. Security Vulnerabilities

#### A. Environment Variables
```bash
# .env.local - MISSING CRITICAL VARS:
ADMIN_PASSWORD_HASH=          # ❌ Must be set
AUTH_SECRET=                  # ❌ Must be strong (min 32 chars)
MAYAR_API_KEY=               # ❌ Required for payment
GEMINI_API_KEY=              # ❌ Required for AI features
VAPID_PUBLIC_KEY=            # ❌ Required for push notifications
VAPID_PRIVATE_KEY=           # ❌ Required for push notifications
```

#### B. API Route Security
- [ ] Add CORS configuration for production
- [ ] Implement API rate limiting (use `@upstash/ratelimit` or similar)
- [ ] Add request validation middleware
- [ ] Sanitize user inputs (prevent NoSQL injection)

**Example Rate Limiting**:
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

// Usage in API route:
const identifier = req.headers.get("x-forwarded-for") || "anonymous";
const { success } = await ratelimit.limit(identifier);
if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
```

#### C. MongoDB Security
- [ ] **URGENT**: Remove console.log with sensitive data
  ```typescript
  // src/lib/auth.ts line 15-16 - REMOVE IN PRODUCTION:
  console.log("[AUTH] admin found:", !!admin, "hash:", admin?.passwordHash?.substring(0, 10));
  console.log("[AUTH] bcrypt result:", result);
  ```
- [ ] Add MongoDB indexes for performance:
  ```javascript
  // Run in MongoDB shell:
  db.recipes.createIndex({ slug: 1 }, { unique: true });
  db.recipes.createIndex({ published: 1, updatedAt: -1 });
  db.members.createIndex({ email: 1 }, { unique: true });
  db.recipe_ratings.createIndex({ recipeId: 1, memberId: 1 }, { unique: true });
  db.recipe_requests.createIndex({ status: 1, createdAt: -1 });
  ```
- [ ] Enable MongoDB connection pooling (already done, but verify maxPoolSize)
- [ ] Add MongoDB connection retry logic

#### D. Payment Webhook Security
```typescript
// src/app/api/payment/webhook/mayar/route.ts
// ❌ MISSING: Webhook signature verification

export async function POST(req: NextRequest) {
  // ADD THIS:
  const signature = req.headers.get("x-mayar-signature");
  const isValid = verifyMayarSignature(await req.text(), signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // ... rest of code
}
```

### 3. Error Handling & Logging

#### A. Global Error Boundary
- [ ] Create `src/app/error.tsx` for global error handling
- [ ] Create `src/app/not-found.tsx` for 404 pages
- [ ] Add error tracking (Sentry, LogRocket, or similar)

**Example**:
```typescript
// src/app/error.tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Oops! Terjadi kesalahan</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-primary text-white rounded-xl">
        Coba Lagi
      </button>
    </div>
  );
}
```

#### B. Structured Logging
- [ ] Replace console.log with proper logger (winston, pino)
- [ ] Add request ID tracking
- [ ] Log all errors to external service

### 4. Performance Optimization

#### A. Database Queries
- [ ] **CRITICAL**: `getMemberSession()` queries DB on EVERY request
  - Current: ~50-100ms per request
  - After JWT refactor: ~1ms (no DB query)
- [ ] Add caching layer (Redis) for frequently accessed data
- [ ] Implement pagination for recipe lists (currently loads ALL recipes)

#### B. Image Optimization
- [ ] Verify Cloudinary auto-optimization is enabled
- [ ] Add responsive image sizes
- [ ] Implement lazy loading for images below fold
- [ ] Add blur placeholder for all images (partially done)

#### C. Bundle Size
```bash
# Run this to check bundle size:
npm run build
# Look for large chunks (>500KB)
```
- [ ] Code split large dependencies
- [ ] Lazy load heavy components (charts, editors)
- [ ] Remove unused dependencies

### 5. Data Validation

#### A. Input Validation
- [ ] Add Zod schemas for all API inputs
- [ ] Validate file uploads (type, size, dimensions)
- [ ] Sanitize HTML in user-generated content

**Example**:
```typescript
// src/lib/validation.ts
import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  ingredients: z.array(z.string().min(1)).min(1),
  steps: z.array(z.string().min(1)).min(1),
  category: z.enum(["Makanan", "Minuman", "Cemilan"]),
  tags: z.array(z.string()).optional(),
});

// Usage in API:
const result = recipeSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error.errors }, { status: 400 });
}
```

#### B. Database Constraints
- [ ] Add unique constraints where needed
- [ ] Add NOT NULL constraints
- [ ] Validate data types before insert/update

---

## 🟡 HIGH PRIORITY (Should Fix Soon)

### 6. Email System
- [ ] Verify Resend domain is fully verified
- [ ] Add email queue for reliability (Bull, BullMQ)
- [ ] Implement retry logic for failed emails
- [ ] Add email templates versioning
- [ ] Test email deliverability (check spam score)

### 7. Payment Integration
- [ ] Test Mayar webhook in production environment
- [ ] Add idempotency keys to prevent duplicate charges
- [ ] Implement payment reconciliation (daily cron job)
- [ ] Add payment failure handling
- [ ] Store payment receipts/invoices

### 8. AI Features (Gemini)
- [ ] Add fallback when Gemini API is down
- [ ] Implement response caching
- [ ] Add content moderation for AI-generated content
- [ ] Rate limit AI requests per user
- [ ] Monitor API costs

### 9. PWA & Service Worker
- [ ] Test offline functionality
- [ ] Implement background sync for failed requests
- [ ] Add update notification when new version available
- [ ] Test install flow on multiple devices
- [ ] Verify manifest.json is complete

### 10. Monitoring & Analytics
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Add performance monitoring (Vercel Analytics, Google Analytics)
- [ ] Track key metrics:
  - Recipe views
  - Member registrations
  - Payment conversions
  - API error rates
  - Page load times

---

## 🟢 MEDIUM PRIORITY (Nice to Have)

### 11. Testing
- [ ] Add unit tests for critical functions (auth, payment)
- [ ] Add integration tests for API routes
- [ ] Add E2E tests for key user flows (Playwright, Cypress)
- [ ] Set up CI/CD pipeline with automated tests

### 12. Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] Environment variables documentation
- [ ] Database schema documentation
- [ ] Troubleshooting guide

### 13. Accessibility
- [ ] Run Lighthouse audit (target score: 90+)
- [ ] Test with screen readers
- [ ] Ensure keyboard navigation works
- [ ] Add ARIA labels where needed
- [ ] Test color contrast ratios

### 14. SEO
- [ ] Add structured data (JSON-LD) for recipes
- [ ] Optimize meta tags for all pages
- [ ] Add robots.txt
- [ ] Submit sitemap to Google Search Console
- [ ] Implement canonical URLs

### 15. Backup & Disaster Recovery
- [ ] Set up automated MongoDB backups
- [ ] Test restore procedure
- [ ] Document recovery steps
- [ ] Set up monitoring alerts

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Run `npm run build` locally — verify no errors
- [ ] Test all critical user flows in staging
- [ ] Verify all environment variables are set in Vercel
- [ ] Run security audit: `npm audit`
- [ ] Check for outdated dependencies: `npm outdated`

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Monitor error logs for 1 hour post-deployment
- [ ] Test payment flow in production
- [ ] Verify email notifications work

### Post-Deployment
- [ ] Update DNS if needed
- [ ] Enable CDN caching
- [ ] Set up monitoring alerts
- [ ] Document any issues encountered
- [ ] Create rollback plan

---

## 🔧 RECOMMENDED TOOLS

### Security
- [ ] Snyk (vulnerability scanning)
- [ ] OWASP ZAP (penetration testing)

### Monitoring
- [ ] Sentry (error tracking)
- [ ] Vercel Analytics (performance)
- [ ] LogRocket (session replay)

### Performance
- [ ] Lighthouse CI
- [ ] WebPageTest
- [ ] Bundle Analyzer

### Testing
- [ ] Playwright (E2E)
- [ ] Vitest (unit tests)
- [ ] MSW (API mocking)

---

## 📊 METRICS TO TRACK

### Technical
- Response time (p50, p95, p99)
- Error rate (target: <0.1%)
- Uptime (target: 99.9%)
- Database query time
- API rate limit hits

### Business
- Daily active users
- Recipe views
- Member registrations
- Payment conversion rate
- Recipe request completion rate

---

## 🚀 LAUNCH READINESS SCORE

Current Status: **60/100** ⚠️

**Breakdown**:
- Security: 50/100 (auth refactor needed)
- Performance: 70/100 (DB queries need optimization)
- Reliability: 60/100 (error handling incomplete)
- Monitoring: 40/100 (no proper logging/alerts)
- Testing: 30/100 (no automated tests)

**Recommendation**: Fix CRITICAL issues before production launch. Aim for 85+ score.
