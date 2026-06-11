# Ember — Design System

**A precise, late-night kitchen pass.** Dark, cinematic, confident, cool. Food glows against a blue-obsidian canvas; a teal ember does the talking, with an orange spark as the secondary accent; Inter is clean and editorial, JetBrains Mono keeps numbers honest. This is a brand, not a UI kit exercise.

All tokens below are exposed as CSS custom properties on `:root` in `ember.css` (this directory).

---

## 1. Color

| Token | Value | Purpose |
|---|---|---|
| `--color-bg` | `#0E1116` | Blue-obsidian canvas (not pure black) |
| `--color-surface` | `#161B22` | Cards |
| `--color-elevated` | `#1C232C` | Modals, drawers, sheets, chips |
| `--color-border` | `#2A323C` | Hairlines |
| `--color-ember` | `#5EE0C0` | **PRIMARY** — teal; CTAs, price highlight, active states |
| `--color-gold` | `#F0883E` | Orange spark — stars, hover glow, secondary accent, prices |
| `--color-text` | `#E9EEF3` | Cool off-white (never pure white) |
| `--color-text-muted` | `#8B949E` | Secondary text, meta |
| `--color-success` | `#5ED08A` | Confirmation, success states |
| `--color-danger` | `#F47174` | Errors, destructive, spicy |

### Dietary tags (solid text + ~15% fill)

| Token | Value | Purpose |
|---|---|---|
| `--color-vegan` / `--fill-vegan` | `#5ED08A` / `rgba(94,208,138,.15)` | Vegan pill |
| `--color-spicy` / `--fill-spicy` | `#F47174` / `rgba(244,113,116,.15)` | Spicy pill |
| `--color-gf` / `--fill-gf` | `#6C9EE0` / `rgba(108,158,224,.15)` | Gluten-free pill |

---

## 2. Typography

| Token | Value | Purpose |
|---|---|---|
| `--font-display` | `'Inter', system-ui, sans-serif` | Restaurant & dish **names** — big, editorial, weight 700–800, tight tracking; names may crop the card edge |
| `--font-body` | `'Inter', system-ui, sans-serif` | All UI, body, descriptions, labels |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | Prices, ratings, counts, ETA — tabular |

### Scale

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--fs-11` | 11px | | `--fs-24` | 24px |
| `--fs-12` | 12px | | `--fs-32` | 32px |
| `--fs-14` | 14px | | `--fs-44` | 44px |
| `--fs-16` | 16px | | `--fs-64` | 64px |
| `--fs-18` | 18px | | | |

`--lh-display: 1.1` · `--lh-body: 1.5` · display tracking `-0.02em`.

---

## 3. Spacing — 4px base

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--space-1` | 4px | | `--space-8` | 32px |
| `--space-2` | 8px | | `--space-10` | 40px |
| `--space-3` | 12px | | `--space-12` | 48px |
| `--space-4` | 16px | | `--space-16` | 64px |
| `--space-5` | 20px | | `--space-20` | 80px |
| `--space-6` | 24px | | | |

---

## 4. Radius

| Token | Value | Purpose |
|---|---|---|
| `--radius-card` | 16px | Cards |
| `--radius-input` | 12px | Inputs, small controls |
| `--radius-pill` | 999px | Tags, buttons, badges |
| `--radius-modal` | 24px | Modals, drawers |

---

## 5. Elevation — cool teal glow, never harsh grey

| Token | Value | Purpose |
|---|---|---|
| `--glow-ember` | `0 4px 24px rgba(94,224,192,.12)` | Interactive cards / primary buttons (rest) |
| `--glow-ember-strong` | `0 8px 36px rgba(94,224,192,.22)` | Hover / focus lift |
| `--shadow-modal` | `0 24px 64px rgba(0,0,0,.7)` | Modals, drawers, floating cart bar |

---

## 6. Motion

| Token | Value | Purpose |
|---|---|---|
| `--dur-fast` | 180ms | Taps, hovers, label float |
| `--dur` | 240ms | Card lift, morph, arrive |
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | Ease-out, **no bounce** |

**Signature motions**
- **Add-to-cart morph** — a round `+` button expands into a `[ − qty + ]` stepper (`.add` → `.add.is-active`).
- **Cart total pop** — total scales `1 → 1.2 → 1` on change (`.pop`).
- **Content arrive** — 8px slide-up + fade on scroll (`.reveal` → `.reveal.in`).

---

## 7. Food photography art direction

Cinematic and cool — food **glows** against the blue-obsidian canvas, lit from above like a plate under a pass light. Enforced ratios: **16:9** heroes (`.photo--16x9`), **1:1** thumbnails (`.photo--1x1`). Every image frame carries a bottom gradient scrim so overlaid text stays legible. Real images drop into `.photo > img` and inherit the frame; until then a tasteful teal-spotlight placeholder (`.photo--ph`) stands in — **never a broken image**.

---

## 8. Components

`Button` (primary / secondary / ghost / disabled / block) · `RestaurantCard` (+ `--featured`) · `MenuItemCard` · dietary `Tag` · `Price` · `Stars` (half-star, inline) · `Input` (floating label, ember focus ring) · `add`/stepper morph · `cart-badge` · sticky `site-header` · floating `cart-bar` · `sec-nav`.

See `system.html` for every component rendered in context.

---

## 9. Screens

| File | Screen |
|---|---|
| `index.html` | Browse — sticky header, hero, hierarchical restaurant grid (one featured + standard) |
| `restaurant.html` | Restaurant menu — hero header, section nav, item list, floating cart bar |
| `cart.html` | Cart — item steppers, mono price breakdown, ember checkout |
| `confirmed.html` | Order confirmed — pulse ring, ember-spark confetti, ETA badge |
| `system.html` | Design-system showcase |
