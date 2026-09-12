# Vercel Deployment & Staging Verification

## Canonical Vercel Project (§12)
- **Project Name:** `kabatos-program-platform`
- **Project ID:** `prj_tM5CUywwMBvYqAh5CHmdqZ6lv4qD`
- **Connected Git Repository:** `mudasarimamofficial/kabatos-program-platform`
- **Target Staging Branch:** `feat/antigravity-fullstack` / `staging`

## Staging Environment Verification (§86, §87)
1. **Supabase Binding:** Points to `kabatos-program-platform-dev` (`finbvtwjddrmbuuuyeni`).
2. **Stripe Binding:** TEST Mode only.
3. **Build Pipeline:**
   - Command: `pnpm build`
   - Output: 13 static & server-rendered App Router pages.
   - Zero build errors, zero type errors.
4. **Staging Smoke Tests:**
   - Branded routing at `/[brandSlug]` loads correctly.
   - Onboarding form validates and directs to activation.
   - Dashboard renders calendar day, progress percentage, and usage timeline.
   - Admin routes load metrics and brand roster.
   - QR Canvas renders and triggers True XML SVG and PNG downloads.
