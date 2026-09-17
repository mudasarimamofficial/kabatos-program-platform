# Requirements Traceability Matrix (§112, §113)

Current Stripe scope: approved 499-cent USD monthly service, seven-day trial, capability-scoped Checkout/cancellation, signed durable reconciliation and DB access enforcement. Commercial approval is complete; real acceptance status is exclusively recorded in [Stripe TEST evidence](evidence/stripe-test-acceptance.md). Historical Stripe PASS/BLOCKED rows below are superseded.

| Req ID | Description | Source | Route / UI | Implementation File | Database Object | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **C-01** | Brand Welcome / Entry Point | Brief | `/[brandSlug]` | `components/customer/welcome-screen.tsx` | `brands` | `e2e/frontend.spec.ts` | **PASS** |
| **C-02** | Frictionless Customer Onboarding | Brief | `/[brandSlug]/start` | `components/customer/start-screen.tsx` | `customers` | `e2e/frontend.spec.ts` | **PASS** |
| **C-03** | Program Activation Overview | Brief | `/[brandSlug]/activate` | `components/customer/activate-screen.tsx` | `customer_programs` | `e2e/frontend.spec.ts` | **PASS** |
| **C-04** | Secure Checkout Handoff | Brief | `/[brandSlug]/checkout` | `components/customer/checkout-screen.tsx` | `subscriptions` | `e2e/frontend.spec.ts` | **PASS** |
| **C-05** | Success / Starting Confirmation | Brief | `/[brandSlug]/success` | `components/customer/success-screen.tsx` | `customer_programs` | `e2e/frontend.spec.ts` | **PASS** |
| **C-06** | Customer Dashboard | Brief | `/[brandSlug]/dashboard` | `components/customer/dashboard-screen.tsx` | `customer_programs` | `e2e/frontend.spec.ts` | **PASS** |
| **C-07** | Mark Usage Complete & Undo | Brief | `/[brandSlug]/dashboard` | `components/customer/dashboard-screen.tsx` | `program_usage` | `e2e/frontend.spec.ts` | **PASS** |
| **C-08** | Running-Low Time Heuristic | Brief | `/[brandSlug]/dashboard` | `components/customer/dashboard-screen.tsx` | `program_configs` | `lib/program-engine/engine.test.ts` | **PASS** |
| **C-09** | Program Completion Notice | Brief | `/[brandSlug]/dashboard` | `components/customer/dashboard-screen.tsx` | `customer_programs` | `lib/program-engine/engine.test.ts` | **PASS** |
| **C-10** | Error / Invalid Brand Slug | Spec | `/_not-found` | `components/customer/error-screen.tsx` | N/A | `e2e/frontend.spec.ts` | **PASS** |
| **A-01** | Master Admin Login | Spec | `/admin/login` | `app/admin/login/page.tsx` | `auth.users` | Manual / Playwright | **PASS** |
| **A-02** | Master Admin Dashboard | Brief | `/admin` | `components/admin/admin-overview.tsx` | `admin_dashboard_counts` | `e2e/frontend.spec.ts` | **PASS** |
| **A-03** | Brands Roster | Brief | `/admin/brands` | `components/admin/brand-roster.tsx` | `brands` | `e2e/frontend.spec.ts` | **PASS** |
| **A-04** | Brand Create & Editor | Brief | `/admin/brands/[id]` | `components/admin/brand-editor.tsx` | `admin_edit_brand` | `e2e/frontend.spec.ts` | **PASS** |
| **A-05** | Customer Roster | Brief | `/admin/customers` | `components/admin/customer-roster.tsx` | `admin_customer_roster` | `e2e/frontend.spec.ts` | **PASS** |
| **A-06** | Customer Program Detail | Brief | `/admin/customers/[id]` | `components/admin/customer-detail.tsx` | `admin_customer_detail` | Code Inspection | **PASS** |
| **A-07** | QR Canvas & True SVG Export | Brief | `/admin/access` | `components/admin/access-links.tsx` | `access_links` | `lib/program/qr.test.ts` | **PASS** |
| **ENG-01** | Deterministic Calendar-Date Math | Bible | Pure Engine | `lib/program-engine/index.ts` | N/A | `lib/program-engine/engine.test.ts` | **PASS** |
| **ENG-02** | Snapshot Invariance Guarantee | Bible | Schema + RPC | `customer_programs` | Snapshot Trigger | `lib/program-engine/snapshot.test.ts` | **PASS** |
| **ENG-03** | Webhook Idempotency Engine | Bible | `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` | `stripe_events` | `lib/stripe/stripe.test.ts` | **PASS** |
| **ST-01** | Approved Stripe Commercial Price | Brief | Billing Handoff | `/api/stripe/checkout` | `program_configs.stripe_price_id` | Real Stripe TEST acceptance verified ($4.99 USD/mo, 7-day trial) | **PASS** |
| **TR-01** | Client Infrastructure Ownership Transfer | Agreement | Staging -> Client Accounts | `docs/CLIENT-OWNERSHIP-TRANSFER-PLAN.md` | Full Client Accounts | Verification Smoke Test | **PENDING_TRANSFER** |
# 2026-09-17 gate status

Authorization, cache propagation, brand creation, sessions, RLS, assets, contrast and QR gates passed in `docs/evidence/release-gate.json`. Clean disposable-DB reproduction was blocked by the unavailable local Docker Linux engine. Approved Stripe commercial terms ($4.99 USD/mo, 7-day trial) are active in DEV and verified through real Stripe TEST acceptance (see `docs/evidence/stripe-test-acceptance.md`). Client-owned infrastructure transfer remains the final external gate (`PENDING_CLIENT_ACCOUNT_ACCESS / PENDING_TRANSFER`).
