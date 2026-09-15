# Kabatos Program Platform — Motion Design System & Interaction Specification

**Document Version:** 1.0.1 — Remediated Precision Edition  
**Brand Flagship:** COMPREX (Brand #1)  
**Target Platform:** Kabatos Program Platform  

---

## 1. Motion Design Philosophy (§14, §15)

Motion in the Kabatos Program Platform is designed to feel **restorative, purposeful, calm, and tactile**. Because COMPREX is a premium natural wellness companion for users addressing body discomfort and establishing daily routines, animation must communicate:
- **State Changes:** What just happened?
- **Continuity & Orientation:** Where did this state originate?
- **Accomplishment & Rhythm:** Encouraging momentum without frenetic or childish gamification.

### Core Non-Negotiables
1. **Never Gimmicky:** No confetti explosions, neon glows, aggressive bounces, or constant floating particles.
2. **Never Blocking:** All transition durations are bounded between 160ms and 360ms. Users never wait for animations to complete before interacting.
3. **Strictly Accessible:** WCAG 2.1 AA checks passed for the tested MVP application scope, including 100% compliance with `prefers-reduced-motion: reduce`. When reduced motion is requested, all translation, scaling, and looping effects are stripped, preserving only instant or minimal opacity state indicators.
4. **Compositor Accelerated:** Dynamic interactive animations (button depression, card reveal, ambient float, and progress bar fill) strictly target `transform` and `opacity` with `will-change: transform` to maintain 60 FPS on mobile devices and avoid layout reflow recalculations.

---

## 2. Motion Token Architecture (§16)

The motion system is standardized in `app/globals.css` via CSS custom properties:

```css
:root {
  /* Motion Durations & Curves */
  --motion-instant: 100ms cubic-bezier(0.2, 0.8, 0.2, 1);
  --motion-fast: 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
  --motion-base: 240ms cubic-bezier(0.16, 1, 0.3, 1);
  --motion-slow: 360ms cubic-bezier(0.16, 1, 0.3, 1);
  --motion-emphasis: 480ms cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Shared Easing Curves */
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### Motion Tiers
| Token | Duration | Primary Application |
| :--- | :--- | :--- |
| `--motion-instant` | 100ms | Button active tap/press feedback, icon state swaps. |
| `--motion-fast` | 160ms | Input focus rings, contact selector pills, tooltip reveals. |
| `--motion-base` | 240ms | Card state morphs, checkmark draws, timeline chip completions. |
| `--motion-slow` | 360ms | Step/screen transitions, progress bar transform expansion. |
| `--motion-emphasis` | 480ms | Success screen reveals, initial hero product entrance. |

---

## 3. Microinteraction Specifications

### 1. Tactile Button Tap (Haptic-Like Visual Feedback, §57)
- **State:** `:active`
- **Feedback:** `transform: scale(0.98) translateY(1px);`
- **Transition:** `transition: transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1);`
- Provides an immediate physical feedback sensation on both desktop mouse clicks and mobile touch taps.

### 2. Contact Method Selector (C-02 Onboarding, §23)
- **Element:** Email / Phone toggle pill.
- **Feedback:** Smooth sliding background indicator (`transition: all 160ms cubic-bezier(0.16, 1, 0.3, 1)`).
- **Semantics:** Accessible radio group semantics with `aria-checked` attributes.

### 3. Inline Error Reveal (§23, §74)
- **Trigger:** Validation failure on form submit or blur.
- **Feedback:** `opacity: 0 -> 1` and `transform: translateY(-4px) -> translateY(0)`.
- **Constraint:** Zero violent horizontal shaking. The movement is gentle and informative.

### 4. Hero Product Ambient Presence (C-01 Welcome Screen, §21, §83)
- **Element:** Canonical COMPREX pouch packaging (`public/brands/comprex/product-pouch.jpg`).
- **Feedback:** Ultra-slow, barely perceptible vertical float (`translateY(0) -> translateY(-3px) -> translateY(0)` over 7.5 seconds) paired with a soft radial warm light (`#FDEEE1`).
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is enabled, the float animation is disabled; the product remains static.

### 5. Hero Daily Usage Completion ("Mark as Completed", C-07, §30, §31)
- **Sequence:**
  1. **Press:** Button depresses slightly (`scale(0.98)`).
  2. **Persistence:** Button label transitions to an inline subtle spinner while the server RPC runs.
  3. **Success:** Button morphs from active orange to soft success green (`#15803D`), accompanied by an animated SVG stroke checkmark drawing (`stroke-dashoffset: 0`).
  4. **Confirmation Banner:** A gentle notification reveals: *"Usage logged! Great job keeping your momentum going."*
  5. **Compositor Progress Bar Fill:** Advances smoothly with `transform: scaleX(...)` and `transform-origin: left center` on the GPU thread via `transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1)`. The outer track preserves precise semantic attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`).
  6. **Undo Affordance:** A clear, secondary "Undo" button is available without cluttering the primary task.

### 6. Admin Schedule Day Chips Editor (A-04, §41, §78)
- **Element:** Schedule day selector buttons (1..duration).
- **Feedback:** Click/tap instantly toggles selection with a subtle scale pop (`scale(1.05) -> scale(1)`).
- **Duration Normalization:** When duration is reduced (e.g. from 14 to 10 days), chips outside the new range are pruned immediately with zero layout distortion.

---

## 4. Accessibility & Reduced Motion Matrix (§17, §103)

| Component | Default Motion Behavior | Reduced Motion (`prefers-reduced-motion: reduce`) |
| :--- | :--- | :--- |
| **Hero Product Float** | 7.5s continuous gentle vertical float (3px) | Animation disabled (`transform: none`) |
| **Card Step Transition** | Fade-in + 8px slide up (240ms) | Instant opacity fade (0.01ms), zero translation |
| **Progress Bar Fill** | 360ms GPU compositor `transform: scaleX()` expansion | Instant scale jump (0.01ms) |
| **Checkmark Draw** | SVG path stroke animation (240ms) | Instant visible checkmark icon |
| **Button Press** | 100ms scale(0.98) depression | Visual border/background color change only |
| **Error Messages** | Fade-in + 4px slide down (160ms) | Instant visible text with `role="alert"` |

### Authoritative Color Contrast Standard
- **#121212 Text on #F07106 (Primary Brand):** **6.31 : 1** (WCAG AA & AAA for large text).
- **#121212 Text on #D85800 (Deep Amber Hover):** **4.74 : 1** (WCAG AA compliant; white text on #D85800 yields 3.95:1 and is avoided by enforcing #121212 on hover).
- **Compliance Status:** WCAG 2.1 AA checks passed for the tested MVP application scope.

---

## 5. Performance Budget (§55, §104)
- All dynamic UI state animations execute on the GPU compositor thread using `transform` (scale, translate, scaleX) and `opacity`.
- Zero reflow-triggering properties (`margin`, `top`, `left`, `width` during continuous animations) are animated.
- The single continuous animation in the application (hero product float) is throttled via standard CSS keyframes with `will-change: transform`.
