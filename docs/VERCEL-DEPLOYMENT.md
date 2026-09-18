# Vercel Deployment & Staging Verification

## Canonical Vercel Project (§12)
- **Project Name:** `kabatos-program-platform`
- **Project ID:** `prj_tM5CUywwMBvYqAh5CHmdqZ6lv4qD`
- **Connected Git Repository:** `mudasarimamofficial/kabatos-program-platform`
- **Target Staging Branch:** `audit/independent-release-gate` (pre-transfer release gate)

## Staging & Preview Environment Verification (§86, §87)
1. **Supabase Binding:** Points to `kabatos-program-platform-dev` (`finbvtwjddrmbuuuyeni`).
2. **Stripe Binding:** TEST Mode verified ($4.99 USD / month, 7-day trial; real acceptance passed).
3. **Current Authoritative Preview Deployment:**
   - **Active Alias:** `https://kabatos-stripe-test.vercel.app`
   - **Deployment URL:** `https://kabatos-program-platform-leh18wkqy.vercel.app`
   - **Deployment ID:** `dpl_EgbMXb71mbQG27KxHJtw5Spj1e78`
   - **Source Commit:** `f1be49d46f9fe09b11bbe01e06a6de1748f83ff5` (Aligned with local & origin branch HEAD)
   - **Deployment Status:** `READY`
4. **Historical Deployments (Audit Trail):**
   - Acceptance Baseline: `dpl_3JABmn4dNizTiPSwdXdUjT5M2d37` (`fexndfl9r`, commit `a52f631`)
   - Initial Staging: `dpl_HtD8aatK7CNQ9w51znWvqMHQSsMN` (`f5o35hva4`)
   - Release Gate: `dpl_HLNLWrVA5ECeuNuifgV6uFP8UXC5` (`dstgjx4db`)
   - Stripe Test Execution: `dpl_DB55kE5b9Wurp2hJuKMjZemsdGGn` (`ihn7e2a7d`)
5. **Build Pipeline:**
   - Command: `pnpm build`
   - Output: 19 static & dynamic App Router routes compiled via Turbopack in 2.5s.
   - Zero build errors, zero type errors.
6. **Staging Smoke Tests:**
   - Branded routing at `/[brandSlug]` loads correctly.
   - Onboarding form validates and directs to activation.
   - Dashboard renders calendar day, progress percentage, and usage timeline.
   - Admin routes load metrics and brand roster.
   - QR Canvas renders and triggers True XML SVG and PNG downloads.
