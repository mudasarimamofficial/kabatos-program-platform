# Kabatos Program Platform — Frontend Architecture

## Component Modularization
The earlier monolithic files (`components/customer.tsx` and `components/admin.tsx`) have been restructured into modular, single-responsibility components under dedicated feature directories:

### Customer Components (`components/customer/`)
- `customer-shell.tsx`: Root customer layout injecting dynamic brand CSS variables (`--brand-runtime`, `--brand-hover-runtime`, `--brand-text-runtime`, `--surface-runtime`).
- `brand-logo.tsx`: Accessible brand identity mark.
- `welcome-screen.tsx`: C-01 Brand welcome and value proposition.
- `start-screen.tsx`: C-02 Frictionless onboarding form with client-side & server-side validation.
- `activate-screen.tsx`: C-03 Program activation overview displaying snapshot duration and scheduled count.
- `checkout-screen.tsx`: C-04 Secure Stripe checkout handoff with status handlers.
- `success-screen.tsx`: C-05 Verified activation and welcome state.
- `dashboard-screen.tsx`: C-06 & C-07 Authoritative customer dashboard, progress bar, usage actions, and timeline.
- `error-screen.tsx`: C-10 Graceful error boundary for invalid brand tokens.
- `buttons.tsx`: Accessible CTA and interactive button components.
- `index.ts`: Clean barrel export preserving backwards compatibility.

### Admin Components (`components/admin/`)
- `admin-shell.tsx`: Master admin layout, responsive sidebar, navigation, and top bar.
- `admin-overview.tsx`: A-02 Dashboard metric cards and recent customer activity.
- `brand-roster.tsx`: A-03 Brand roster grid showing program summaries.
- `brand-editor.tsx`: A-04 Comprehensive brand editor supporting duration, chips schedule editor, and colors.
- `customer-roster.tsx`: A-05 Searchable and filterable customer table.
- `customer-detail.tsx`: A-06 In-depth customer program timeline and subscription status.
- `access-links.tsx`: A-07 Access URL display, copy to clipboard, PNG download, and True XML SVG download.
- `metric-card.tsx`: Stat display cards for operational counts.
- `index.ts`: Barrel export.

## Design DNA & Token Enforcement (§36, §37)
- **Primary Token:** `#F07106`
- **Accessible Hover Token:** `#D85800`
- **Primary Text Token:** `#121212` (Ensures WCAG 2.1 AA 4.5:1+ contrast against `#F07106`)
- **Secondary Token:** `#8B6F47`
- **Highlight Surface Token:** `#FDEEE1`
- **Bark Accent Token:** `#5C3D2E`
- **Typography:** Poppins (weights 400, 700)
- **Border Radii:** Button 8px, Card 12px, Input 6px, Pill 9999px

## Responsive Layout Matrix (§39, §40, §97)
- **375px (iPhone SE):** 16px horizontal gutters, single-column cards, touch targets >= 44px.
- **390px / 430px (Standard Mobile):** 16–20px gutters, stacked panels.
- **768px (Tablet):** Collapsed sidebar navigation, multi-column metric grid.
- **1024px & 1440px (Desktop):** Centered max-width customer shell (480px) to prevent card stretching, full admin grid layout.
- **Zero Horizontal Overflow:** Verified across all viewports via automated Playwright testing.
