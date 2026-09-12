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
