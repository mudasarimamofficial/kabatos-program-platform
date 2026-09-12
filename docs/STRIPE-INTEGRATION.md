# Stripe Billing Integration & Commercial Status

## Implementation Status
- **Checkout Route:** `app/api/stripe/checkout/route.ts` creates server-side checkout sessions using verified metadata (`brandSlug`, `customerId`).
- **Webhook Route:** `app/api/stripe/webhook/route.ts` verifies signatures with `stripe.webhooks.constructEvent()` and logs events to `stripe_events`.
- **Status Normalization:** `normalizeSubscriptionStatus` in `lib/stripe/server.ts` translates Stripe lifecycle states (`active`, `trialing`, `past_due`, `incomplete`, `canceled`, `unpaid`) to platform statuses.
- **Idempotency Engine:** Webhooks verify `stripe_events` to ignore duplicate events and guarantee exactly-once side effects (§84).

## Critical Commercial Blocker Report (§7, §118)
Per §7 and §118 of the client specification:
- **Blocker Status:** `BLOCKED_PENDING_APPROVED_STRIPE_PRICE`
- **Root Cause:** Approved recurring subscription commercial terms (Price amount, Currency, Billing Interval, Trial Duration) have not yet been provided in the client brief.
- **Action Required from Client:**
  1. Specify the recurring subscription price amount (e.g., $29/month).
  2. Specify the billing interval (e.g., month, 14 days, week).
  3. Provide Stripe TEST Price ID (`price_...`) to configure `COMPREX_STRIPE_TEST_PRICE_ID`.
- **Engineering Guarantee:** 100% of the Stripe checkout, webhook, status normalization, and idempotency code is written and verified by automated unit tests (`lib/stripe/stripe.test.ts`, `lib/stripe/webhook-handler.test.ts`).

---

# Access Links & True SVG QR Architecture (`docs/QR-ACCESS.md`)

## Specification (§49, §78)
1. **Access Link Model:** Admin interface generates clean brand entry URLs:
   - Development / Staging: `https://[staging-domain]/[brandSlug]`
   - Local: `http://localhost:3000/[brandSlug]`
2. **True XML SVG Export:**
   - Generated dynamically via `qrcode.toString(url, { type: 'svg', margin: 2, color: { dark: '#18221F', light: '#FFFFFF' } })`.
   - Downloaded as a valid XML `<svg xmlns="http://www.w3.org/2000/svg" viewBox="...">` file.
   - Eliminates the historical defect of renaming PNG data to `.svg`.
   - Verified by automated unit test `lib/program/qr.test.ts`.
3. **PNG Export:** Generated directly via `<canvas>` element data URL for bitmap workflows.
