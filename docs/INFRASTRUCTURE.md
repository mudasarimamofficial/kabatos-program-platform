# Kabatos Program Platform — Infrastructure & Environments

## Infrastructure Overview
The application infrastructure spans canonical Git, Supabase PostgreSQL with SSR authentication, Stripe Billing, and Vercel Deployment.

### 1. Canonical GitHub Repository (§8)
- **URL:** `https://github.com/mudasarimamofficial/kabatos-program-platform.git`
- **Owner / Repo:** `mudasarimamofficial/kabatos-program-platform`
- **Primary Working Branch:** `feat/antigravity-fullstack`

### 2. Canonical Supabase Projects (§10, §11)
- **Development Project:**
  - Name: `kabatos-program-platform-dev`
  - URL: `https://finbvtwjddrmbuuuyeni.supabase.co`
  - Project Ref: `finbvtwjddrmbuuuyeni`
  - Status: Linked, Active, 8 Canonical Migrations Applied.
- **Production Project (HARD LOCK — ZERO DEVELOPMENT MUTATIONS):**
  - Name: `kabatos-program-platform-prod`
  - URL: `https://svghcgvmnpjuzzxtnjch.supabase.co`
  - Project Ref: `svghcgvmnpjuzzxtnjch`
  - Status: Strictly Unlinked during ordinary development. Requires explicit client promotion authorization.

### 3. Canonical Vercel Project (§12)
- **Project ID:** `prj_tM5CUywwMBvYqAh5CHmdqZ6lv4qD`
- **Framework:** Next.js 16
- **Routing:** App Router

---

# Environment Configuration Matrix (§13)

| Component | Local / Development | Vercel Preview / Staging | Vercel Production |
| :--- | :--- | :--- | :--- |
| **Supabase Project** | `kabatos-program-platform-dev` (`finbvtwjddrmbuuuyeni`) | `kabatos-program-platform-dev` (`finbvtwjddrmbuuuyeni`) | `kabatos-program-platform-prod` (`svghcgvmnpjuzzxtnjch`) |
| **Stripe Environment** | TEST Mode | TEST Mode | LIVE Mode (Post-Promotion Approval) |
| **Target URL** | `http://localhost:3000` | Preview URL / Staging Domain | Production Custom Domain |
| **Database Seed** | COMPREX + Demo Wellness (Multi-Brand) | COMPREX + Demo Wellness | Approved COMPREX Only (No Fixtures) |
| **Admin Access** | Master Admin (Auth) | Master Admin (Auth) | Master Admin (Provisioned Securely) |

## Expected Environment Variables (§14)
### Public Variables:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Server-Only Variables:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `COMPREX_STRIPE_TEST_PRICE_ID`
