# Environment Configuration Matrix

## Environment Separation Policy
To enforce complete isolation between testing and commercial production data, environment variables and service connections are segregated across environments.

```
+---------------------------------------------------------------------------------------+
| Environment           | Supabase Backend            | Stripe Mode  | Vercel Deployment |
+---------------------------------------------------------------------------------------+
| Local Development     | finbvtwjddrmbuuuyeni (DEV)  | TEST         | localhost:3000    |
| Preview / Staging     | finbvtwjddrmbuuuyeni (DEV)  | TEST         | prj_tM5CUywwMBvYq |
| Production            | svghcgvmnpjuzzxtnjch (PROD) | LIVE         | Production Domain |
+---------------------------------------------------------------------------------------+
```

## Security Rules
1. Preview and Staging builds must NEVER connect to `svghcgvmnpjuzzxtnjch` (PROD).
2. Production must NEVER point to development Supabase credentials or use Stripe TEST keys.
3. No secret keys (`STRIPE_SECRET_KEY`, `SUPABASE_SECRET_KEY`, database passwords) may ever be committed to git or exposed in client bundles.
4. Client bundles receive only `NEXT_PUBLIC_*` variables.
# 2026-09-17 authoritative deployment

Verified Preview: `https://kabatos-program-platform-dstgjx4db.vercel.app`, deployment `dpl_Bc5R4cJ2F6Cu4GvFwGGKKjbbJAnA`, exact source `03c76c3` (the deployment metadata reports `03c76c3`'s full hash `03c76c3...`; local HEAD is the authoritative full hash). The historical supplied deployment `dpl_5VGVdoZmpM7D1uocgyJWiAttKtP3` was built from exact source `0e1cbba509b12701c63220ff8d267b5563613e90`.

All database operations targeted DEV `finbvtwjddrmbuuuyeni`; PROD `svghcgvmnpjuzzxtnjch` was not touched. Preview checkout origins derive from deployment-owned `VERCEL_URL`; production requires an explicit HTTPS `NEXT_PUBLIC_APP_URL`. The Vercel branch-scoped `NEXT_PUBLIC_APP_URL` still points to an old preview, but the current Preview strategy does not select it. No old preview URL, localhost, or fabricated domain is hardcoded in runtime source.
