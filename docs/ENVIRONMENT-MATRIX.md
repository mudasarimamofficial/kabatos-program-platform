# Environment Configuration Matrix

## Environment Separation Policy
To enforce complete isolation between testing and commercial production data, environment variables and service connections are segregated across environments.

## Canonical Environment Matrix

| Environment | Supabase Backend | Stripe Mode | Webhost / Domain | Primary Webhook | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local Development** | `finbvtwjddrmbuuuyeni` (DEV) or Local Docker | TEST | `http://localhost:3000` | Stripe CLI forward or local handler | Active / Non-prod |
| **Preview / Staging** | `finbvtwjddrmbuuuyeni` (DEV) | TEST | `https://kabatos-stripe-test.vercel.app`<br>(Targeting `dpl_3JABmn4dNizTiPSwdXdUjT5M2d37`) | `we_1UGiPVRCnOFy7ZssdVtvIOvI` | **AUTHORITATIVE ACCEPTANCE** |
| **Production** | Client-Owned Supabase PROD / Transferred Project | LIVE (Client Account) | Approved Client Domain (e.g. `program.goodcomprex.com`) | Client LIVE Webhook | **NOT CONFIGURED / PENDING TRANSFER** |

## Security Rules
1. Preview and Staging builds must NEVER connect to `svghcgvmnpjuzzxtnjch` (PROD).
2. Production must NEVER point to development Supabase credentials or use Stripe TEST keys.
3. No secret keys (`STRIPE_SECRET_KEY`, `SUPABASE_SECRET_KEY`, database passwords) may ever be committed to git or exposed in client bundles.
4. Client bundles receive only `NEXT_PUBLIC_*` variables.
5. Developer Stripe accounts must NEVER be used for commercial production transactions; LIVE keys must reside only on client-owned infrastructure.

## Current Authoritative Preview Deployment

- **Stable Acceptance Alias**: `https://kabatos-stripe-test.vercel.app`
- **Active Deployment Target**: `https://kabatos-program-platform-fexndfl9r.vercel.app`
- **Deployment ID**: `dpl_3JABmn4dNizTiPSwdXdUjT5M2d37`
- **Deployment Source Commit**: `a52f6317dd370cc44c9e9d2b3d3f2993ceb0304f` (Exact final engineering branch HEAD)
- **Supabase Target**: DEV (`finbvtwjddrmbuuuyeni`)
- **Stripe Mode**: TEST (`prod_VHGrvdkYDhsdx1`, `price_1UGiK6RCnOFy7ZssnkNPUMvs`, $4.99/mo, 7-day trial)
- **Stripe Webhook Target**: `https://kabatos-stripe-test.vercel.app/api/stripe/webhook` (`we_1UGiPVRCnOFy7ZssdVtvIOvI`)

## Historical Deployments (Archived)
- `dpl_DB55kE5b9Wurp2hJuKMjZemsdGGn` (Stripe acceptance execution build during automated run)
- `dpl_Bc5R4cJ2F6Cu4GvFwGGKKjbbJAnA` / `dstgjx4db` (Historical preview audit commit `03c76c3`)
- `dpl_5VGVdoZmpM7D1uocgyJWiAttKtP3` (Historical preview commit `0e1cbba`)

