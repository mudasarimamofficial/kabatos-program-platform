# Stripe TEST integration

The client approved one tracking/service plan: **$4.99 USD/month, seven-day free trial, automatic renewal unless canceled**. Physical products are separate. The decision is approved; actual acceptance is recorded in [the evidence file](evidence/stripe-test-acceptance.md). Historical `BLOCKED_PENDING_APPROVED_STRIPE_PRICE` claims are superseded by this distinction.

## Configuration

`COMPREX_STRIPE_TEST_PRICE_ID` is the sole server-configured Price. Checkout verifies TEST mode, 499-cent amount, USD, monthly interval and licensed usage. Quantity is one. Only COMPREX uses this plan; Demo Wellness is rejected by the checkout API.

Run `node --env-file=.env.local scripts/configure-stripe-test.mjs` with securely configured TEST keys and DEV admin credentials. It reuses/creates one logical Product and Price, then versions COMPREX configuration through `admin_edit_brand`. Keys stay in ignored environment files and encrypted Vercel Preview variables.

## Authorization and lifecycle

Checkout accepts only `brandSlug`; strict validation rejects browser-controlled identity, terms, price and return URLs. The capability cookie authorizes a DB checkout reservation, which supplies a stable Stripe idempotency key. Card collection is required; `subscription_data.trial_period_days=7`. Return URLs use the trusted deployment-origin helper, never request Origin/Host headers.

Webhooks verify the raw body signature before processing. LIVE keys/events are rejected. Supported events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`.

Events trigger fresh Stripe retrieval under the existing DB lease/fence. Initial activation requires a linked, completed TEST Checkout, matching subscription/customer, paid or no-payment-required status, approved price and seven-day trial. Transactional reconciliation persists subscription/trial/period/cancellation fields and the durable event ledger. A not-started program activates once; renewal never resets Day 1 or rewrites snapshots. Failures return 503 for retry. Concurrent deliveries may retry while a worker holds the lease.

The success page polls capability-scoped database status. A success URL or session_id query grants no access.

| Stripe state | Tracking access |
|---|---|
| trialing | Until trial_end, including scheduled cancellation |
| active | Until current_period_end, including scheduled cancellation |
| past_due, unpaid, incomplete, incomplete_expired, paused, canceled | Denied; history retained |

Database dashboard/completion/undo RPCs enforce this policy. An authorized customer can still see a safe subscription summary and cancel when tracking is blocked. No grace period is invented. Program duration and monthly billing are separate clocks.

Cancellation resolves the subscription from the capability, obtains the reconciliation fence, verifies the Stripe customer, and requests only `cancel_at_period_end:true`. The authoritative response is persisted immediately; signed webhooks reconcile full state. One confirmation explains the effective end date. No refunds, immediate cancellation, extra plans or retention flows.

The tenant-neutral HttpOnly/Secure/SameSite=Lax cookie lasts 90 days. The DB expires unactivated sessions after seven days; verified trial/active reconciliation extends the DB session lease for 90 days. Revocation and tenant binding remain authoritative.

## Preview and transfer

The TEST webhook targets `/api/stripe/webhook` on the dedicated `kabatos-stripe-test.vercel.app` Preview alias. Protection stays enabled. Its existing automation bypass is supplied privately to Stripe using Vercel's supported query parameter; never publish the complete endpoint URL. Stripe signature verification remains mandatory. Endpoint and SDK API versions match.

Recreate the approved plan under client ownership and repeat TEST acceptance during transfer. LIVE is rejected by this candidate and requires a separately authorized production configuration change. Never put a LIVE Price into `COMPREX_STRIPE_TEST_PRICE_ID`.

References: [Checkout trials](https://docs.stripe.com/payments/checkout/free-trials), [webhook endpoints](https://docs.stripe.com/api/webhook_endpoints/create), [Vercel automation bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).
