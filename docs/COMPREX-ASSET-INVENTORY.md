# COMPREX Authentic Brand Asset Inventory

**Date:** 2026-09-13  
**Source Domain:** `https://www.goodcomprex.com`  
**License & Ownership:** Client-Owned Brand Assets (COMPREX / Good Comprex)  
**Destination Directory:** `public/brands/comprex/`  

---

## 1. Asset Registry

| Asset Name | Local File Path | Source URL / Origin | Dimensions | Format | File Size | Primary Purpose & Usage Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Official Logo Wordmark** | `public/brands/comprex/logo.png` | `https://www.goodcomprex.com/cdn/shop/files/Asset_2.png` | 2988 × 670 px | PNG (Transparent) | ~66 KB | Brand header, customer onboarding, admin header, print access header. Features official brand emblem, bold typography, and client's authentic French brand tagline *"— Soin naturel des douleurs corporelles —"*. |
| **Canonical Product Packaging Pouch** | `public/brands/comprex/product-pouch.jpg` | Cropped from studio hero shot (`An9OLBgYO0GNOx3Ym3Dt9o0p...jpg`) | 420 × 580 px | JPEG (Clean Studio) | ~66 KB | Canonical hero visual on C-01 Welcome Screen and C-03 Activation Screen. Features official stand-up pouch packaging with natural bark formula. Single normalized filename across entire platform. |
| **Product Hero / Studio Packaging** | `public/brands/comprex/product-hero.jpg` | `https://www.goodcomprex.com/cdn/shop/files/An9OLBgYO0GNOx3Ym3Dt9o0p...jpg` | 1024 × 1024 px | JPEG | ~152 KB | Product context reference showing stand-up packaging in studio lighting. |
| **How to Use Infographic** | `public/brands/comprex/how-to-use.png` | `https://www.goodcomprex.com/cdn/shop/files/30db98ed-7c5d-4213-9ca0-78a75340ac74.png` | 1254 × 1254 px | PNG | ~1.6 MB | Official 4-step routine illustration: 1 teaspoon warm water before sleep. |
| **Brand Icon Mark** | `public/brands/comprex/mark.png` | `https://www.goodcomprex.com/cdn/shop/files/Untitled-1_...png` | 500 × 500 px | PNG | ~7.6 KB | Square icon mark for favicon / manifest badge. |

---

## 2. Optimization, Tagline Policy & Security Verification
1. **Asset Normalization:** `public/brands/comprex/product-pouch.jpg` is the single canonical product visual. All temporary or alternate names (such as `product-pouch-clean.jpg`) are obsolete and excluded.
2. **Official Logo Tagline Decision (§8):** While the client's official wordmark graphic (`logo.png`) intrinsically includes the brand tagline *"— Soin naturel des douleurs corporelles —"*, the application interface itself strictly retains the approved calm, non-clinical wellness tone (*"Your program, made simple."*, *"Welcome to your wellness journey. Simple routine. Clear progress. Easy reordering."*). The tagline is never separately extracted, repeated, or amplified as marketing copy.
3. **Zero Tracking / Ad Pixels:** None of the tracking pixels (Meta Pixel, Google Tag Manager, Axon Pixel, Clarity, Klaviyo) on `goodcomprex.com` were imported. Only pure raster image files were localized.
4. **Aspect Ratio Preservation:** Optical scaling retains original intrinsic proportions without distortion.
5. **Responsive Performance:** Local files are served through Next.js `<Image />` with automatic WebP conversion, srcset generation, and lazy loading.
6. **Tenant Isolation:** All COMPREX assets reside strictly in `public/brands/comprex/`. The platform's multi-brand architecture dynamically references `brand.logo_path` and `brand.product_image_path`, ensuring alternate tenants (such as Demo Wellness) render their own brand assets with zero leakage.
