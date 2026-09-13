# COMPREX Authentic Brand Asset Inventory

**Date:** 2026-09-13  
**Source Domain:** `https://www.goodcomprex.com`  
**License & Ownership:** Client-Owned Brand Assets (COMPREX / Good Comprex)  
**Destination Directory:** `public/brands/comprex/`  

---

## 1. Asset Registry

| Asset Name | Local File Path | Source URL / Origin | Dimensions | Format | File Size | Primary Purpose & Usage Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Official Logo Wordmark** | `public/brands/comprex/logo.png` | `https://www.goodcomprex.com/cdn/shop/files/Asset_2.png` | 2988 × 670 px | PNG (Transparent) | ~66 KB | Brand header, customer onboarding, admin header, print access header. Features official icon, bold geometric typography, and French slogan *"— Soin naturel des douleurs corporelles —"*. |
| **Clean Product Packaging Pouch** | `public/brands/comprex/product-pouch.jpg` | Cropped from studio hero shot (`An9OLBgYO0GNOx3Ym3Dt9o0p...jpg`) | 420 × 580 px | JPEG (Clean Studio) | ~66 KB | Hero visual on C-01 Welcome Screen and C-03 Activation Screen. Features official stand-up pouch packaging with natural bark formula. |
| **Product Hero / Studio Packaging** | `public/brands/comprex/product-hero.jpg` | `https://www.goodcomprex.com/cdn/shop/files/An9OLBgYO0GNOx3Ym3Dt9o0p...jpg` | 1024 × 1024 px | JPEG | ~152 KB | Product context reference showing new stand-up packaging versus historical jar. |
| **How to Use Infographic** | `public/brands/comprex/how-to-use.png` | `https://www.goodcomprex.com/cdn/shop/files/30db98ed-7c5d-4213-9ca0-78a75340ac74.png` | 1254 × 1254 px | PNG | ~1.6 MB | Official 4-step routine illustration: 1 teaspoon warm water before sleep. |
| **Brand Icon Mark** | `public/brands/comprex/mark.png` | `https://www.goodcomprex.com/cdn/shop/files/Untitled-1_...png` | 500 × 500 px | PNG | ~7.6 KB | Square icon mark for favicon / manifest badge. |

---

## 2. Optimization & Security Verification
1. **Zero Tracking / Ad Pixels:** None of the tracking pixels (Meta Pixel, Google Tag Manager, Axon Pixel, Clarity, Klaviyo) on `goodcomprex.com` were imported. Only pure raster image files were localized.
2. **Aspect Ratio Preservation:** Optical scaling retains original intrinsic proportions without distortion.
3. **Responsive Performance:** Local files are served through Next.js `<Image />` with automatic WebP conversion, srcset generation, and lazy loading.
4. **Tenant Isolation:** All COMPREX assets reside strictly in `public/brands/comprex/`. The platform's multi-brand architecture dynamically references `brand.logo_path` and `brand.product_image_path`, ensuring alternate tenants (such as Demo Wellness) render their own brand assets with zero leakage.
