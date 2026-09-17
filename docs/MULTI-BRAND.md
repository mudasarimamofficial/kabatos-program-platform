# Multi-Brand Architecture Specification

## Architecture Principles
1. **Tenant Independence:** Every brand is a database entity in `public.brands` with its own `product_name`, `theme` colors, `program_configs`, and `reorder_url`.
2. **Dynamic Route Resolution:** Next.js route `app/[brandSlug]/` dynamically queries brand information and renders the branded customer interface.
3. **Styling Cascade:** The customer shell sets CSS custom properties at the top of the subtree:
   ```tsx
   style={{
     '--brand-runtime': brand.theme.primary,
     '--brand-hover-runtime': brand.theme.primaryHover,
     '--brand-text-runtime': brand.theme.primaryText,
     '--surface-runtime': brand.theme.highlight,
     '--highlight-border-runtime': brand.theme.highlightBorder,
   }}
   ```
4. **WCAG 2.1 AA Contrast Enforcement:** For COMPREX, dark text (`#121212`) is paired with primary orange (`#F07106`) to ensure high contrast, while white text is used for Demo Wellness forest green (`#246B5A`).
# 2026-09-17 runtime evidence

`/[brandSlug]` is force-dynamic and has no `generateStaticParams` or tenant `unstable_cache`. A real Demo Wellness admin edit rendered on `/demo-wellness` and `/demo-wellness/start` without redeploy; the original value was restored. New temporary DEV brands resolved immediately. `kabatos_customer_session` is the single tenant-neutral cookie. Its SHA-256 hash binds program and brand; cross-brand capabilities are rejected. One browser can participate sequentially in brands, with one active capability at a time.
