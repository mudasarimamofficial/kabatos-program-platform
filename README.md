# Kabatos Program Platform (COMPREX Brand #1)

Multi-brand customer product-usage tracking and subscription SaaS platform built with Next.js App Router, TypeScript, Supabase PostgreSQL, Stripe Billing, and Vercel.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run TypeScript typecheck
pnpm typecheck

# 3. Run unit & domain engine tests
pnpm test:unit

# 4. Run browser end-to-end tests (Playwright Chromium)
pnpm test:e2e

# 5. Build production bundle
pnpm build

# 6. Start local production server
pnpm start
```

## Architecture & Features
- **Multi-Brand Tenant Engine:** Dedicated brand route resolution (`/[brandSlug]`) with dynamic runtime CSS theming.
- **Pure Domain Engine (`lib/program-engine/`):** Calendar-date math, bounds-checking, next-usage resolution, and schedule normalization.
- **Snapshot Immutability:** Customer programs permanently freeze duration and usage schedules at activation time, protecting active cohorts against subsequent admin brand edits.
- **Frictionless Customer Sessions:** Secure passwordless access powered by 43-character cryptographic capability tokens hashed with SHA-256 and stored in HttpOnly cookies.
- **Master Admin Suite:** Live metrics, brand editor with chip-based schedule controls, customer inspection, and True XML SVG QR code generation.
- **Stripe Billing Integration:** Server-side checkout session creation and signed webhook handlers with database-backed event idempotency (`stripe_events`).

## Quality & Release Gates
- **Typecheck:** 0 errors
- **Unit Tests:** 33 passed out of 33 (8 test suites)
- **Playwright E2E:** 8 passed out of 8 on Windows Chromium (17.6s)
- **Production Build:** 13/13 static and dynamic routes compiled successfully
- **Accessibility:** WCAG 2.1 AA compliant contrast (`#121212` text on `#F07106`)
- **Responsive Targets:** 375px, 390px, 768px, 1440px with zero horizontal scroll overflow

## Documentation Index
- **[Unified Master Engineering Specification & System Bible](UNIFIED-MASTER-DOCUMENTATION.md)** *(Single unified master document consolidating all 25 specifications, reports, and architecture guides)*
- [Project Scope & Client Agreement](docs/PROJECT-SCOPE.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Frontend Architecture & Component System](docs/FRONTEND-ARCHITECTURE.md)
- [Infrastructure & Canonical Repositories](docs/INFRASTRUCTURE.md)
- [Environment Matrix & Separation Policy](docs/ENVIRONMENT-MATRIX.md)
- [Database Schema & Table Definitions](docs/DATABASE.md)
- [Database Migrations Log](docs/MIGRATIONS.md)
- [Row Level Security & Adversarial Policy](docs/RLS-SECURITY.md)
- [Authentication & Customer Sessions](docs/AUTHENTICATION.md)
- [Program Domain Engine](docs/PROGRAM-ENGINE.md)
- [Multi-Brand Architecture](docs/MULTI-BRAND.md)
- [Stripe Integration & Commercial Terms](docs/STRIPE-INTEGRATION.md)
- [QR Codes & True XML SVG Architecture](docs/QR-ACCESS.md)
- [Testing Strategy & Test Results](docs/TESTING.md)
- [Full-Stack QA Report](docs/FULL-STACK-QA-REPORT.md)
- [Security & Vulnerability Audit](docs/SECURITY-AUDIT.md)
- [Requirements Traceability Matrix](docs/REQUIREMENTS-TRACEABILITY.md)
- [Vercel Deployment Guide](docs/VERCEL-DEPLOYMENT.md)
- [Production Promotion Checklist](docs/PRODUCTION-PROMOTION-CHECKLIST.md)
- [Client Handoff Guide](docs/CLIENT-HANDOFF.md)
- [Final Production Readiness Report](docs/FINAL-PRODUCTION-READINESS-REPORT.md)
