# Vercel Deployment & Staging Verification

## Canonical Vercel Project (§12)
- **Project Name:** `kabatos-program-platform`
- **Project ID:** `prj_tM5CUywwMBvYqAh5CHmdqZ6lv4qD`
- **Connected Git Repository:** `mudasarimamofficial/kabatos-program-platform`
- **Target Staging Branch:** `feat/antigravity-fullstack` / `staging`

## Staging Environment Verification (§86, §87)
1. **Supabase Binding:** Points to `kabatos-program-platform-dev` (`finbvtwjddrmbuuuyeni`).
2. **Stripe Binding:** TEST Mode only (`BLOCKED_PENDING_APPROVED_STRIPE_PRICE` fallback active).
3. **Live Staging Deployment:**
   - **Preview URL:** `https://kabatos-program-platform-f5o35hva4.vercel.app` (also `https://kabatos-program-platform-gyi984y8t.vercel.app`)
   - **Deployment ID:** `dpl_HtD8aatK7CNQ9w51znWvqMHQSsMN`
   - **Deployment Status:** `READY`
4. **Build Pipeline:**
   - Command: `pnpm build`
   - Output: 13 static & server-rendered App Router pages.
   - Zero build errors, zero type errors.
5. **Staging Smoke Tests:**
   - Branded routing at `/[brandSlug]` loads correctly.
   - Onboarding form validates and directs to activation.
   - Dashboard renders calendar day, progress percentage, and usage timeline.
   - Admin routes load metrics and brand roster.
   - QR Canvas renders and triggers True XML SVG and PNG downloads.
