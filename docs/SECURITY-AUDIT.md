# Security & Adversarial Vulnerability Audit

## Audit Methodology
Comprehensive manual code inspection and automated testing evaluating the platform against the OWASP Top 10, Supabase RLS security standards, and Next.js SSR cache isolation principles.

## Findings & Mitigations

### 1. Row Level Security (RLS)
- **Status:** PASS.
- **Verification:** All core tables have RLS enabled. Anonymous public queries cannot directly enumerate customer records, subscriptions, or modify brand configurations. All sensitive reads/writes are mediated through security definer RPCs with capability token verification.

### 2. Insecure Direct Object References (IDOR)
- **Status:** PASS.
- **Verification:** Customers do not authenticate by passing database UUIDs. Authentication relies strictly on a 43-character cryptographic capability token whose SHA-256 hash is bound to a single `program_id`. Attempts to complete usage on another program or non-scheduled day are rejected.

### 3. Cross-Site Scripting (XSS) & Token Security
- **Status:** PASS.
- **Verification:** Customer capability tokens are stored exclusively in `HttpOnly`, `SameSite=Lax`, `Secure` cookies. Zero auth tokens are exposed to browser `localStorage` or `sessionStorage`.

### 4. Open Redirect Prevention
- **Status:** PASS.
- **Verification:** Reorder URLs and brand links are validated server-side. Customer request query parameters cannot trigger arbitrary external redirects.

### 5. Webhook Spoofing & Replay Attacks
- **Status:** PASS.
- **Verification:** Stripe webhooks verify HMAC signatures using `STRIPE_WEBHOOK_SECRET`. Idempotency is enforced via `public.stripe_events` to prevent duplicate billing activations or repeated schedule resets.

### 6. Secret Exposure Audit (§102)
- **Status:** PASS.
- **Verification:** A clean git status and `.gitignore` audit confirms that `.env`, `.env*.local`, Supabase service role keys, Stripe secret keys, and database passwords are never committed to git or exposed in client bundles.

### 7. Next.js Cache Isolation (§100)
- **Status:** PASS.
- **Verification:** Sensitive customer and admin pages are marked dynamic (`export const dynamic = 'force-dynamic'` or server-rendered on demand `ƒ`), preventing static caching of user-specific session data across requests.
# 2026-09-17 final gate addendum

The supplied historical Preview (`f5o35hva4`, source `0e1cbba509b12701c63220ff8d267b5563613e90`) exposed sample dashboard and admin data in clean application requests. This is recorded in `docs/evidence/original-staging.json`. The fixed Preview uses server-side authorization at every admin data entry point, a tenant-bound capability for customer data, no mock customer fallback, and no false-success session creation. Fresh HTML, RSC, browser, non-admin Auth, cross-brand, RLS, snapshot, hash, revocation and expiry checks are recorded in `docs/evidence/release-gate.json`.

Streaming routes may return HTTP 200 with a server-generated `NEXT_REDIRECT`; the denied payloads contained no private DTO. Checkout return origins ignore request Origin and forwarded-host headers. The committed DEV admin password was rotated. PROD Supabase and Stripe LIVE were not touched.
