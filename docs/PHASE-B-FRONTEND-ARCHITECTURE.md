# Kabatos Program Platform — Phase B Frontend Architecture

## Scope
This is a frontend-only reference implementation for the initial COMPREX brand and the demo-wellness multi-brand fixture. There is no database, authentication, Stripe, Supabase, or local persistence.

## Route map
- `/` — brand entry directory.
- `/:brandSlug` — customer welcome screen.
- `/:brandSlug/start` — controlled onboarding form.
- `/:brandSlug/activate` — activation summary.
- `/:brandSlug/checkout` — prototype processing/cancelled/failed/success handoff states.
- `/:brandSlug/success` — activation confirmation.
- `/:brandSlug/dashboard` — progress, schedule, low/complete presentation from fixture data.
- `/admin` — overview metrics and recent customers.
- `/admin/brands`, `/admin/brands/new`, `/admin/brands/:id` — brand roster and controlled editor.
- `/admin/customers`, `/admin/customers/:id` — customer roster/detail.
- `/admin/access` — multi-brand QR, copy, PNG and SVG actions.

## Components
`components/customer.tsx` currently exports shared customer primitives and screens: `CustomerShell`, `BrandLogo`, `Button`, onboarding, activation, checkout, success, dashboard and error screens. `components/admin.tsx` exports the admin shell, overview, rosters, customer detail, access links, and brand editor. These are intentionally cohesive screen modules; a future extraction can move them into `components/customer/` and `components/admin/` without changing route contracts.

## Domain and state
`lib/types.ts` contains current domain/UI types only: Brand, Customer, metrics, schedule, program summary, form values, error and access-link types. `lib/mock/data.ts` is the sole fixture source. Client state is ephemeral React state for forms, checkout presentation, copy feedback, and dashboard completion; refresh persistence is deliberately absent.

## Theme system
Each `Brand` provides primary, hover, text, highlight and border colors. `CustomerShell` exposes them as runtime CSS variables. The same customer screens render COMPREX and demo-wellness through configuration, not brand-name conditionals.

## Program utilities
`lib/program/utils.ts` calculates bounded progress, remaining days, next scheduled use, scheduled-today state, completion and schedule rows. `addScheduleDay` rejects invalid/duplicate days and sorts; `removeScheduleDay` removes by value.

## Phase C replacement points
Mock data will be replaced by a database/repository layer, onboarding handoff by real auth/session, checkout by Stripe, and admin prototype access by real authorization. Those integrations are intentionally not present in Phase B.
