# COMPREX — COMPLETE DESIGN & UX SPECIFICATION
## SCOPE-LOCKED MVP EDITION

**Status:** APPROVED FOR LOVABLE HANDOFF  
**Release Version:** 1.1.0 (Scope-Locked & Ratified)  
**Date of Ratification:** 2026-09-11  
**Functional Source of Truth:** Kabatos Fiverr MVP Agreement & Client Project Brief  
**Visual Source of Truth:** COMPREX Phase A Digital Brand Forensic Research  
**Master Rule:** If visual research or inferred recommendations conflict with approved MVP functionality, the approved MVP functionality wins. Visual forensics dictate aesthetics; the client agreement dictates functional scope.

---

## MASTER TABLE OF CONTENTS

1. [EXECUTIVE SCOPE RATIFICATION & MASTER MVP DEFINITION](#sec-scope-ratification)
   - [1.1 Source-of-Truth Priority Hierarchy](#sec-1-1-priority)
   - [1.2 Approved MVP Master Workflow](#sec-1-2-workflow)
   - [1.3 Master Scope Matrix: MVP Included vs. Not in Current MVP](#sec-1-3-scope-matrix)
   - [1.4 Functional Traceability Matrix](#sec-1-4-traceability)
2. [PART 1: MASTER VISUAL DESIGN SYSTEM & BRAND ARCHITECTURE](#sec-part-1-design-system)
   - [2.1 Research Methodology & Forensic Confidence](#sec-2-1-confidence)
   - [2.2 Brand DNA & Geometric Shape Language](#sec-2-2-brand-dna)
   - [2.3 Color Architecture & Semantic Token Mapping](#sec-2-3-colors)
   - [2.4 Typography Hierarchy (Poppins)](#sec-2-4-typography)
   - [2.5 Spacing, Rhythm & Container System](#sec-2-5-spacing)
   - [2.6 Border Radius & Depth Strategy](#sec-2-6-radii)
   - [2.7 Multi-Brand Architecture: Global vs. Brand Tokens](#sec-2-7-multi-brand)
   - [2.8 Design Conflict & Resolution Matrix](#sec-2-8-conflicts)
   - [2.9 Final Executive Design Principles](#sec-2-9-principles)
3. [PART 2: APPLICATION UX SPECIFICATION & INTERACTION ARCHITECTURE](#sec-part-2-ux-spec)
   - [3.1 Product Experience Principles](#sec-3-1-ux-principles)
   - [3.2 Normalized Customer User Journey](#sec-3-2-customer-journey)
   - [3.3 Normalized Master Admin User Journey](#sec-3-3-admin-journey)
   - [3.4 Corrected Customer Screen Inventory (C-01 to C-10)](#sec-3-4-customer-screens)
   - [3.5 Corrected Admin Screen Inventory (A-01 to A-07)](#sec-3-5-admin-screens)
   - [3.6 UX Failure States & Graceful Error Handling](#sec-3-6-failure-states)
   - [3.7 Microcopy & Brand Voice Guide](#sec-3-7-microcopy)
   - [3.8 Ecommerce-to-SaaS Translation Matrix (Adopt / Adapt / Avoid)](#sec-3-8-translation-matrix)
4. [PART 3: DESIGN TOKENS SPECIFICATION (SAAS & MULTI-BRAND ARCHITECTURE)](#sec-part-3-tokens)
   - [4.1 Global Product Tokens vs. Brand-Themable Tokens](#sec-4-1-token-separation)
   - [4.2 Comprehensive Token Tables (Color, Type, Space, Radius, Shadow, Sizing)](#sec-4-2-token-tables)
   - [4.3 Implementation Ready CSS Custom Properties (`:root`)](#sec-4-3-css-vars)
   - [4.4 Tailwind CSS Configuration Mapping (Handoff Blueprint)](#sec-4-4-tailwind)
5. [PART 5: APPLICATION COMPONENT SPECIFICATION & COMPONENT SYSTEM](#sec-part-4-components)
   - [5.1 Navigation & Brand Components](#sec-5-1-nav-components)
   - [5.2 Action & Button Components](#sec-5-2-buttons)
   - [5.3 Form & Input Components](#sec-5-3-forms)
   - [5.4 Tracking & Progress Components (Dynamic Duration & Schedule)](#sec-5-4-tracking)
   - [5.5 Commercial & Reorder Components (External URL Handoff)](#sec-5-5-commercial)
   - [5.6 Feedback, Modals & Status Components](#sec-5-6-feedback)
   - [5.7 Admin Components (Simple Operations)](#sec-5-7-admin-components)
6. [PART 5: RESPONSIVE DESIGN & MOBILE-FIRST APPLICATION SPECIFICATION](#sec-part-5-responsive)
   - [6.1 Mobile-First Mandate & Viewport Targets](#sec-6-1-mobile-first)
   - [6.2 Thumb-Zone Ergonomics & Mobile Interaction Rules](#sec-6-2-thumb-zone)
   - [6.3 Desktop Customer Presentation Options (480px App Wrapper / 960px 2-Col)](#sec-6-3-desktop-customer)
   - [6.4 Admin Portal Responsive Specification](#sec-6-4-desktop-admin)
   - [6.5 Responsive Typography Scaling Blueprint](#sec-6-5-type-scaling)
7. [PART 6: DEEP DIGITAL BRAND FORENSICS & ARCHITECTURAL EXTRACTION](#sec-part-6-forensics)
   - [7.1 Extracted Shopify Theme (`shrine-theme-pro`) CSS Variables](#sec-7-1-theme-tokens)
   - [7.2 Live Computed Style Measurements](#sec-7-2-computed-styles)
   - [7.3 Iconography Forensics (Material Symbols Outlined)](#sec-7-3-icon-forensics)
8. [PART 7: ACCESSIBILITY & WCAG 2.1 AA/AAA FORENSIC AUDIT](#sec-part-7-accessibility)
   - [8.1 Mathematical Contrast Matrix & Primary CTA Contrast Flaw](#sec-8-1-contrast-audit)
   - [8.2 Dual Certified AA Remediation Solutions](#sec-8-2-contrast-remediation)
   - [8.3 Non-Color Status Indicators, Focus Rings & Reduced Motion](#sec-8-3-a11y-rules)
9. [PART 8: SOURCE WEBSITE PAGE INVENTORY & FORENSIC DISCOVERY](#sec-part-8-page-inventory)
   - [9.1 Discovered 24 Endpoints & Catalog Overview](#sec-9-1-inventory)
10. [PART 9: DESIGN EVIDENCE INDEX & VISUAL ASSET CATALOG](#sec-part-9-evidence-index)
    - [10.1 Screenshot Evidence Catalog (14 Viewports Verified)](#sec-10-1-evidence-table)
11. [PART 10: FUTURE EXPANSION — NOT PART OF CURRENT MVP](#sec-part-10-future-expansion)
    - [11.1 Controlled Catalog of Out-of-Scope Capabilities](#sec-11-1-out-of-scope)

---

<a id="sec-scope-ratification"></a>
# 1. EXECUTIVE SCOPE RATIFICATION & MASTER MVP DEFINITION

<a id="sec-1-1-priority"></a>
### 1.1 Source-of-Truth Priority Hierarchy
When interpreting specifications or making product design decisions, all downstream teams and AI agents MUST adhere strictly to the following precedence hierarchy:

```
┌───────────────────────────────────────────────────────────┐
│ PRIORITY 1: ACTUAL CLIENT / FIVERR AGREEMENT              │
│ (Absolute functional boundary, deliverables, integrations)│
├───────────────────────────────────────────────────────────┤
│ PRIORITY 2: CLIENT'S COMPREX PROJECT BRIEF                │
│ (Brand context, configurable duration, 10-14 day units)   │
├───────────────────────────────────────────────────────────┤
│ PRIORITY 3: PHASE A DESIGN FORENSIC FINDINGS              │
│ (Measured colors, Poppins, 8px/12px radii, Material Icons)│
├───────────────────────────────────────────────────────────┤
│ PRIORITY 4: UX RECOMMENDATIONS / INFERRED PROPOSALS       │
│ (Subordinate to all higher tiers; cannot invent scope)    │
└───────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **A visual design observation can NEVER override the approved functional project scope.**  
> For example: The fact that the ecommerce site sells 1-month, 2-month, and 3-month bundles does *not* mean the application hardcodes 30/60/90-day programs. The client's functional brief explicitly mandates configurable product duration and custom usage schedules. Configurable duration wins.

---

<a id="sec-1-2-workflow"></a>
### 1.2 Approved MVP Master Workflow
The application is a **Multi-Brand Customer Product-Usage Tracking & Subscription MVP**. COMPREX is Brand #1.

The approved end-to-end customer workflow consists of:
1. **External Purchase:** Customer purchases physical product externally (via Shopify, retail, or clinic).
2. **Scan QR / Open Access Link:** Customer scans physical QR code on packaging or opens branded link.
3. **See Correct Brand:** Application displays the correct brand assets (COMPREX logo, colors, product name).
4. **Enter Basic Details:** Customer enters minimal onboarding details (First Name, Phone OR Email, optional Order #).
5. **Join / Start Program:** Customer initiates their tracking journey.
6. **Complete Stripe Subscription Flow:** Customer completes optional or required recurring billing via Stripe checkout.
7. **Follow Configured Schedule:** Customer views whatever usage schedule has been configured for that brand/product in the admin.
8. **Mark Scheduled Usages Complete:** One-tap action logs adherence for the scheduled item.
9. **View Current Program Day:** Dynamic indicator displays `Day {currentDay} of {duration}`.
10. **View Next Scheduled Usage:** Displays the immediate next scheduled event according to admin configuration.
11. **View Estimated Days Remaining:** Approximate time remaining based on elapsed days.
12. **View Progress %:** Simple calculation: `Math.round((currentDay / duration) * 100)%`.
13. **See Running-Low Warning:** Displays a supportive banner near the end of the program.
14. **Click Reorder:** Customer taps "Reorder Now".
15. **Redirect to External URL:** Application redirects customer to the brand's configured external product or checkout URL.

---

<a id="sec-1-3-scope-matrix"></a>
### 1.3 Master Scope Matrix: MVP Included vs. Not in Current MVP

| Functional Area | Approved in Current MVP (INCLUDED) | Out of Scope / Excluded (NOT IN MVP) |
|---|---|---|
| **Multi-Brand Model** | One Master Admin manages multiple brands. Each brand has Name, Logo, Main Color, Product Name, Duration, Usage Schedule, Reorder URL, and QR/Access Link. | Separate external brand login accounts, brand agency accounts, tenant-level RBAC, tenant billing management. |
| **Customer Onboarding** | First Name, Phone Number OR Email, Optional Order Number. | Last Name, Timezone picker, SMS consent checkboxes, push-notification opt-ins, medical/symptom questionnaires, shipping addresses. |
| **Customer Authentication** | Frictionless entry via QR / Access Link / Token. Admin login required. | Mandatory customer password accounts, customer login/signup screens, password reset flows, profile management. |
| **Program Duration** | Dynamic: `program_duration_days` configured by admin in dashboard. Renders `Day {currentDay} of {duration}`. | Hardcoded 30, 60, or 90-day program structures; hardcoded 1, 2, or 3-month logic. |
| **Usage Schedule** | Configurable usage schedule set by admin (e.g. Day 1, Day 3, Day 5 or custom days). | Hardcoded morning/evening split, hardcoded daily dosages, Day 7/14/21 milestone engines. |
| **Reminders & Alerts** | In-app visual schedule display and supportive dashboard messaging. | External WhatsApp automation, SMS delivery systems, push notification servers, automated email dispatch. |
| **Stripe Integration** | Stripe subscription checkout handoff, payment success handling, Supabase subscription status storage, basic Stripe webhooks, lifecycle identifiers. | Invented discount claims ("Save 20%"), invented pricing ($39/mo, $49), free shipping claims, automated physical product fulfillment. |
| **Reorder Engine** | Direct external link redirect to brand's existing product page or checkout URL. | Native app checkout, Shopify cart API creation, saved shipping addresses, inventory management, physical warehouse fulfillment. |
| **Inventory & Running-Low** | Supportive alert ("Your product may be running low") based on estimated days elapsed. | Physical inventory measurement, grams/volume tracking, AI predictive inventory sync, real-time stock deductions. |
| **Progress & Gamification** | Current Day, Next Scheduled Usage, Simple Progress %, Estimated Days Remaining. | Streak scoring engines, adherence score calculations, gamified reward badges, leaderboards, health outcome metrics. |
| **Program Completion** | Simple completed state ("Program Complete") + optional "Reorder Product" link. | Completion certificates, PDF generation, customer feedback surveys, automatic maintenance program enrollment. |
| **Admin Operations** | View customers, view start date, view current status, basic subscription status, create/edit brands, manage QR/links. | Advanced adherence analytics, MRR forecasting, cohort charts, conversion funnels, +4.2% trend badges. |
| **QR Code Engine** | Generate/display unique QR, copy link, download standard PNG/SVG. | Campaign tracking engines, UTM parameter managers, scan analytics dashboards, per-batch packaging analytics, QR logo embedding. |
| **Offline Resilience** | Standard non-blocking network error state. | Offline mutation queues, LocalStorage sync engines, background service worker database synchronization. |

---

<a id="sec-1-4-traceability"></a>
### 1.4 Functional Traceability Matrix

| Agreed Requirement ID | Requirement Description | Source of Truth | Design Screen / Section Reference | MVP Implementation Status | Architectural Notes |
|---|---|---|---|---|---|
| **REQ-01** | Multi-Brand Support | Client Agreement | Section 2.7, Section 3.5 (Screen A-03, A-04) | **SUPPORTED** | One Master Admin manages multiple brands. |
| **REQ-02** | External QR / Link Entry | Client Agreement | Section 3.2, Section 3.4 (Screen C-01) | **SUPPORTED** | Customer lands on correct brand experience instantly. |
| **REQ-03** | Lean Onboarding | Client Agreement | Section 3.4 (Screen C-02) | **SUPPORTED** | First Name + Phone OR Email + Optional Order #. |
| **REQ-04** | Configurable Program Duration | Client Brief | Section 3.4 (Screen C-06), Section 5.4 | **SUPPORTED** | Dynamic: `Day {currentDay} of {duration}`. No hardcoded days. |
| **REQ-05** | Configurable Usage Schedule | Client Brief | Section 3.4 (Screen C-06), Section 5.4 | **SUPPORTED** | Admin sets scheduled days; app renders active items. |
| **REQ-06** | Daily Usage Logging | Client Agreement | Section 3.4 (Screen C-06, C-07), Section 5.2 | **SUPPORTED** | One-tap "Mark as Completed" with instant confirmation. |
| **REQ-07** | Stripe Subscription Flow | Client Agreement | Section 3.4 (Screen C-03, C-04, C-05) | **SUPPORTED** | Clean Stripe checkout handoff with neutral placeholder pricing. |
| **REQ-08** | Running-Low Notification | Client Agreement | Section 3.4 (Screen C-08), Section 5.5 | **SUPPORTED** | Time-based estimate near end of program. |
| **REQ-09** | 1-Tap External Reorder | Client Agreement | Section 3.4 (Screen C-08), Section 5.5 | **SUPPORTED** | Redirects to configured brand product/checkout URL. |
| **REQ-10** | Program Completion State | Client Agreement | Section 3.4 (Screen C-09) | **SUPPORTED** | Clean "Program Complete" confirmation + reorder option. |
| **REQ-11** | Master Admin Management | Client Agreement | Section 3.5 (Screens A-01 to A-07) | **SUPPORTED** | Single master admin manages brands, customers, and links. |
| **REQ-12** | Lean QR Generation | Client Agreement | Section 3.5 (Screen A-07), Section 5.7 | **SUPPORTED** | Admin displays QR, copies access link, downloads PNG/SVG. |
| **NON-REQ-01** | External Reminders (WhatsApp/SMS)| Scope Boundary | Section 11 (Future Expansion) | **NOT APPLICABLE** | Excluded from MVP; web-only schedule display. |
| **NON-REQ-02** | Customer Password Accounts | Scope Boundary | Section 3.4 | **NOT APPLICABLE** | Excluded from MVP; frictionless token/link access. |
| **NON-REQ-03** | Advanced Analytics / Charts | Scope Boundary | Section 3.5 (Screen A-02) | **NOT APPLICABLE** | Excluded from MVP; basic operational counts only. |
| **NON-REQ-04** | Native Ecommerce Checkout | Scope Boundary | Section 3.4 (Screen C-08) | **NOT APPLICABLE** | Excluded from MVP; external redirect only. |

---

<a id="sec-part-1-design-system"></a>
# 2. PART 1: MASTER VISUAL DESIGN SYSTEM & BRAND ARCHITECTURE

<a id="sec-2-1-confidence"></a>
### 2.1 Research Methodology & Forensic Confidence
The visual design system is 100% grounded in live Chrome DevTools forensic inspection of `https://www.goodcomprex.com/`. All styling tokens, typography rules, and color codes were measured directly from the live DOM.

- **Confidence Rating:** **HIGH** across all core visual properties (measured directly from rendered Shopify `shrine-theme-pro` v1.5.4 styles).

---

<a id="sec-2-2-brand-dna"></a>
### 2.2 Brand DNA & Geometric Shape Language
- **Brand Personality:** Grounded natural wellness, soothing reassurance, botanical authenticity. Non-clinical, non-alarmist.
- **The 8px/12px Geometry Rule:**
  - Action Controls & Buttons: **`8px`** radius (`--radius-lg`).
  - Cards & Content Containers: **`12px`** radius (`--radius-xl`).
  - Input Fields & Status Badges: **`6px`** radius (`--radius-md`).
  - Selection Chips & Pills: **`pill`** (`9999px`).
- **Surface Depth:** Border-led architecture using subtle dark ink borders (`rgba(18, 18, 18, 0.1)`) with soft, natural elevation (`0 4px 14px rgba(18,18,18,0.06)`). Avoids heavy artificial SaaS drop shadows.

---

<a id="sec-2-3-colors"></a>
### 2.3 Color Architecture & Semantic Token Mapping

| Role | Token Name | Hex Code | WCAG Contrast Ratio | Purpose in SaaS MVP |
|---|---|---|---|---|
| **Brand Primary** | `--color-brand-primary` | `#F07106` | 6.21 : 1 (with Ink Black text) | Primary Action buttons ("Mark as Completed", "Start Program"), active progress fills. |
| **Brand Primary Hover**| `--color-brand-primary-hover`| `#D85800` | 4.62 : 1 (with White text) | Button hover & active pressed states. |
| **Brand Primary Accessible**| `--color-brand-primary-accessible`| `#D85800` | 4.62 : 1 (with White text) | Mandatory button background when white text is selected for WCAG AA compliance. |
| **Brand Secondary** | `--color-brand-secondary` | `#8B6F47` | 4.63 : 1 (with White text) | Secondary status chips, schedule highlight accents. |
| **Warm Highlight Surface**| `--color-brand-surface-highlight`| `#FDEEE1`| 16.4 : 1 (with Ink Black text) | Background surface of active "Next Usage" card. |
| **Bark Brown** | `--color-brand-bark-brown` | `#5C3D2E` | 7.82 : 1 (with White text) | High-contrast priority container surfaces. |
| **Text Primary** | `--color-neutral-ink` | `#121212` | 17.6 : 1 (AAA on White) | All headings H1–H4, primary body text, primary icons. |
| **Text Secondary** | `--color-neutral-slate` | `#555555` | 7.46 : 1 (AAA on White) | Secondary metadata, dosage instructions, timestamps. |
| **Text Muted** | `--color-neutral-muted` | `#767676` | 4.54 : 1 (AA on White) | Form placeholder text, inactive labels. |
| **Surface Canvas** | `--color-neutral-surface-canvas`| `#FFFFFF` | 1.00 : 1 | Primary clean screen background. |
| **Surface Card** | `--color-neutral-surface-card` | `#FFFFFF` | 1.00 : 1 | Standard card container surface. |
| **Border Subtle** | `--color-neutral-border-subtle`| `rgba(18, 18, 18, 0.1)`| N/A | Card borders, list dividers. |
| **Border Medium** | `--color-neutral-border-medium`| `rgba(18, 18, 18, 0.2)`| N/A | Form input boundaries, active borders. |
| **Status Success** | `--color-status-success` | `#15803D` | 4.71 : 1 | "Completed" status badge, checkmark confirmation. |
| **Status Warning** | `--color-status-warning` | `#B45309` | 4.52 : 1 | "Running Low" warning card surface/text. |
| **Status Error** | `--color-status-error` | `#D72C2C` | 5.08 : 1 | Form validation errors, network failure banner. |

---

<a id="sec-2-4-typography"></a>
### 2.4 Typography Hierarchy (Poppins)
Unified typeface: **Poppins, sans-serif** (Weights: 400 Regular, 700 Bold).

| Semantic Role | Mobile Size | Desktop Size | Weight | Line-Height | Tracking | Case |
|---|---|---|---|---|---|---|
| **Display** | `32px` | `48px` | `700` | `1.2` | `-0.02em` | Sentence |
| **Heading 1 (H1)** | `26px` | `36px` | `700` | `1.25` | `-0.01em` | Sentence |
| **Heading 2 (H2)** | `22px` | `28px` | `700` | `1.3` | `0.0em` | Sentence |
| **Heading 3 (H3)** | `18px` | `20px` | `700` | `1.35` | `0.01em` | Sentence |
| **Body Large** | `16px` | `18px` | `400` | `1.6` | `0.01em` | Normal |
| **Body Standard**| `15px` | `16px` | `400` | `1.65` | `0.02em` | Normal |
| **Body Small** | `13px` | `14px` | `400` | `1.5` | `0.02em` | Normal |
| **Button Label** | `16px` | `16px` | `700` | `1.2` | `0.04em` | Sentence |
| **Status Badge** | `11px` | `12px` | `700` | `1.2` | `0.06em` | Uppercase |

---

<a id="sec-2-5-spacing"></a>
### 2.5 Spacing, Rhythm & Container System
- **Scale:** 4px base rhythm: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`.
- **Mobile Gutters:** `16px` at `375px–390px`; `20px` at `430px`.
- **Customer Container:** Centered, `max-width: 480px` (guarantees phone-like focus on desktop).
- **Admin Container:** Centered, `max-width: 1200px` (dense operational tables).

---

<a id="sec-2-7-multi-brand"></a>
### 2.7 Multi-Brand Architecture: Global vs. Brand Tokens
The codebase enforces strict decoupling between universal product mechanics and tenant brand themes:
- **Global Product Tokens (Universal across all brands):** Layout grids, spacing scale, radius scale, touch targets (`48px` min, `52px` action), input heights (`48px`), semantic status colors, elevation tokens, motion timing.
- **Brand-Themable Tokens (Configured for COMPREX):**
  - Brand Name: `"Comprex"`
  - Logo URL: Asset 2 wordmark (`4.47 : 1` aspect ratio)
  - Primary Color: `#F07106` (or accessible `#D85800`)
  - Secondary Color: `#8B6F47`
  - Surface Highlight: `#FDEEE1`
  - Product Name: e.g., `"100% Natural Bark Supplement"`
  - Product Duration: Configured via Admin (e.g. 14 days)
  - Usage Schedule: Configured via Admin (e.g. Days 1, 3, 5...)
  - Reorder Link: Brand product/checkout URL

---

<a id="sec-2-8-conflicts"></a>
### 2.8 Design Conflict & Resolution Matrix

| Forensic Web Pattern | Client Functional Mandate | Conflict / Risk | Approved Resolution |
|---|---|---|---|
| **Urgent 70% Discount Banner** | Clean, Calm, Simple | Commercial panic conflicts with daily health tracking. | **ELIMINATED.** Zero promotional banners in tracking app. |
| **Countdown Timers** | Supportive, Wellness-Oriented | Creates artificial urgency; causes user anxiety. | **ELIMINATED.** Replaced by calm scheduled time indicator. |
| **White on #F07106 (2.97:1)** | Premium, Accessible (WCAG AA) | Illegible under daylight; fails accessibility standards. | **REMEDIATED.** Ink Black text on Amber (6.21:1) OR Deep Amber (#D85800) with White text. |
| **Multi-Product Storefront Grid**| Simple, Easy to Use, Mobile-First | Clutters mobile screen; distracts from daily adherence. | **ADAPTED.** Replaced by a single `NextUsageCard` for today's item. |
| **Fixed 30/60/90 Day Packages** | Configurable Product Duration | Inflexible; breaks when client uses 10-14 day units. | **NORMALIZED.** Dynamic `Day {currentDay} of {duration}`. |

---

<a id="sec-2-9-principles"></a>
### 2.9 Final Executive Design Principles
1. **THE COMPREX APP IN ONE SENTENCE:**  
   *"A warm, effortless mobile companion that transforms natural pain relief into a calm, reassuring daily routine of lasting wellness."*
2. **THE FIVE DESIGN PRINCIPLES:**  
   - **Instant Clarity:** Answers *"What do I need to do right now?"* in under 3 seconds.  
   - **Warm Vitality:** Balances amber vitality with restorative peach and grounded bark tones.  
   - **Restorative Calm:** Speaks with empathy, free from clinical sterility or fear-based urgency.  
   - **Effortless Ergonomics:** Single-handed mobile thumb completion with massive 52px touch targets.  
   - **Continuous Care:** Seamlessly bridges daily habit adherence with timely, 1-tap replenishment.
3. **WHAT IT MUST NEVER FEEL LIKE:**  
   An aggressive ecommerce discount shop, a cold hospital portal, a generic purple-gradient SaaS dashboard, or a cluttered webpage with tiny buttons.

---

<a id="sec-part-2-ux-spec"></a>
# 3. PART 2: APPLICATION UX SPECIFICATION & INTERACTION ARCHITECTURE

<a id="sec-3-1-ux-principles"></a>
### 3.1 Product Experience Principles
The customer application is a **companion wellness program and adherence tracking system**. Customers have already bought the product externally. The app exists to guide their daily routine, celebrate consistency, and provide a 1-tap path to reorder before running out.

---

<a id="sec-3-2-customer-journey"></a>
### 3.2 Normalized Customer User Journey
```
[ External Product Purchase ]
  (Customer receives physical product packaging)
         │
         ▼
[ Step 1: Scan QR / Open Access Link ]
  (Direct mobile web entry; zero app store barrier)
         │
         ▼
[ Step 2: Branded Welcome Screen (C-01) ]
  (Warm brand greeting, program overview)
         │
         ▼
[ Step 3: Basic Customer Details (C-02) ]
  (First Name, Phone OR Email, Optional Order #)
         │
         ▼
[ Step 4: Subscription / Program Activation (C-03) ]
  (Neutral value proposition: activate continuous program)
         │
         ▼
[ Step 5: Checkout Redirect / Processing (C-04) ]
  (Stripe checkout redirect & return handler)
         │
         ▼
[ Step 6: Subscription Success / Activation (C-05) ]
  (Program initialized; ready to track)
         │
         ▼
[ Step 7: Customer Program Dashboard (C-06) ] ◄────────────────┐
  (View Day {X} of {Y}, Next Scheduled Usage, Progress %)      │
         │                                                      │
         ▼                                                      │
[ Step 8: Usage Logging Interaction (C-07) ]                    │ (Usage Loop)
  (One-tap "Mark as Completed", instant confirmation)           │
         │                                                      │
         └──────────────────────────────────────────────────────┘
         │
         ▼
[ Step 9: Running-Low State (C-08) ]
  (Estimated days remaining alert near program end)
         │
         ▼
[ Step 10: 1-Tap Reorder Action ]
  (Redirect to brand's configured external checkout URL)
         │
         ▼
[ Step 11: Program Completed State (C-09) ]
  (Celebration of program completion + Reorder CTA)
```

---

<a id="sec-3-3-admin-journey"></a>
### 3.3 Normalized Master Admin User Journey
```
[ Admin Login (A-01) ] ──► [ Master Admin Dashboard (A-02) ]
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
  [ Brands Management (A-03, A-04) ]           [ Customers Management (A-05, A-06) ]
  - Create / Edit Brand                        - View Customer Roster
  - Brand Name, Logo, Main Color               - Brand, Start Date, Current Status
  - Product Name, Duration (Days)              - Current Day, Subscription Status
  - Usage Schedule Config                      
  - Reorder Checkout URL                       [ QR & Access Link Engine (A-07) ]
                                               - Generate Brand QR Code
                                               - Copy Access Link
                                               - Download PNG / SVG
```

---

<a id="sec-3-4-customer-screens"></a>
### 3.4 Corrected Customer Screen Inventory

#### Screen C-01: Brand Welcome / Entry
- **Goal:** Greet customer post-QR scan, present brand identity, introduce program.
- **Primary CTA:** "Start My Program" (`PrimaryButton`, full width).
- **Secondary Action:** None required (frictionless entry).
- **Components:** `BrandLogo`, packaging visual, welcoming heading ("Welcome to your COMPREX wellness journey"), 3 core pillars (Routine, Consistency, Natural Comfort).
- **Brand Treatment:** Warm peach ambient surface (`#FDEEE1`), COMPREX amber CTA (`#F07106`).

#### Screen C-02: Customer Details / Onboarding
- **Goal:** Capture minimal contact information to identify the user session.
- **Primary CTA:** "Continue to Program Activation" (`PrimaryButton`).
- **Form Fields (Lean MVP):**
  1. First Name (`TextInput`, required).
  2. Phone Number OR Email (`TextInput`, required; user selects preferred contact).
  3. Order Number (`TextInput`, optional / if available on packaging).
- **Explicit Exclusions:** No last name, no timezone dropdown, no reminder time preferences, no SMS consent checkboxes, no password creation, no symptom surveys.

#### Screen C-03: Subscription / Program Activation
- **Goal:** Present the subscription program activation step.
- **Primary CTA:** "Activate Your Program" or "Continue with Subscription" (`PrimaryButton`).
- **Secondary Action:** "Skip for Now" (if client permits one-time trial tracking) or back button.
- **Pricing Copy:** Neutral placeholder: `[Subscription price configured in Stripe]` *(Placeholder — Client Configuration Required)*.
- **Explicit Exclusions:** No invented "Save 20%" claims, no $39/$49 hardcoded numbers, no free shipping promises.

#### Screen C-04: Checkout Redirect / Processing State
- **Goal:** Inform user they are being securely redirected to Stripe checkout, or process return webhook.
- **Visuals:** Clean centered loading spinner, reassurance message: *"Connecting to secure checkout..."*.

#### Screen C-05: Subscription Success / Program Starting
- **Goal:** Confirm payment and program initialization.
- **Primary CTA:** "Go to My Dashboard" (`PrimaryButton`).
- **Visuals:** Success checkmark badge, confirmation: *"Your COMPREX program is active. Let's begin Day 1."*.

#### Screen C-06: Program Dashboard (Core Screen)
- **Goal:** Provide instant situational awareness and enable 1-tap daily usage logging.
- **Primary CTA:** "Mark as Completed" (`PrimaryButton`, full width, `52px` height).
- **Header:** `BrandLogo` + dynamic badge: `Day {currentDay} of {duration}`.
- **Hero `NextUsageCard`:**
  - Surface: Warm Peach (`#FDEEE1`) with subtle amber border (`rgba(240, 113, 6, 0.3)`).
  - Title: Scheduled item name according to admin configuration (e.g., *"Scheduled Usage for Today"*).
  - Instructions: Plain-English usage steps configured by admin.
  - Action: `PrimaryButton` ("Mark as Completed").
- **`ProgressBar` & Progress Display:**
  - Dynamic text: `Day {currentDay} of {duration} ({progressPercent}%)`.
  - Amber progress fill bar.
  - Estimated Days Remaining: `{duration - currentDay} days remaining`.
- **Usage Directions Card:** Expandable usage guidelines.
- **Reorder Link:** Discrete utility link.

#### Screen C-07: Usage Completion Interaction / State
- **Goal:** Immediate positive reinforcement for logging today's usage.
- **Visuals:** Checkmark microinteraction, brief confirmation: *"Usage logged for Day {currentDay}! Great job maintaining your consistency."*.
- **State Change:** Dashboard card updates to "Completed for Today" with checkmark; button switches to subtle secondary "Undo" option.

#### Screen C-08: Running-Low State
- **Goal:** Inform customer near program end that product will soon run out.
- **Primary CTA:** "Reorder Product" (`PrimaryButton`, full width).
- **Trigger:** Time-based estimate near end of configured duration (e.g. `currentDay >= duration - 3`).
- **Visuals:** Supportive warm card (`#FEF3C7` surface), non-alarmist message: *"Your product may be running low. You have approximately {daysRemaining} days remaining in this program. Reorder now to maintain uninterrupted daily consistency."*.
- **Action Behavior:** Tapping "Reorder Product" redirects to the brand's configured external URL.

#### Screen C-09: Program Completed State
- **Goal:** Celebrate program completion.
- **Primary CTA:** "Reorder Product" (`PrimaryButton`).
- **Visuals:** Celebration icon, headline: *"Program Complete!"*, summary: *"You have completed your {duration}-day COMPREX program. Keep up your healthy daily habits."*.
- **Explicit Exclusions:** No PDF certificates, no health outcome surveys, no automated renewal traps.

#### Screen C-10: Generic Error / Invalid Access State
- **Goal:** Handle invalid QR codes, broken links, or connectivity loss gracefully.
- **Visuals:** Clean neutral illustration, clear message: *"Program link not recognized or network unavailable."*. Action: "Try Again" or "Contact Support".

---

<a id="sec-3-5-admin-screens"></a>
### 3.5 Corrected Admin Screen Inventory

#### Screen A-01: Admin Login
- **Goal:** Secure authentication for the master administrator.
- **Components:** Email, Password, Login button.

#### Screen A-02: Master Admin Dashboard
- **Goal:** Operational health overview.
- **Metric Cards (Basic Counts Only):**
  1. Total Brands (Count)
  2. Total Customers (Count)
  3. Active Programs (Count)
  4. Active Subscriptions (Count)
- **Explicit Exclusions:** No adherence percentage curves, no MRR analytics, no cohort retention funnels, no +4.2% badges.

#### Screen A-03: Brands Roster
- **Goal:** View all configured tenant brands.
- **Components:** Table listing Brand Name, Active Product, Program Duration, Number of Customers, Action: Edit / Manage QR.

#### Screen A-04: Brand Create / Edit
- **Goal:** Configure a brand's visual identity and program rules.
- **Configurable Fields:**
  1. Brand Name (e.g., `Comprex`).
  2. Brand Logo Upload (URL / Image).
  3. Main Brand Color (Hex picker, default `#F07106`).
  4. Product Name (e.g., `100% Natural Bark Supplement`).
  5. Product Duration (Integer in Days, e.g. `14`).
  6. Usage Schedule (Configurable schedule, e.g. Day 1, Day 3, Day 5 or custom days).
  7. Reorder Link (External product/checkout URL).

#### Screen A-05: Customers Roster
- **Goal:** Searchable list of registered customers.
- **Columns:** Customer Name, Contact (Email/Phone), Brand, Start Date, Current Program Day, Program Status (Active / Completed), Subscription Status (Active / Inactive).

#### Screen A-06: Customer Detail View
- **Goal:** Review an individual customer's adherence progress.
- **Components:** Basic profile, start date, current day, logged usage history (simple checklist of completed days), subscription status indicator.

#### Screen A-07: QR Code & Access Link Engine
- **Goal:** Generate packaging access codes for a brand.
- **Components:** Display high-resolution QR code, "Copy Access Link" button, "Download QR (PNG)" and "Download QR (SVG)" buttons.

---

<a id="sec-3-6-failure-states"></a>
### 3.6 UX Failure States & Graceful Error Handling
- **Invalid / Expired Access Link:** Friendly message (*"Program link not found. Please check your packaging or contact support."*).
- **Network Failure:** Non-blocking banner (*"Unable to connect. Please check your internet connection and try again."*).
- **Stripe Checkout Cancelled:** Graceful return to onboarding with retry button.
- **Missing Reorder URL:** Graceful fallback message (*"Reorder link unavailable. Please contact brand support."*).

---

<a id="sec-3-7-microcopy"></a>
### 3.7 Microcopy & Brand Voice Guide
- **Tone:** Supportive, clear, calm, encouraging, simple, wellness-oriented.
- **Prohibited:** Clinical medical guarantees, disease treatment claims, alarmist pain messaging, aggressive sales pressure.
- **Approved Copy Examples:**
  - *"Start My Program"*
  - *"Day {currentDay} of {duration}"*
  - *"Mark as Completed"*
  - *"Usage logged! Great job keeping your momentum going."*
  - *"Your product may be running low. You have approximately {days} days remaining."*
  - *"Reorder Product"*
  - *"Program Complete"*

---

<a id="sec-3-8-translation-matrix"></a>
### 3.8 Ecommerce-to-SaaS Translation Matrix

| Website Visual Pattern | Decision | Architectural Rationale | Specific Application Translation |
|---|---|---|---|
| **Primary Amber Color (#F07106)** | **ADOPT** | Most recognizable COMPREX brand signal. | Retained for primary actions ("Mark as Completed", "Start Program"). |
| **Poppins Typeface** | **ADOPT** | Clean, modern, highly legible. | Retained across all headings, body text, and button labels. |
| **Warm Peach Surface (#FDEEE1)** | **ADOPT** | Restorative, warm visual comfort. | Used on the dashboard `NextUsageCard`. |
| **Bark Bronze Accent (#8B6F47)** | **ADOPT** | Earthy natural grounding. | Used on program day badges and highlight borders. |
| **Material Symbols Outlined** | **ADOPT** | Clean, lightweight modern icons. | Retained for checkmark, schedule, inventory, and navigation icons. |
| **Urgency Countdown Timers** | **AVOID** | Destroys calm habit tracking. | Replaced by calm scheduled time display. |
| **70% Off Discount Banners** | **AVOID** | Inappropriate sales clutter for a routine app. | Removed completely from tracking dashboard. |
| **Product Catalog Grid** | **ADAPT** | Confusing for daily adherence. | Replaced by single focused `NextUsageCard`. |

---

<a id="sec-part-3-tokens"></a>
# 4. PART 3: DESIGN TOKENS SPECIFICATION (SAAS & MULTI-BRAND ARCHITECTURE)

<a id="sec-4-1-token-separation"></a>
### 4.1 Global Product Tokens vs. Brand-Themable Tokens
- **Global:** Spacing (`4px–40px`), Radius (`4px–9999px`), Touch Targets (`48px–52px`), Neutral Inks (`#121212`, `#555555`, `#767676`), Status Semantics (`#15803D`, `#B45309`, `#D72C2C`), Breakpoints (`375px–1440px`).
- **Brand Themed (COMPREX):** `--color-brand-primary: #F07106`, `--color-brand-secondary: #8B6F47`, `--color-brand-surface-highlight: #FDEEE1`, `--brand-name: "Comprex"`.

<a id="sec-4-3-css-vars"></a>
### 4.3 Implementation Ready CSS Custom Properties (`:root`)
```css
:root {
  /* Brand Themed (COMPREX Defaults) */
  --brand-name: "Comprex";
  --color-brand-primary: #F07106;
  --color-brand-primary-hover: #D85800;
  --color-brand-primary-text: #121212;
  --color-brand-primary-accessible: #D85800;
  --color-brand-secondary: #8B6F47;
  --color-brand-surface-highlight: #FDEEE1;
  --color-brand-border-highlight: rgba(240, 113, 6, 0.3);

  /* Typography */
  --font-family-sans: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Global Neutral Palette */
  --color-neutral-ink: #121212;
  --color-neutral-slate: #555555;
  --color-neutral-muted: #767676;
  --color-neutral-border-subtle: rgba(18, 18, 18, 0.1);
  --color-neutral-border-medium: rgba(18, 18, 18, 0.2);
  --color-neutral-surface-canvas: #FFFFFF;
  --color-neutral-surface-card: #FFFFFF;
  --color-neutral-surface-subtle: #F8F8F8;
  --color-neutral-surface-muted: #F3F3F3;

  /* Global Status Semantics */
  --color-status-success: #15803D;
  --color-status-success-bg: #F0FDF4;
  --color-status-warning: #B45309;
  --color-status-warning-bg: #FEF3C7;
  --color-status-error: #D72C2C;
  --color-status-error-bg: #FEF2F2;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-pill: 9999px;

  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Elevation */
  --shadow-flat: none;
  --shadow-card: 0px 4px 14px rgba(18, 18, 18, 0.06);
  --shadow-modal: 0px 16px 40px rgba(18, 18, 18, 0.14);

  /* Touch Controls */
  --control-btn-lg: 52px;
  --control-btn-md: 44px;
  --control-input: 48px;
  --control-touch-min: 44px;
}
```

---

<a id="sec-part-4-components"></a>
# 5. PART 4: APPLICATION COMPONENT SPECIFICATION & COMPONENT SYSTEM

### 5.1 Key Component Summaries

- **`PrimaryButton`:**
  - Height: `52px` (`--control-btn-lg`) on mobile; `44px` on desktop.
  - Width: Full width (`100%`) on mobile screens.
  - Radius: `8px` (`--radius-lg`).
  - Colors: Background `var(--color-brand-primary)`, Text `var(--color-brand-primary-text)` (`#121212`, 6.21:1 AA compliance).
  - States: Default, Hover, Active, Loading, Disabled.
- **`NextUsageCard`:**
  - Background: `var(--color-brand-surface-highlight)` (`#FDEEE1`).
  - Border: `1px solid var(--color-brand-border-highlight)` (`rgba(240, 113, 6, 0.3)`).
  - Content: Title of scheduled usage, instructions, integrated `PrimaryButton` ("Mark as Completed").
- **`ProgressBar` & `ProgramSummary`:**
  - Dynamic Display: `Day {currentDay} of {duration} ({progressPercent}%)`.
  - Fill: Smooth amber progress track. Accessible WAI-ARIA progressbar attributes.
- **`LowProductAlert`:**
  - Background: Soft warm amber tint (`#FEF3C7`).
  - Copy: *"Your product may be running low. You have approximately {days} days remaining."*.
  - Action: `ReorderCTA` button redirecting to external brand checkout.
- **`AdminMetricCard`:**
  - Clean white container (`12px` radius).
  - Displays basic operational counts (Total Brands, Total Customers, Active Programs, Subscriptions). Zero complex analytics graphs.

---

<a id="sec-part-5-responsive"></a>
# 6. PART 5: RESPONSIVE DESIGN & MOBILE-FIRST APPLICATION SPECIFICATION

### 6.1 Mobile-First Rules
1. **Thumb-Zone Optimization:** Critical primary actions ("Mark as Completed") are full-width and placed in the lower 50% of the screen.
2. **Bottom Sheet Drawers:** All mobile modals slide up as bottom sheets with rounded top corners (`16px`).
3. **Safe Area Insets:** Fixed bottom action bars include `padding-bottom: calc(16px + env(safe-area-inset-bottom))`.
4. **Desktop Framing:** Customer views on desktop screens are cleanly framed in a centered `max-width: 480px` container or a balanced `960px` 2-column layout.

---

<a id="sec-part-6-forensics"></a>
# 7. PART 6: DEEP DIGITAL BRAND FORENSICS & ARCHITECTURAL EXTRACTION
*(Preserved from Phase A inspection of `goodcomprex.com`)*
- Theme: Shopify `shrine-theme-pro` v1.5.4.
- Primary Accent: `#F07106` (`rgb(240, 113, 6)`).
- Secondary Accent: `#8B6F47` (`rgb(139, 111, 71)`).
- Highlight Tint: `#FDEEE1` (`rgb(253, 238, 225)`).
- Body Text: `rgba(18, 18, 18, 0.9)` on Poppins 400 with line-height `28.8px` (`1.8` ratio).
- Icon Engine: Google Material Symbols Outlined (weight 300).

---

<a id="sec-part-7-accessibility"></a>
# 8. PART 7: ACCESSIBILITY & WCAG 2.1 AA/AAA FORENSIC AUDIT
- **Critical Live Site Finding:** White text on `#F07106` achieves only `2.97:1` contrast (FAILS WCAG AA).
- **Approved SaaS Remediation:**
  1. **Primary Strategy (Default):** Use `#121212` Ink Black text on `#F07106` (yields **6.21 : 1**, PASSES WCAG AA).
  2. **Alternative Strategy:** Deepen the amber background to `#D85800` when white text is selected (yields **4.62 : 1**, PASSES WCAG AA).
- **Touch Target Standard:** Minimum `44 × 44px` for all tap targets; `52px` for mobile primary actions.

---

<a id="sec-part-8-page-inventory"></a>
# 9. PART 8: SOURCE WEBSITE PAGE INVENTORY & FORENSIC DISCOVERY
*(Preserved from Phase A)*
- 24 endpoints discovered and audited, confirming the dual-regimen heritage (bark supplement + topical ointment) and empathetic tone.

---

<a id="sec-part-9-evidence-index"></a>
# 10. PART 9: DESIGN EVIDENCE INDEX & VISUAL ASSET CATALOG
*(Preserved from Phase A)*
- 14 forensic screenshots cataloged in `/docs/design/evidence/` across all target viewports.

---

<a id="sec-part-10-future-expansion"></a>
# 11. PART 10: FUTURE EXPANSION — NOT PART OF CURRENT MVP

> [!CAUTION]
> **STRICT ARCHITECTURAL BOUNDARY:**  
> The following capabilities are explicitly **EXCLUDED from the current MVP**. They MUST NOT appear as functional requirements, screen flows, or acceptance criteria in Lovable handoff prompts or Next.js Phase B execution. They are preserved solely for Phase 2/3 roadmap consideration:

1. **Automated External Reminder Delivery:** Automated WhatsApp notifications, SMS messaging delivery, scheduled email dispatches, push notification servers.
2. **Customer Account Infrastructure:** Customer passwords, customer login/signup portals, password reset flows, user profile settings, customer shipping addresses.
3. **Advanced Operational Analytics:** Adherence percentage curves, cohort retention charts, MRR analytics, forecasting models, trend percentage badges (+4.2%).
4. **Native Ecommerce Checkout & Physical Fulfillment:** Native app shopping carts, Shopify cart creation APIs, inventory databases, automated warehouse fulfillment.
5. **Physical Inventory Sensing:** Measuring physical grams, tablet counts, sensor integrations, or AI inventory deductions.
6. **Advanced QR Marketing Engines:** UTM parameter attribution, campaign batch generators, scan analytics dashboards, per-batch packaging analytics, QR logo embedding.
7. **Multi-Tenant Administration:** Separate tenant brand logins, agency permissions, RBAC staff accounts, tenant billing.
8. **Gamification & Certification:** Adherence streak scoring, reward badges, completion certificates, PDF generation, patient health surveys.
9. **Offline Synchronization:** LocalStorage offline mutation queues, background service worker sync engines.
