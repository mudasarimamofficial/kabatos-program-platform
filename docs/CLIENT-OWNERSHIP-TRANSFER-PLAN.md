# Kabatos Program Platform / COMPREX
# Client Infrastructure Ownership Transfer Plan & Protocol

**Document Version:** 1.0.0 — Official Contractual Delivery Specification  
**Client Flagship:** COMPREX (Brand #1)  
**Contractual Context:** Fiverr $320 Full-Stack Milestone Agreement  
**Date:** September 13, 2026  
**Status:** **PENDING_CLIENT_ACCOUNT_ACCESS / PENDING_TRANSFER**

---

## 1. Contractual Background & Ownership Authority (§10, §14)

### Historical Agreement Context
During project initiation, the client originally specified hosting and infrastructure under client-owned accounts. On September 03, 2026, the client authorized temporary staging and development under developer-controlled infrastructure (developer GitHub, developer Supabase, developer Vercel) to accelerate development.

However, the final contractual delivery terms explicitly stipulate that **final project acceptance and delivery require full ownership transfer** to accounts under the client's direct control.

### Zero-Vendor-Lock-In Guarantee
Following the transfer, the entire application, database, authentication system, CI/CD pipeline, and Stripe payment integration must operate completely independently without ongoing reliance, credentials, or billing tied to the developer's personal accounts.

---

## 2. Comprehensive Transfer Checklist

The following matrix defines the step-by-step transfer requirements across all 11 technical dimensions:

### A. GitHub Repository & Version Control Transfer
- [ ] **Repository Transfer:** Transfer `mudasarimamofficial/kabatos-program-platform` directly to the client's GitHub organization or account (via GitHub Settings -> Transfer ownership).
- [ ] **Admin Rights:** Assign Owner / Admin privileges to the client's GitHub account.
- [ ] **Branch Protection:** Retain `main` branch protection rules requiring status checks and PR reviews.
- [ ] **Developer Deprovisioning:** Revoke developer write access once client ownership is verified.

### B. Supabase Database & Backend Transfer
- [ ] **Target Organization:** Client creates or designates a Supabase organization on the Free or Pro tier.
- [ ] **Project Transfer or Provisioning:**
  - *Option 1 (Direct Project Transfer):* In Supabase dashboard: Project Settings -> General -> Transfer Project to client's organization.
  - *Option 2 (Fresh Production Provisioning):* Create a clean production project in client's Supabase account, apply all 8 migrations via `supabase db push --linked`, and run `scripts/bootstrap-admin.ts`.
- [ ] **Row Level Security (RLS):** Verify all 8 core tables have active RLS and verified security policies.
- [ ] **Storage Buckets:** Verify public read-only `brand-assets` bucket exists with proper MIME-type restrictions.

### C. Vercel Hosting & Domain Deployment
- [ ] **Project Transfer:** In Vercel dashboard: Project Settings -> General -> Transfer Project to client's Vercel Team / Account.
- [ ] **Git Re-link:** Connect client's transferred GitHub repository to client's Vercel project.
- [ ] **Custom Domain / DNS:**
  - Add client's production domain (e.g. `program.goodcomprex.com` or `app.goodcomprex.com`).
  - Configure CNAME and ALIAS DNS records in client's DNS registrar (Shopify / Cloudflare / GoDaddy).
  - Verify SSL certificate generation and HTTPS enforcement.

### D. Stripe Commercial & Billing Account Configuration
- [ ] **Client Stripe Dashboard:** Client provides restricted access or configures products in their own Stripe dashboard (`dashboard.stripe.com`).
- [ ] **Recurring Price Provisioning:**
  - Create recurring subscription product: `COMPREX Daily Routine Program`.
  - Configure agreed price amount (e.g. $29.00), currency (USD), billing interval (monthly), and trial days (if applicable).
  - Record the resulting `price_XXXX` ID.
- [ ] **Stripe Webhooks:**
  - Add production endpoint: `https://[client-domain]/api/stripe/webhook`.
  - Listen for events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
  - Record production webhook secret `whsec_XXXX`.

### E. Environment Variables & API Secrets Handover
Configure the following production environment variables exclusively in the client's Vercel project:
- `NEXT_PUBLIC_APP_URL`: Production URL (e.g. `https://app.goodcomprex.com`)
- `NEXT_PUBLIC_SUPABASE_URL`: Client Supabase project endpoint
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Client Supabase anonymous public key
- `SUPABASE_SECRET_KEY`: Client Supabase service_role secret key (encrypted, server-only)
- `STRIPE_SECRET_KEY`: Client Stripe LIVE restricted/secret key
- `STRIPE_WEBHOOK_SECRET`: Client Stripe LIVE webhook signing secret
- `APP_ENV`: `production`

### F. Security & Secrets Rotation
- [ ] Rotate all developer-generated JWT secrets and anon/service keys.
- [ ] Generate fresh encryption salts and session capability secrets.
- [ ] Invalidate all DEV staging session cookies.

### G. Master Administrator Provisioning
- [ ] Run `scripts/bootstrap-admin.ts` pointing to the client's production Supabase instance.
- [ ] Provision the client's official email (e.g. `admin@goodcomprex.com`) with a temporary secure passphrase.
- [ ] Client logs in at `/admin/login`, verifies MFA / password reset, and confirms full administrative control over `/admin/brands`, `/admin/customers`, and `/admin/access`.

### H. Documentation & Runbooks
- [ ] Deliver `UNIFIED-MASTER-DOCUMENTATION.md` and `docs/UNIFIED-DESIGN-AND-EXPERIENCE-DOCUMENTATION.md`.
- [ ] Deliver `docs/CLIENT-HANDOFF.md` containing operational brand and QR code export runbooks.
- [ ] Deliver this `CLIENT-OWNERSHIP-TRANSFER-PLAN.md`.

### I. Post-Transfer End-to-End Acceptance Smoke Test
- [ ] **Customer Entry:** Scan QR code or visit `https://[client-domain]/comprex`.
- [ ] **Onboarding:** Complete C-01 Welcome, C-02 Onboarding form, and view C-03 Activation.
- [ ] **Checkout Flow:** Validate live checkout redirect to Stripe with client-approved price.
- [ ] **Webhook Persistence:** Confirm `checkout.session.completed` stores active subscription record in PostgreSQL.
- [ ] **Dashboard Daily Routine:** Verify day pill, scheduled use card, mark as completed interaction, and progress bar advance.
- [ ] **Admin Inspection:** Verify new customer appears under `/admin/customers` and total metrics update under `/admin/overview`.

---

## 3. Current Delivery Status & Next Actions

| Stream | Current Technical State | Contractual Status |
| :--- | :--- | :--- |
| **Frontend UI / UX & Motion** | 100/100 Complete & Verified | **PASS** |
| **Backend & Database Logic** | Supabase DEV Active, RLS Verified | **PASS (DEV)** |
| **Stripe Architecture** | Implemented, Verified, Idempotent | **BLOCKED_PENDING_APPROVED_STRIPE_PRICE** |
| **Client Ownership Transfer** | Prepared & Documented | **PENDING_CLIENT_ACCOUNT_ACCESS** |
| **Production Promotion** | Protected, Unmutated | **LOCKED (Requires Transfer & Commercial Signoff)** |
