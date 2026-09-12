# COMPREX Project Audit

## 1. Executive summary

This repository is a frontend-only Phase B reference implementation for a reusable, brand-driven wellness-program experience. It is a Next.js 16 App Router application written in TypeScript and React, styled with Tailwind CSS v4 imports plus a large custom CSS layer, and uses Lucide icons. The project contains two related surfaces:

- A customer journey: welcome, onboarding, activation, checkout handoff, success, and dashboard.
- An admin preview: login shell, overview, brands, brand editor, customers, customer detail, and access links.

The application is visually coherent and route-complete for the principal preview flow, but it is not a production application. Data is entirely hardcoded in `lib/mock/data.ts`; there is no database, server mutation layer, authentication, payment processing, real QR generation, persistence, API layer, validation schema, or test suite. The implementation explicitly communicates several of those limitations in the type system and UI copy.

## 2. Technology and runtime

### Framework

- Next.js `16.3.3`.
- App Router routing under `app/`.
- React `19`.
- TypeScript `5.7.3`.
- Tailwind CSS `4.3.3`, loaded through `@import 'tailwindcss'` in `app/globals.css`.
- `tw-animate-css` is imported but the application mainly uses handcrafted CSS classes rather than utility-class composition.
- `lucide-react` supplies interface icons.
- `@vercel/analytics` is loaded only when `NODE_ENV === 'production'`.
- Package manager is pnpm.

### Configuration

`next.config.mjs` currently:

- Sets `typescript.ignoreBuildErrors` to `true`. This allows production builds to pass while hiding TypeScript errors and is the most important engineering-risk setting in the project.
- Sets `images.unoptimized` to `true`; the current UI does not materially use Next Image assets.
- Does not configure security response headers, caching, redirects, or image remote patterns.

`tsconfig.json` uses strict mode, bundler module resolution, the `@/*` alias, and includes all TypeScript files plus generated Next types. Strict mode is valuable, but the ignored build errors weaken its practical enforcement.

`components.json` declares the shadcn `base-nova` style and Lucide icon library. Only the default `components/ui/button.tsx` is present, and the main application uses custom buttons instead of the shadcn button component.

## 3. File and route inventory

### Root and shared files

- `app/page.tsx`: Small reference/development landing page. Links to the COMPREX customer flow, Demo Wellness flow, and admin preview.
- `app/layout.tsx`: Root layout, metadata, viewport, Poppins font loading, global CSS import, and production-only Vercel Analytics.
- `app/globals.css`: Global tokens, all customer styles, all admin styles, responsive rules, focus styles, and reduced-motion handling.
- `lib/types.ts`: Domain types followed by a very large collection of aliases, implementation metadata types, QA/status types, and placeholder/future architecture types.
- `lib/mock/data.ts`: Hardcoded brands, customers, metrics, lookup helpers, and defaults.
- `lib/program/utils.ts`: Pure functions for program summary, schedule display, and schedule-day editing.
- `components/customer.tsx`: All customer components in one client component module.
- `components/admin.tsx`: All admin components in one client component module.
- `components/ui/button.tsx`: Generated shadcn/base button component, currently not used by the feature components.
- `lib/utils.ts`: Existing `cn` utility from the scaffold.
- `public/`: Starter icons and placeholder assets; no meaningful COMPREX product imagery is used.

### Customer routes

- `/[brandSlug]`: Resolves the brand from mock data, calls `notFound()` when missing, and renders `WelcomeScreen`.
- `/[brandSlug]/start`: Renders `StartScreen`.
- `/[brandSlug]/activate`: Renders `ActivateScreen`.
- `/[brandSlug]/checkout`: Renders `CheckoutScreen`.
- `/[brandSlug]/success`: Renders `SuccessScreen`.
- `/[brandSlug]/dashboard`: Resolves the brand and a mock customer, then renders `DashboardScreen`.

`/[brandSlug]/page.tsx` includes `generateStaticParams()` for `comprex`, `demo-wellness`, and `nourish`. The other dynamic routes do not define static params, so they remain dynamic route entries in the App Router.

### Admin routes

- `/admin/login`: Client-side form with required email/password fields. Submission prevents default and navigates directly to `/admin`; no credentials are checked and no session is created.
- `/admin`: Overview dashboard using `AdminOverview`.
- `/admin/brands`: Brand roster.
- `/admin/brands/[id]`: Brand editor. The route awaits `params` but does not use `id`; it always renders the COMPREX editor.
- `/admin/brands/new`: Same `BrandEditor` as the edit route; it is not actually a create form.
- `/admin/customers`: Searchable customer roster using local component state.
- `/admin/customers/[id]`: Customer detail route. It reads `id` and passes it to the component, but the component falls back to the first customer if the id is invalid.
- `/admin/access`: Access-link presentation with mock copy/download controls.

## 4. Customer application behavior

### Shell and branding

`CustomerShell` wraps every customer screen. It provides:

- Centered mobile-first container capped at approximately 480px.
- Brand logo generated from CSS geometry and the current brand name.
- Header link to `/admin/login` labeled “Admin preview”.
- Footer privacy reassurance text.
- Runtime CSS variables carrying primary and highlight brand colors.

The runtime brand variables are set but the shared stylesheet mostly uses fixed global tokens. Consequently, brands are data-driven in copy and the logo accent, but not fully theme-driven across every control and surface.

### Welcome screen

`WelcomeScreen` shows:

- Eyebrow copy.
- Main “Your program, made simple” message.
- Brand-specific program explanation.
- Product visual with package icon, brand name, and product name.
- Primary link to `/{brand.slug}/start`.
- Secondary link to the dashboard.

It is an owned-product onboarding surface, not an ecommerce product page. No pricing, discounts, shipping claims, or sales funnel are present.

### Onboarding screen

`StartScreen` is client-side and maintains:

- Contact method state: email or phone.
- First name.
- Contact value.
- Optional order number field.

Validation is frontend-only:

- First name must be longer than one trimmed character.
- Email uses a lightweight `/.+@.+\..+/` expression.
- Phone accepts at least seven digits after removing non-digits.
- The continue button is disabled until the local condition is valid.
- Successful submission navigates to `/{brand.slug}/activate`.

There is no server submission, no persistence, no error message rendering, no loading state, no contact normalization, and no order-number handling after submission. The order number input is uncontrolled and is not included in the navigation or any data object.

### Activation screen

`ActivateScreen` displays brand-specific program data:

- Product name.
- Duration.
- Number of scheduled uses.
- Activation CTA to checkout.
- Back link to the welcome page.

It intentionally avoids inventing currency, pricing, trials, discounts, or shipping terms. It does not create an activation record.

### Checkout handoff

`CheckoutScreen` is a deliberate prototype handoff. It says future Stripe Checkout will handle payment and explicitly says that no card data is entered. The CTA links directly to the success route. There is no Stripe SDK, checkout session, webhook, cancel flow, failure flow, or server-side price validation.

### Success screen

`SuccessScreen` presents a restrained confirmation icon, confirmation copy, and a dashboard CTA. The success state is entirely route-driven and does not prove that payment or activation occurred.

### Dashboard

`DashboardScreen` is the most interactive customer view. It uses:

- `preview` state with four options: active, off-day, low, and complete.
- `completed` local state for the current usage interaction.
- `getSummary()` to derive current day, percentage, remaining days, next scheduled day, today status, low-stock state, and completion state.
- `getScheduleItems()` to derive schedule checklist rows.

The dashboard includes:

- Personalized greeting using the mock customer.
- Preview state picker, which is a developer/demo affordance and visible in the customer UI.
- Low-stock notice and reorder link.
- Program-complete notice and reorder link.
- Progress card with current day, duration, percentage, accessible progress semantics, and estimated remaining days.
- Next-usage card with completion/undo behavior.
- Schedule checklist.
- Reorder-related copy and external URL links.

The dashboard does not persist completion, update customer records, handle authentication, verify reorder URLs, or distinguish a real user from the default Sarah Chen fixture.

### Error screen

`ErrorScreen` exists in `components/customer.tsx`, with configurable title/message and a return-to-welcome CTA, but no current route imports or displays it. The domain has error types for invalid links, unavailable brands, network errors, checkout cancellation, payment failure, and missing reorder, but those states are not wired into route behavior.

## 5. Admin application behavior

### Admin shell

`AdminShell` creates the desktop/mobile operational layout:

- Sidebar with brand mark and navigation.
- Overview, Brands, Customers, and Access Links links.
- Customer preview link.
- Top bar with title and hardcoded “Master admin” identity.
- Responsive desktop sidebar, collapsed tablet rail, and bottom navigation on small screens.

The navigation is link-based, but active state is passed manually by each page rather than derived from the current pathname.

### Login

The admin login is visual only. It accepts any valid-looking email and any nonempty password and then sets `window.location.href = '/admin'`. Because `/admin` has no protection, every admin route is publicly accessible by URL.

### Overview

`AdminOverview` displays four metrics from the mock metrics object:

- Total brands: 3.
- Total customers: 38.
- Active programs: 24.
- Active subscriptions: 31.

It also displays all mock customer rows as recent activity and links to brand creation and access management. The metrics are not calculated from the customer/brand arrays, so the displayed aggregate numbers intentionally do not equal the three visible customer fixtures.

### Brands roster

`BrandRoster` lists all brands with:

- Brand logo.
- Live/draft badge inferred from array index, not a `Brand.status` field.
- Product name.
- Duration and schedule-use count.
- Edit link.

The third brand is always labeled Draft because `index === 2`. This is presentation logic rather than domain data.

### Brand editor and create route

`BrandEditor` is client-side and supports:

- Local schedule-day toggling for a fixed 14-day grid.
- Text inputs for brand name, logo, primary color, product name, and reorder URL.
- Duration input defaulting to 14.
- Save link that navigates back to the brands roster.

No input is persisted. Most inputs are uncontrolled. The duration value does not drive the day-chip range. The form is not submitted as a form, no URL validation is performed, and the `id` route parameter is ignored. `/admin/brands/new` renders the same COMPREX editor, so create/edit semantics are incomplete.

### Customer roster and detail

`CustomerRoster` filters the in-memory customer array by first name and email. It displays customer, brand, progress, program status, and subscription status. Search is client-side and case-insensitive.

`CustomerDetail` resolves a customer by id and falls back silently to the first customer if no match exists. It displays identity, program/subscription status, current-day metric, percentage calculation, and schedule history. It has no edit capability, support action, subscription action, audit trail, or error state for an invalid id.

### Access links

`AccessLinks` displays a QR-code icon, a hardcoded COMPREX link string, and two mock actions:

- “Download PNG” button has no handler.
- “Copy link” button has no handler.
- The small copy field button has no handler.

The QR graphic is an icon rather than a generated QR code, and access links are not generated from brand data.

## 6. Data model and state architecture

### Domain model

The core domain types are appropriate at the top of `lib/types.ts`:

- `Brand` includes slug, identity, product, duration, schedule, reorder URL, and theme.
- `Customer` includes identity, brand, dates, current day, program status, subscription status, and completed days.
- `AdminMetrics` captures dashboard totals.
- `ProgramSummary` captures derived dashboard state.
- `ScheduleItem` captures schedule row state.
- `PreviewState` captures the four dashboard preview modes.

### Mock data

Three brands exist:

1. COMPREX: 14 days, usage on odd days 1–13, orange palette.
2. Demo Wellness: 10 days, usage on odd days 1–9, green palette.
3. Nourish: 21 days, usage on days 1, 4, 7, 10, 13, 16, 19, purple palette.

Three visible customer records exist:

- Sarah Chen / COMPREX / active / current day 5.
- Jordan Williams / COMPREX / active / current day 12.
- Sam Rivera / Nourish / completed / current day 21.

The metrics object claims 38 customers, 24 active programs, and 31 active subscriptions. Those are display fixtures, not computed totals.

### State ownership

- Route-level brand lookup happens in server components through `getBrand()`.
- Customer onboarding and dashboard state are client-local React state.
- Admin search and schedule editing are client-local React state.
- There is no Context provider, SWR cache, server action, route handler, API endpoint, database, cookie, session, or localStorage use.

This is simple and portable for a prototype but means all mutations disappear on refresh or navigation.

## 7. Styling and design system audit

### Tokens

The stylesheet defines a compact token set:

- White background.
- Near-black foreground.
- Orange brand color and darker hover color.
- Warm surface color.
- Brown dark button color.
- Slate and muted text colors.
- Border, success, warning, error, and radius tokens.

The palette is consistent with the COMPREX direction and generally stays within a restrained color system. However, many direct hex values remain in CSS instead of using semantic tokens, and the runtime brand theme variables are only partially consumed.

### Typography

Poppins is loaded once in `layout.tsx` with weights 400, 500, 600, and 700. The body and all headings use that family. This satisfies the two-family maximum and gives the project a consistent visual voice. There is no distinct display/heading family.

### Layout

Customer layouts are intentionally narrow and focused. Admin layouts use a desktop sidebar and responsive degradation. Flexbox is used for most composition, with grid used for metric/card structures. Mobile rules exist at 800px and 560px.

### Accessibility positives

- Semantic `main`, `header`, `footer`, `section`, `nav`, `form`, labels, links, and buttons are used.
- Focus-visible outline styling is present.
- The dashboard progress element uses ARIA progress semantics.
- Buttons and links generally have readable labels.
- Minimum control heights are generally in the 44–48px range.
- `prefers-reduced-motion` disables transitions and smooth scrolling.
- Icons come from Lucide rather than emoji glyphs.

### Accessibility and UX gaps

- The CSS-generated logo has no explicit accessible label beyond adjacent text.
- External links are not consistently marked as opening externally; current links generally navigate in the same tab.
- The phone/email selector is a pair of buttons without a radio-group role or selected-state semantics beyond class styling.
- The admin sidebar’s responsive icon-only behavior relies heavily on CSS and should be tested with screen readers.
- No visible validation error messages are rendered for invalid form input.
- No pending state is shown for route transitions or mock submissions.
- Access-link actions provide no confirmation or status feedback.
- Some visible “buttons” are navigation links styled as buttons, which is acceptable for navigation but should remain intentional.

## 8. Specification coverage

### Implemented

- Next.js App Router architecture.
- Brand-driven customer route structure.
- Reusable customer shell and screen components.
- Reusable admin shell and major admin screens.
- Mock brand/customer/program models.
- Customer onboarding fields and basic frontend validation.
- Activation and success states.
- Checkout handoff without card fields.
- Dashboard progress, schedule, low, off-day, and complete preview states.
- Program schedule utility functions.
- Admin metrics, roster, search, detail, editor visual, and access-link presentation.
- Poppins typography, Lucide icons, responsive CSS, focus styles, reduced-motion styles.
- Metadata and production-only analytics.

### Partial

- Fully reusable multi-brand theming: brand data exists, but shared CSS still relies mostly on fixed COMPREX tokens.
- Customer onboarding: fields and validation exist, but there is no validation messaging, submit lifecycle, or persistence.
- Activation: program details work, but configurable subscription pricing is not represented; the screen moves directly to a mock handoff.
- Checkout: handoff copy exists, but processing/cancelled/payment-failed visual states are not routable.
- Dashboard: interaction exists, but completion is not persisted and preview controls are visible to normal users.
- Admin authentication: login UI exists, but no auth exists.
- Brand editing: inputs and schedule controls exist, but no saving, validation, creation, or data refresh exist.
- Access links: presentation exists, but copy/download/QR behavior is absent.
- Error handling: reusable error component and error types exist, but routes do not use them.
- QA: browser preview checks were performed, but there is no automated test suite or committed QA report.

### Missing or incorrect for production

- Database and persistence.
- Authentication and authorization.
- Server-side form validation.
- Server actions or route handlers.
- Stripe integration and server-side checkout validation.
- Webhooks and payment status synchronization.
- Real QR-code generation.
- Real access-link lifecycle and revocation.
- Production customer identification/session flow.
- Audit logging.
- Structured error and loading routes.
- Automated unit, integration, and end-to-end tests.
- Security headers in `next.config.mjs`.
- Build-time type enforcement because build errors are ignored.
- Real image/media strategy.
- Form schema validation and reusable form controls.
- Proper create/edit distinction in admin brand management.

## 9. Engineering risks and technical debt

### High priority

1. **TypeScript errors are ignored.** `next.config.mjs` explicitly sets `ignoreBuildErrors: true`; remove this before production handoff and fix any resulting errors.
2. **Admin routes are publicly accessible.** The login form is not authentication. Add server-side session enforcement and route protection before exposing admin data.
3. **All data is mock-only.** Every customer, metric, brand, and mutation disappears on refresh. Introduce a database and scoped server queries.
4. **Checkout is simulated.** The success route can be reached without payment. Integrate Stripe Checkout through a server-created session and webhook-confirmed status.
5. **Destructive ambiguity in admin.** The editor appears to save but does not. Either make it explicitly preview-only or implement a real mutation path.

### Medium priority

6. Consolidate `components/customer.tsx` and `components/admin.tsx` into folders with smaller components for maintainability.
7. Replace the oversized alias-heavy tail of `lib/types.ts` with only domain types that are actually used.
8. Add schema validation using a server-safe validation library or explicit reusable validators.
9. Add route-level `not-found`, loading, and error behavior for dynamic customer/admin screens.
10. Compute admin metrics from persisted records or label them clearly as mock fixtures.
11. Put brand status into the `Brand` model instead of inferring draft/live from array index.
12. Make the brand editor read the route id and create route separately.
13. Implement copy feedback, QR download, and link generation.
14. Make theme tokens use brand runtime variables consistently for buttons, progress, links, and surfaces.
15. Add response security headers and review CSP only after enumerating required origins.

### Lower priority

16. Add a dedicated date/time formatting policy rather than storing display-formatted date strings.
17. Add URL validation and safe external-link handling for reorder URLs.
18. Add explicit empty states for zero brands, zero customers, no search results, and missing schedule days.
19. Add automated browser coverage for all primary routes and mobile layouts.
20. Remove unused starter assets or replace them with intentional product assets.

## 10. Route-by-route behavior matrix

| Route | Rendered surface | Data source | Interactive behavior | Persistence | Production readiness |
|---|---|---|---|---|---|
| `/` | Reference links | Hardcoded links | Navigation only | None | Preview only |
| `/[brandSlug]` | Welcome | Mock brand lookup | Start/dashboard navigation | None | Frontend reference |
| `/[brandSlug]/start` | Onboarding | Brand lookup + local state | Contact selector, validation, navigation | None | Frontend reference |
| `/[brandSlug]/activate` | Activation | Mock brand | Navigation | None | Frontend reference |
| `/[brandSlug]/checkout` | Checkout handoff | Mock brand | Navigation to simulated success | None | Explicitly prototype-only |
| `/[brandSlug]/success` | Success | Mock brand | Dashboard navigation | None | Frontend reference |
| `/[brandSlug]/dashboard` | Program dashboard | Mock brand/customer + derived summary | Preview modes, complete/undo usage, links | None | Frontend reference |
| `/admin/login` | Login visual | None | Local form, unconditional redirect | None | Not secure |
| `/admin` | Metrics/activity overview | Mock data | Navigation | None | Frontend reference |
| `/admin/brands` | Brand roster | Mock brands | Navigation | None | Frontend reference |
| `/admin/brands/[id]` | Editor | Fixed COMPREX values | Local schedule editing, fake save link | None | Incomplete |
| `/admin/brands/new` | Same editor | Fixed COMPREX values | Same as edit | None | Incomplete |
| `/admin/customers` | Searchable roster | Mock customers | Local search, detail navigation | None | Frontend reference |
| `/admin/customers/[id]` | Customer detail | Mock customer fallback | Navigation only | None | Frontend reference |
| `/admin/access` | Access-link card | Hardcoded COMPREX URL | Mock buttons with no handlers | None | Incomplete |

## 11. Recommended production evolution

### Phase 1: enforce the current frontend contract

- Remove `ignoreBuildErrors`.
- Split large component files into `components/customer/*`, `components/admin/*`, and shared controls.
- Add Zod-like schemas or equivalent validators for onboarding, brand editing, and URLs.
- Add route-level loading, not-found, and error UI.
- Add unit tests for `getSummary`, `getScheduleItems`, and schedule editing.
- Add Playwright/agent-browser coverage for the primary customer and admin flows.

### Phase 2: add identity and persistence

- Add an authentication provider suitable for admin and customer sessions.
- Add a relational schema for brands, products/programs, customers, access links, program enrollments, usage events, and subscriptions.
- Scope every customer query by authenticated customer identity.
- Scope every admin mutation by role/permission.
- Store onboarding data and usage completion server-side.

### Phase 3: add payments and external lifecycle

- Create Stripe Checkout sessions on the server using server-owned price configuration.
- Validate product/price references and quantities server-side.
- Confirm subscription state through signed webhooks.
- Only show activation success after verified payment/subscription state.
- Implement checkout cancellation and payment-failure routes.

### Phase 4: operational hardening

- Generate and revoke signed access links.
- Generate actual QR images from access URLs.
- Add audit events for admin changes and customer-support actions.
- Add security headers, rate limits for public entry points, logging, monitoring, and privacy controls.
- Replace display strings with locale-aware dates and configurable copy.

## 12. Final assessment

The current repository successfully delivers a polished frontend reference and demonstrates the intended COMPREX customer/admin information architecture. Its strongest parts are the focused customer framing, reusable brand lookup, schedule-driven dashboard calculations, responsive admin shell, restrained visual system, and deliberate avoidance of fake payment fields or invented commercial claims.

Its central limitation is that nearly every business operation is simulated: authentication, customer onboarding, activation, checkout, usage completion, admin editing, access-link copying, QR generation, and analytics all stop at the UI boundary. It should be treated as a scope-locked preview/handoff artifact, not as a deployable production system, until persistence, security, payment verification, server validation, and automated QA are implemented.

## 13. Audit basis

This document was produced from the current repository files, including all routes under `app/`, the two shared component modules, `lib/types.ts`, `lib/mock/data.ts`, `lib/program/utils.ts`, `app/layout.tsx`, `app/globals.css`, `next.config.mjs`, `package.json`, `tsconfig.json`, `components.json`, the approved implementation plan, and the supplied project specification material.

No assumptions were made that a visual control implied a working backend operation. Where a feature is rendered but has no handler, persistence, server validation, or integration, it is classified as partial or preview-only.
