# Production Promotion Checklist & Gate Review

## ⚠️ MANDATORY PROMOTION LOCK (§107, §108)
Under STRICT engineering policy, NO mutations may be executed against the Supabase Production project (`svghcgvmnpjuzzxtnjch`) or Stripe LIVE billing without explicit written client authorization.

---

## 1. Migration Review for Production
The following 11 canonical migrations are audited, verified on DEV (`finbvtwjddrmbuuuyeni`), and queued for production execution upon authorization:
1. `20260912095018_core_schema.sql` (Creates core tables, foreign keys, and immutability triggers)
2. `20260912095023_rls_and_rpc.sql` (Enables RLS, customer session hashing, and public RPCs)
3. `20260912095029_admin_and_stripe_rpc.sql` (Master admin RPCs and access link procedures)
4. `20260912095033_checkout_and_reconciliation.sql` (Checkout session reservation and event tracking)
5. `20260912095039_brand_asset_storage.sql` (Storage bucket `brand-assets` and admin upload policies)
6. `20260912095043_tracking_activation_rpc.sql` (Customer tracking activation function)
7. `20260912095406_privilege_hardening.sql` (Hardens function search paths and privileges)
8. `20260912095513_public_rpc_role_cleanup.sql` (Role cleanup for security hardening)
9. `20260917090000_release_gate_asset_and_customer_dto.sql` (Release-gate asset and customer DTO corrections)
10. `20260917091000_customer_session_revocation.sql` (Customer session expiry and revocation controls)
11. `20260917100000_stripe_trial_access.sql` (Stripe trial access, scheduled cancellation, and reconciliation)

## 2. Production Target Ref Verification
- **Target Project:** `kabatos-program-platform-prod`
- **Target Project Ref:** `svghcgvmnpjuzzxtnjch`
- **Current Status:** 100% UNTOUCHED and PROTECTED.

## 3. Production Environment Variables & LIVE Gate
> [!NOTE]
> The current release candidate is TEST-hardened: `lib/stripe/index.ts` unconditionally asserts `sk_test_` keys and `livemode === false`. LIVE billing enablement requires an explicitly authorized client-owned production configuration step during ownership transfer.
- [ ] `NEXT_PUBLIC_APP_URL` = Production Custom Domain (e.g., `https://program.goodcomprex.com`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://svghcgvmnpjuzzxtnjch.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Production Supabase Publishable Key
- [ ] `SUPABASE_URL` = `https://svghcgvmnpjuzzxtnjch.supabase.co`
- [ ] `SUPABASE_SECRET_KEY` = Production Supabase Service Role Key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Client Stripe LIVE Publishable Key (`pk_live_...`)
- [ ] `STRIPE_SECRET_KEY` = Client Stripe LIVE Secret Key (`sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` = Client Stripe LIVE Webhook Secret (`whsec_...`)
- [ ] Client-approved LIVE Price configured and bound via administrative console / verified brand configuration (e.g. $4.99 USD / month, 7-day trial).

## 4. Production Seed Rules (§106)
- **Included:** COMPREX Brand #1 configuration (`/comprex`, 14-day duration, `[1,3,5,7,9,11,13]` schedule, `#F07106` theme).
- **Strictly Excluded:** Demo Wellness, Sarah fixture, test customers, test subscriptions, test webhook events.

## 5. Rollback & Disaster Recovery Plan
- Supabase Automated Backup snapshot verified before migration application.
- In the event of promotion failure, point Vercel production deployment back to the previous stable release commit and restore the database from the pre-promotion snapshot.
