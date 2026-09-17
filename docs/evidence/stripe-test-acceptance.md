# Stripe TEST Acceptance Evidence

**Status**: STRIPE TEST ACCEPTANCE COMPLETE — READY FOR CLIENT OWNERSHIP TRANSFER
**Execution Timestamp**: 2026-09-17T18:03:00Z
**Target Environment**: Vercel Preview (`https://kabatos-stripe-test.vercel.app` / `dpl_DB55kE5b9Wurp2hJuKMjZemsdGGn`)
**Database**: Supabase DEV (`finbvtwjddrmbuuuyeni.supabase.co`)
**Stripe Mode**: TEST (Livemode: `false` enforced across all operations)

---

## 1. Commercial Terms & Pricing Verification

- **Commercial Plan**: Kabatos / COMPREX Tracking Service
- **Stripe TEST Product ID**: `prod_VHGrvdkYDhsdx1` (active, livemode: false)
- **Stripe TEST Price ID**: `price_1UGiK6RCnOFy7ZssnkNPUMvs` (active, livemode: false)
- **Price Amount**: 499 cents ($4.99 USD)
- **Billing Frequency**: Monthly (`interval: month`, `interval_count: 1`)
- **Trial Period**: 7 days (`trial_period_days: 7`)
- **Relationship to Physical Product**: Purely platform tracking & service access; physical product sold externally.
- **Client Terms Approval**: Explicitly approved by client on Fiverr twice.

---

## 2. Real Customer Onboarding & Checkout Evidence

A real test customer onboarding was initiated through the live Vercel Preview application, reserving checkout and creating a live Stripe Checkout Session via `/api/stripe/checkout`.

- **Test Customer Name**: `Stripe Trial QA`
- **Customer Email**: `trial-qa@example.invalid`
- **Customer ID**: `cus_VHI7tUdnhursy9`
- **Checkout Session ID**: `cs_test_a1qz8YD7n47BRAk6xuhoiSpFuLWyt18RkYsgY0Gpd2JARwR5xs5LgB2UNi`
- **Checkout Mode**: `subscription`
- **Checkout Payment Status**: Completed in headless browser using test card `4242 4242 4242 4242`
- **Redirect URL**: `${origin}/comprex/success`

---

## 3. Webhook Delivery & Reconciliation Evidence

- **Configured TEST Webhook ID**: `we_1UGiPVRCnOFy7ZssdVtvIOvI`
- **Target URL**: `https://kabatos-stripe-test.vercel.app/api/stripe/webhook`
- **Webhook Signing Secret**: Configured in Preview environment (verified by signature constructor)
- **Events Received from Stripe**:
  1. `evt_1UGjXZRCnOFy7ZssD2awvny5` (`checkout.session.completed`)
  2. `evt_1UGjXZRCnOFy7Zssad7x1TK6` (`customer.subscription.created`, status: `processed`)
  3. `evt_1UGjXZRCnOFy7Zss5ith6L7c` (`invoice.paid`, status: `processed`)
- **Subscription ID**: `sub_1UGjXYRCnOFy7ZssAQd58qwX`
- **Database Subscription Row**: `a1892e8e-83ad-4378-8b94-21c0fd538f09`
- **Initial Subscription Status**: `trialing`
- **Trial Start**: `2026-09-17T17:56:06+00:00`
- **Trial End**: `2026-09-24T17:56:06+00:00` (Exactly 7 calendar days)
- **Program ID**: `325ffb4d-c30a-4a9e-a362-183700a7fe17`
- **Program Status**: `active` (Activated exactly once, `activated_at: 2026-09-17T17:56:12.593884+00:00`)
- **Snapshot Immutability**: `duration_snapshot: 14`, `schedule_snapshot: [1, 3, 5, 7, 9, 11, 13]`, `price_id_snapshot: price_1UGiK6RCnOFy7ZssnkNPUMvs`

---

## 4. Immediate Trial Access Verification

- Using the cryptographic customer capability session (`kabatos_customer_session`), customer requested `customer_dashboard` RPC and visited `/comprex/dashboard`.
- **Access Granted**: `true`
- **No First Payment Required**: Tracking dashboard immediately unlocked upon verified trialing state.
- **Unauthenticated / Unknown Visitor**: Strictly redirected; zero private data exposed.

---

## 5. Webhook Replay & Idempotency Evidence

- The real Stripe event `evt_1UGjXZRCnOFy7Zssad7x1TK6` was retrieved from Stripe and re-signed using `STRIPE_WEBHOOK_SECRET`.
- The signed payload was posted to the live webhook endpoint `/api/stripe/webhook`.
- **HTTP Response**: `200 OK`
- **Reconciliation Result**: `{ "received": true, "status": "duplicate_ignored" }`
- **Database Verification**: `start_date` and `activated_at` remained strictly identical; no duplicate program or subscription rows created.
- **Artifact**: `docs/evidence/stripe-replay.json`

---

## 6. Trial Cancellation Evidence

- Customer initiated cancellation via `/api/stripe/subscription` POST using their active capability cookie.
- **Stripe Provider Status**: `cancel_at_period_end: true`
- **Database Subscription State**: `cancel_at_period_end: true`, `canceled_at: 2026-09-17T17:58:18+00:00`
- **Subsequent Access Verification**: Customer retains full tracking access through trial expiration (`access: true`, `trial_end: 2026-09-24T17:56:06+00:00`).
- **Next Renewal Prevention**: Confirmed that next recurring charge of $4.99 USD is cancelled and will not occur.
- **Artifact**: `docs/evidence/stripe-trial-cancellation.json`

---

## 7. Monthly Renewal Lifecycle & Test Clock Simulation

To accelerate the 7-day trial and verify the recurring billing transition without waiting 7 days, a dedicated Stripe Test Clock simulation was executed.

- **Test Clock ID**: `clock_1UGjaCRCnOFy7ZssB7ZoboqR`
- **Clock Customer ID**: `cus_VHIAKMcJP0UYMD` (`Stripe Clock QA`)
- **Clock Subscription ID**: `sub_1UGjadRCnOFy7ZssVA47AE3u`
- **Initial Status**: `trialing` (Trial: 7 days)
- **Clock Advance Target**: `1790272851` (7 days + 120s into the future)
- **Stripe Lifecycle Execution**: Stripe automatically issued the first monthly renewal invoice of $4.99 USD, billed the registered card, marked `invoice.paid`, and updated the subscription to `active`.
- **Webhook Reconciliation**: Live Preview webhook processed `invoice.paid` and `customer.subscription.updated`.
- **Database Subscription State**: Updated from `trialing` to `active` (`current_period_end: 2026-10-24T17:58:51+00:00`).
- **Program Snapshot Invariant**: The customer program snapshot remained completely unchanged (`duration_snapshot: 14`, `schedule_snapshot: [1, 3, 5, 7, 9, 11, 13]`). Monthly billing renewal did NOT reset Day 1 or restart the schedule.
- **Paid Period Cancellation**: Customer requested cancellation during active paid period -> `cancel_at_period_end: true`, access preserved until `2026-10-24T17:58:51+00:00`, subsequent renewal prevented.
- **Artifacts**: `docs/evidence/stripe-clock-objects.json`, `docs/evidence/stripe-renewal-lifecycle.json`, `docs/evidence/stripe-clock-cancellation.json`

---

## 8. Security & Multi-Brand Isolation Regression

- **Anonymous Route Defense**: `/admin`, `/admin/brands`, `/admin/customers`, `/comprex/dashboard`, `/demo-wellness/dashboard` all return 307 redirect to login/welcome; zero RSC payload or private customer data leakage.
- **Signature Defense**: Webhooks without `stripe-signature` or with invalid signatures are rejected with HTTP `400 Bad Request`.
- **Cross-Customer Authorization**: Customer A cannot cancel Customer B's subscription (rejected with HTTP `400`/`409`).
- **Cross-Brand Isolation**: Demo Wellness brand resolution and sessions remain completely separated from COMPREX billing.
- **Session Security**: Capability tokens are stored in the database as SHA-256 hashes only.
- **Database RLS**: Anonymous Supabase queries to `subscriptions`, `stripe_events`, `customer_sessions` return empty/denied.
- **Artifact**: `docs/evidence/stripe-security.json`

---

## 9. Limitations & Next Steps

1. **Stripe LIVE Environment**: Intentionally not configured in this test phase. Production keys (`sk_live_...`, `pk_live_...`, `whsec_...`) and production Price will be created during client ownership transfer.
2. **Supabase PROD**: Untouched. All migrations verified on DEV (`finbvtwjddrmbuuuyeni`).
3. **Next Contractual Phase**: Client ownership transfer (`PENDING_CLIENT_ACCOUNT_ACCESS / PENDING_TRANSFER`).
