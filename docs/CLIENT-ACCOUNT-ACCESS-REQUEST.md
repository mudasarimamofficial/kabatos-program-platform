# Kabatos Program Platform / COMPREX
# Client Infrastructure Account Access Request

**Target Brand:** COMPREX (Brand #1)  
**Contractual Milestone:** Infrastructure Ownership Transfer  
**Status:** **READY FOR CLIENT OWNERSHIP TRANSFER**  
**Security Policy:** **NEVER SEND PASSWORDS OR SECRET API KEYS IN CHAT.** All access must be granted via official team/organization invitation systems.

---

## Overview

All engineering development, wellness user interface polish, database migrations, security hardening, and real Stripe subscription tests are **100% complete and verified**.

The subscription flow has been tested and proven in Stripe TEST mode:
- **Plan Amount:** $4.99 USD / month
- **Free Trial:** 7 days
- **Access:** Immediate full tracking platform access upon checkout
- **Renewal:** Automatic monthly renewal after the trial
- **Cancellation:** Self-serve customer cancellation retaining access through the period end

To complete the final ownership transfer and transition the platform from our temporary development environment directly into your full ownership and control, we need invitations/team access to your official accounts.

---

## Required Client Invitations & Details

Please provide the following 6 items:

### 1. GitHub (Source Code & Repository)
- **What is needed:** Your GitHub account username or GitHub Organization name.
- **Action:** We will initiate a direct repository ownership transfer of `mudasarimamofficial/kabatos-program-platform` directly to your GitHub account or organization. You will become the primary Owner with full admin rights.

### 2. Supabase (Database & Authentication)
- **What is needed:** A destination Supabase Organization or Team invite.
- **Action:**
  - *Option A (Direct Project Transfer):* Create a free or paid Supabase account at [supabase.com](https://supabase.com), create an Organization, and provide your Organization slug/name so we can transfer the existing production database project directly to you.
  - *Option B (Team Invite):* Invite us as an Administrator or Developer to your Supabase organization so we can apply all 11 audited database migrations and security policies cleanly.

### 3. Vercel (Web Hosting & Deployment)
- **What is needed:** An invitation to your Vercel Team or Account.
- **Action:** Sign up or log into [vercel.com](https://vercel.com), create a Team or project, and invite our email as a Member/Developer so we can transfer or connect the project and attach your custom domain.

### 4. Stripe (Payment Processing & Subscriptions)
- **What is needed:** Team member invitation in your Stripe Dashboard.
- **Action:**
  1. Log into your Stripe Dashboard at [dashboard.stripe.com](https://dashboard.stripe.com).
  2. Go to **Settings -> Team and roles -> New member**.
  3. Invite us with **Developer** role permissions (this allows configuring products, prices, and webhooks without granting access to your bank account or payout information).
  4. **Important:** We will first configure and verify your Stripe **TEST** mode to ensure zero downtime. Live billing will only be activated after your final approval.

### 5. Production Domain / Subdomain Confirmation
- **What is needed:** The exact domain or subdomain you wish to use for the customer tracking app.
- **Examples:**
  - `program.goodcomprex.com`
  - `app.goodcomprex.com`
  - `track.goodcomprex.com`
- **Action:** Once confirmed, we will provide the exact DNS records (CNAME / ALIAS) for you or your domain registrar (e.g. Shopify, Cloudflare, GoDaddy) to point to Vercel with automatic SSL.

### 6. Master Administrator Email
- **What is needed:** The primary email address for the business owner / master administrator.
- **Action:** We will provision this email as the Master Administrator in your database so you can securely log into `/admin/login`, manage brands, view customer adherence, and export access QR codes.

---

## Security Reminder

> [!IMPORTANT]
> **Please do NOT paste passwords, API secret keys, or credit card numbers in Fiverr messages or email.**  
> Always use the built-in "Invite Member" / "Transfer" features provided by GitHub, Supabase, Vercel, and Stripe.
