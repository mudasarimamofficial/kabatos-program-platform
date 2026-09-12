# Kabatos Program Platform / COMPREX — Project Scope

## Executive Summary
Kabatos Program Platform is a multi-brand customer product-usage tracking and subscription SaaS application designed for brand operators and consumers. Brand #1 is **COMPREX**, a wellness-oriented brand requiring dynamic program duration and scheduled usage tracking.

## Commercial Delivery Context (§17)
- **Agreed Project Fee:** $320 fixed.
- **Delivery Scope:** Source ownership, multi-brand platform architecture, COMPREX Brand #1, customer frictionless onboarding, program tracking engine, Stripe test subscription handoff, admin management suite, QR/Access link generation, and Vercel/Supabase staging architecture.
- **Revisions Clause:** Unlimited reasonable in-scope refinements within the agreed MVP boundaries.

## Customer Journey Scope (C-01 to C-10)
1. **C-01 Welcome Screen:** Branded entry point displaying product name, lead copy, visual element, and primary CTA.
2. **C-02 Customer Details / Onboarding:** Frictionless input collecting First Name, Email OR Phone, and optional Order Number. Strictly no passwords, medical history, or unnecessary fields.
3. **C-03 Subscription / Program Activation:** Dynamic display of program duration (e.g. 14 days) and scheduled usage count.
4. **C-04 Secure Checkout Handoff:** Server-directed handoff to secure subscription checkout.
5. **C-05 Success / Starting:** Verification state confirming active subscription status.
6. **C-06 Program Dashboard:** Authoritative progress percentage, current calendar day, scheduled today status, and next scheduled usage indicator.
7. **C-07 Usage Completion:** One-click scheduled usage completion with undo capability and reload persistence.
8. **C-08 Running-Low State:** Time-based heuristic notice when estimated remaining days fall within the brand threshold. Directs to configured external reorder URL.
9. **C-09 Program Completed:** Calm completion banner acknowledging duration fulfillment without fabricating artificial medical adherence scores.
10. **C-10 Error / Invalid Access:** Graceful fallback screen for missing or inactive brands.

## Admin Suite Scope (A-01 to A-07)
1. **A-01 Master Admin Login:** Protected entry point requiring Supabase Auth credentials.
2. **A-02 Admin Dashboard:** Operational metrics (Total Brands, Total Customers, Active Programs, Active Subscriptions) and recent customer program starts.
3. **A-03 Brands Roster:** Grid of configured brand programs showing status, duration, and usage counts.
4. **A-04 Brand Create / Edit:** Dynamic configuration of Brand Name, Logo, Primary Color, Product Name, Duration (days), Scheduled Usage Days chip editor, and External Reorder URL.
5. **A-05 Customer Roster:** Filterable customer list displaying Name, Contact, Brand, Progress, Program Status, and Subscription Status.
6. **A-06 Customer Detail:** Comprehensive program inspection displaying snapshot duration, usage history timeline, and current status.
7. **A-07 Access Links & QR:** Generation of branded access links, dynamic QR canvas, and direct export to PNG and True XML SVG format.

## Explicit Non-Goals / Scope Exclusions (§41)
- No WhatsApp or SMS marketing automation engines.
- No native ecommerce cart or inventory management.
- No native mobile apps (PWA / responsive web only).
- No health diagnosis, symptom tracking, or medical claims.
- No customer password authentication or profile editors.
- No gamification (streaks, badges, points, leaderboards).
