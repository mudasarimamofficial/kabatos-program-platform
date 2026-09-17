# FINAL INFRASTRUCTURE OWNERSHIP TRANSFER RUNBOOK
# Kabatos Program Platform / COMPREX (Brand #1)

**Document Version:** 1.0.0 — Canonical Execution Protocol  
**Target Milestone:** Client Infrastructure Ownership Transfer  
**Status:** **PENDING_CLIENT_ACCOUNT_ACCESS / PENDING_TRANSFER**  
**Governing Principle:** Zero developer vendor lock-in. Full transfer of source code, hosting, database, billing, and domains to client-owned accounts.

---

## Transfer Sequence & Protocol

The ownership transfer process must be executed strictly in the following 9 sequential phases:

```
[Phase 1: Client Access & Invites]
               │
               ▼
[Phase 2: GitHub Repository Transfer]
               │
               ▼
[Phase 3: Supabase Database Transfer / Provisioning]
               │
               ▼
[Phase 4: Vercel Project Transfer & Configuration]
               │
               ▼
[Phase 5: Client Stripe TEST Configuration & Smoke]
               │
               ▼
[Phase 6: Custom Domain DNS & SSL Verification]
               │
               ▼
[Phase 7: End-to-End Production Readiness Audit]
               │
               ▼
[Phase 8: LIVE Billing Enablement (Client Authorized)]
               │
               ▼
[Phase 9: Secret Rotation & Developer Deprovisioning]
```

---

### PHASE 1 — CLIENT ACCESS & INVITATIONS
1. Confirm receipt of client inputs requested in `docs/CLIENT-ACCOUNT-ACCESS-REQUEST.md`:
   - GitHub username / organization handle.
   - Supabase organization target or member invitation.
   - Vercel team/account member invitation.
   - Stripe Developer role invitation (`dashboard.stripe.com`).
   - Confirmed production custom domain (e.g. `program.goodcomprex.com`).
   - Master Administrator email address.
2. Verify access to each platform before initiating migrations or transfers.
3. Confirm that NO passwords or raw secrets were transmitted via insecure chat channels.

---

### PHASE 2 — GITHUB REPOSITORY TRANSFER
1. Navigate to GitHub: `https://github.com/mudasarimamofficial/kabatos-program-platform/settings`.
2. Under **Danger Zone -> Transfer ownership**, enter the client's GitHub username or Organization.
3. Establish client account as primary **Owner**.
4. Confirm branch protection rules on `main`:
   - Require status checks to pass before merging.
   - Require pull request reviews.
5. Retain temporary developer collaborator access during the transition; do not remove developer access until post-transfer verification in Phase 7 is fully validated.

---

### PHASE 3 — SUPABASE DATABASE PROVISIONING
Choose Option A or Option B based on client infrastructure preference:

#### Option A: Direct Project Transfer
1. In developer Supabase dashboard for `kabatos-program-platform-prod` (`svghcgvmnpjuzzxtnjch`):
2. Project Settings -> General -> **Transfer Project**.
3. Select the client's Supabase Organization.

#### Option B: Fresh Client Production Provisioning (Recommended)
1. In client's Supabase dashboard, create new production project (e.g. `kabatos-comprex-prod` in closest region to client audience, e.g. `us-east-1` or `eu-west-1`).
2. Link local CLI to client project: `npx supabase link --project-ref <client-prod-ref>`.
3. Apply all **11 canonical migrations** in chronological order:
   ```bash
   npx supabase db push --linked
   ```
   *Migrations applied:*
   - `20260912095018_core_schema.sql` (Core tables, foreign keys, triggers)
   - `20260912095023_rls_and_rpc.sql` (RLS policies, customer capability RPCs)
   - `20260912095029_admin_and_stripe_rpc.sql` (Admin security definer RPCs, Stripe ledger)
   - `20260912095033_checkout_and_reconciliation.sql` (Checkout reservation & reconciliation)
   - `20260912095039_brand_asset_storage.sql` (Storage bucket `brand-assets` & policies)
   - `20260912095043_tracking_activation_rpc.sql` (Tracking activation RPCs)
   - `20260912095406_privilege_hardening.sql` (Schema privilege lock)
   - `20260912095513_public_rpc_role_cleanup.sql` (Public role cleanup)
   - `20260917090000_release_gate_asset_and_customer_dto.sql` (Asset/customer DTO corrections)
   - `20260917091000_customer_session_revocation.sql` (Customer session revocation & expiry)
   - `20260917100000_stripe_trial_access.sql` (Stripe trial access, scheduled cancellation, reconciliation)
4. Seed COMPREX Brand #1 configuration (Zero test fixtures, zero Demo Wellness):
   - Insert production brand record with name `COMPREX`, slug `comprex`, duration `14`, schedule `[1,3,5,7,9,11,13]`, colors `#F07106`, `#D85800`, `#FDEEE1`, and authentic product packaging assets.
5. Provision client's Master Administrator:
   ```bash
   ADMIN_EMAIL=admin@goodcomprex.com ADMIN_PASSWORD=TemporarySecurePass! npx tsx scripts/bootstrap-admin.ts
   ```

---

### PHASE 4 — VERCEL PROJECT TRANSFER & ENVIRONMENT CONFIGURATION
1. In Vercel: Project Settings -> General -> **Transfer Project** to client's Vercel Team.
2. Link transferred project to the client's transferred GitHub repository.
3. Configure production environment variables in client's Vercel project:
   - `NEXT_PUBLIC_APP_URL` = `https://[client-domain]`
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://<client-prod-ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Client Supabase anon key
   - `SUPABASE_URL` = `https://<client-prod-ref>.supabase.co`
   - `SUPABASE_SECRET_KEY` = Client Supabase service_role key (encrypted, server-only)
   - `COMPREX_STRIPE_TEST_PRICE_ID` = Client Stripe TEST Price ID (for staging verification)

---

### PHASE 5 — CLIENT STRIPE TEST CONFIGURATION & SMOKE
1. Under client's Stripe Dashboard in **TEST mode**:
2. Create Product: `Kabatos / COMPREX Tracking Service`.
3. Create Price: $4.99 USD, Recurring Monthly, 7-day trial.
4. Register Webhook Endpoint:
   - URL: `https://[preview-or-client-domain]/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
5. Configure `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY` in Vercel preview/staging.
6. Run single smoke test using test card `4242 4242 4242 4242` to verify client-owned Stripe webhook delivery and DB reconciliation.

---

### PHASE 6 — CUSTOM DOMAIN DNS & SSL VERIFICATION
1. Add production domain in Vercel: `Settings -> Domains` (e.g. `program.goodcomprex.com`).
2. Instruct client to add DNS CNAME record:
   - Name: `program`
   - Value: `cname.vercel-dns.com`
3. Verify automatic Let's Encrypt SSL issuance and HTTPS enforcement.

---

### PHASE 7 — PRODUCTION READINESS AUDIT
1. Verify client can log into Master Admin at `https://[client-domain]/admin/login`.
2. Client resets password and confirms MFA if desired.
3. Verify brand editor renders COMPREX configuration and day chips.
4. Verify dynamic QR code canvas generates valid SVG/PNG pointing to `https://[client-domain]/comprex`.
5. Verify anonymous requests to `/admin` and `/comprex/dashboard` strictly redirect.

---

### PHASE 8 — LIVE BILLING ENABLEMENT (ONLY AFTER CLIENT LAUNCH SIGN-OFF)
> [!CAUTION]
> LIVE billing must NEVER be enabled on developer infrastructure or without explicit written client launch authorization.
1. In client's Stripe Dashboard in **LIVE mode**:
   - Create Product: `Kabatos / COMPREX Tracking Service`.
   - Create Price: $4.99 USD / month, 7-day trial.
   - Register LIVE Webhook Endpoint: `https://[client-domain]/api/stripe/webhook`.
2. Update Vercel Production Environment Variables with client LIVE credentials (`pk_live_...`, `sk_live_...`, `whsec_...`).
3. Promote release to Vercel Production from `main` branch.
4. Perform live-safe non-charge verification (load checkout page, verify Stripe live elements render).

---

### PHASE 9 — SECRET ROTATION & DEVELOPER DEPROVISIONING
1. Client rotates Supabase database passwords and service keys if desired.
2. Remove temporary developer team member invites from:
   - GitHub organization / repository collaborators.
   - Supabase team members.
   - Vercel team members.
   - Stripe team members.
3. Confirm zero developer credentials, keys, or access remain attached to the production deployment.
4. Client signs off on final contractual delivery acceptance.
