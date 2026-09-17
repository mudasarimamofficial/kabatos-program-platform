# Testing Strategy & Automated Test Suite

## Stripe TEST gate

Run `pnpm typecheck`, `pnpm test:unit`, `pnpm build`, then `pnpm test:e2e`. No lint command is configured. The ordinary E2E suite verifies onboarding, approved copy and denial of tracking before a verified subscription; it does not complete external Checkout. The dedicated real billing procedure and results are in [Stripe TEST acceptance](evidence/stripe-test-acceptance.md). Unit mocks verify orchestration; they are not proof of provider delivery or database idempotency.

## Test Pyramid
The application enforces comprehensive automated test coverage spanning pure domain logic, remote database contracts, Stripe integration, responsive design, and end-to-end browser journeys.

### 1. Unit & Domain Tests (Vitest)
- **Suite Command:** `pnpm test:unit`
- **Total Test Files:** 8 passed (8)
- **Total Tests:** 33 passed (33)
- **Coverage Highlights:**
  - `lib/program-engine/engine.test.ts`: Calendar-date calculations, current day clamping, remaining days, off-days, next scheduled usage.
  - `lib/program-engine/snapshot.test.ts`: Snapshot invariance across admin configuration mutations.
  - `lib/program-engine/adversarial.test.ts`: Negative and out-of-bounds duration and schedule handling.
  - `lib/program/qr.test.ts`: XML SVG format verification, preventing PNG renaming.
  - `lib/supabase/supabase.test.ts`: Live remote Supabase DEV connection and brand resolution.
  - `lib/stripe/stripe.test.ts`: Status normalization, metadata parsing, and idempotency logic.
  - `lib/stripe/webhook-handler.test.ts`: Webhook idempotency and signature verification.

### 2. End-to-End Tests (Playwright on Windows Chromium)
- **Suite Command:** `pnpm test:e2e`
- **Total Tests:** 8 passed (8)
- **Execution Time:** ~17.6 seconds against compiled production Next.js build
- **Coverage Highlights:**
  - Customer Journey (C-01 to C-10): Welcome -> Onboarding Validation -> Activation -> Checkout -> Dashboard -> Scheduled Usage Completion -> Undo.
  - Admin Journey (A-01 to A-07): Overview Metrics -> Brands Roster -> Brand Editor -> Customers Table -> Access Links & QR.
  - Multi-Brand Isolation: COMPREX vs Demo Wellness brand rendering.
  - Responsive Viewport Matrix: 375px, 390px, 768px, 1440px with zero horizontal scroll overflow.

### 3. Type Checking
- **Command:** `pnpm typecheck`
- **Status:** 0 errors across entire TypeScript codebase.

### 4. Production Build
- **Command:** `pnpm build`
- **Status:** 13/13 static and dynamic routes compiled successfully in 2.2s.
# 2026-09-17 final gate execution

`pnpm typecheck` passed. Unit/regression tests passed 55/55. Production-build Playwright E2E passed 10/10. The deployed gate harness is `node --env-file=.env.local --env-file=.env.gate.local scripts/release-gate.mjs`; it uses fresh anonymous contexts, real temporary Auth users, real A-04 saves, QR decoding, reversible DEV fixtures and cleanup. Results are in `docs/evidence/release-gate.json`.

Clean DB commands are `docker info`, `supabase start`, `supabase db reset --local`, `./scripts/seed-dev.ps1 -Local`, and `supabase db query --local --file scripts/verify-schema.sql`. They were attempted but Docker's Linux engine was unavailable; see `docs/evidence/clean-db.txt`. Linked DEV is not clean-DB proof.
