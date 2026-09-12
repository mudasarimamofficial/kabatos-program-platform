# CLIENT HANDOFF MANUAL — KABATOS PROGRAM PLATFORM

**Target Brand #1:** COMPREX  
**Engineering Platform:** Kabatos Program Platform  
**Target Repository:** `mudasarimamofficial/kabatos-program-platform`  
**Deployment Infrastructure:** Next.js (App Router) + Supabase PostgreSQL + Vercel + Stripe  
**Release Status:** **FULL-STACK RELEASE CANDIDATE (BLOCKED PENDING APPROVED STRIPE PRICE)**

---

## 1. Executive Deliverable Overview

The Kabatos Program Platform is a multi-brand customer product-usage tracking and subscription SaaS platform designed for high-end wellness brands. **COMPREX** is delivered as Brand #1 with zero hardcoding, strictly configured as tenant data.

### Delivered Subsystems
1. **Customer Journey (C-01 to C-10):**
   - Branded welcome entry (`/comprex`)
   - Frictionless, passwordless customer onboarding (Name + Email/Phone + optional Order #)
   - Program overview & dynamic duration snapshotting
   - Secure Stripe checkout handoff & verification state
   - Real-time customer dashboard with dynamic schedule indicators
   - One-click usage completion ("Mark Complete") with undo capability
   - Deterministic calendar-date program engine (current day, progress %, remaining days)
   - Time-based "running-low" notification with external reorder redirect
   - Program completion state preserving true adherence history
   - Error & invalid brand slug handling (`/_not-found`)

2. **Master Admin Portal (A-01 to A-07):**
   - Secure Supabase Auth master administrator login (`/admin/login`)
   - High-level operational metrics (Total Brands, Total Customers, Active Programs, Active Subscriptions)
   - Multi-brand roster and dynamic brand editor (Name, Logo, Theme Colors, Product Name, Duration, Dynamic Day Chips, Reorder URL)
   - Customer roster & individual program snapshot detail inspector
   - Access links with real-time QR generation, link copying, PNG export, and true XML SVG download

3. **Backend Architecture & Security:**
   - Supabase PostgreSQL with 8 reproducible migrations applied to DEV (`finbvtwjddrmbuuuyeni`)
   - Strict Row Level Security (RLS) preventing anonymous data enumeration
   - Immutable snapshot triggers (`prevent_program_snapshot_rewrite` and `prevent_config_rewrite`)
   - Cryptographic opaque capability token customer sessions via HttpOnly cookies
   - Supabase Storage bucket (`brand-assets`) with MIME type validation (PNG, JPEG, WebP)
   - Stripe webhook engine with signature verification and database idempotency (`stripe_events`)

---

## 2. Environment Architecture & Isolation

| Environment | Purpose | Supabase Project Ref | Stripe Mode | Vercel Environment |
| :--- | :--- | :--- | :--- | :--- |
| **Development / Local** | Feature development & automated testing | `finbvtwjddrmbuuuyeni` (`kabatos-program-platform-dev`) | TEST | Local (`pnpm dev`) |
| **Preview / Staging** | Automated PR & branch verification | `finbvtwjddrmbuuuyeni` (`kabatos-program-platform-dev`) | TEST | Vercel Preview (`staging/release-candidate`) |
| **Production** | Commercial live operations | `svghcgvmnpjuzzxtnjch` (`kabatos-program-platform-prod`) | LIVE | Vercel Production (`main`) |

> [!IMPORTANT]
> The Production Supabase database (`svghcgvmnpjuzzxtnjch`) remains completely unmutated. Migrations must be promoted only after final client acceptance and Stripe commercial term signoff.

---

## 3. How to Provision a Master Administrator

Administrators must be authenticated through Supabase Auth and registered in `public.admin_profiles` with `active = true`.

To provision a new master administrator in the DEV environment:

```bash
ADMIN_EMAIL=admin@yourdomain.com \
ADMIN_PASSWORD=YourSecurePassword123! \
npx tsx scripts/bootstrap-admin.ts
```

The script:
1. Validates connection to the Supabase backend.
2. Creates the user in `auth.users` with `email_confirm: true`.
3. Upserts the record in `public.admin_profiles` with `active: true`.
4. Enables immediate login at `/admin/login`.

---

## 4. Pending Commercial Term (Client Action Required)

The entire full-stack software architecture, UI, program engine, and payment handoff mechanisms are 100% complete and tested. One external business input is required from the client:

> [!WARNING]
> **Commercial Blocker: Recurring Subscription Price Terms**
> 
> To enable live Stripe subscription checkout, provide:
> 1. **Price Amount:** (e.g., $29.00, $49.00)
> 2. **Billing Currency:** (e.g., USD, EUR, GBP)
> 3. **Billing Interval:** (e.g., monthly, every 4 weeks)
> 4. **Trial Duration (if any):** (e.g., None, 7 days, 14 days)
> 
> Once approved, create the Price in your Stripe TEST dashboard and configure `COMPREX_STRIPE_TEST_PRICE_ID` in Vercel environment variables.

---

## 5. Verification Commands

To independently verify the entire application on your workstation:

```bash
# 1. Typecheck
pnpm typecheck

# 2. Run all unit, snapshot, and adversarial security tests (41 tests)
pnpm test:unit

# 3. Run Playwright end-to-end browser tests
pnpm test:e2e

# 4. Create production build
pnpm build
```
