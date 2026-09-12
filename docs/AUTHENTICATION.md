# Authentication & Authorization Architecture

## Overview
Kabatos Program Platform implements two distinctly separate authentication paradigms:
1. **Master Admin Authentication:** Supabase Auth (Email / Password) protecting all `/admin/*` routes and administrative RPCs.
2. **Customer Frictionless Sessions:** Cryptographically secure, passwordless capability tokens stored in HttpOnly cookies protecting customer dashboard routes.

## Admin Authentication (§66)
- **Identity Provider:** Supabase Auth.
- **Model:** Single Master Admin role. No multi-tier staff hierarchies, customer roles, or brand-owner portal accounts (§24).
- **Protection Mechanism:** Next.js Server Components and Server Actions inspect Supabase Auth session via `@supabase/ssr`. Unauthenticated requests to `/admin` or administrative mutations are rejected or redirected to `/admin/login`.
- **Initial Provisioning:** Provisioned through Supabase Auth CLI or server seed without committing credentials to git or documentation.

---

# Customer Session Architecture (§62, §67)

## Design Principles
- **Zero Customer Passwords:** Eliminates password fatigue, forgot-password emails, and customer account administration overhead (§21).
- **Cryptographic Security:**
  - Token is a 256-bit cryptographically secure random base64url string (43 characters).
  - Only the SHA-256 binary digest of the token is persisted in `customer_sessions.token_hash`.
  - Raw token is delivered to the browser strictly in an `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookie (`kabatos_customer_session`).
- **Session Lifespan & Revocation:**
  - Expiry is set to 7 days by default.
  - Can be explicitly revoked via database record update (`revoked_at`).
  - Database customer ID is NEVER used as an authorization token.
