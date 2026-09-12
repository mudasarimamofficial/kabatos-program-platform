# Testing Strategy & Automated Test Suite

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
