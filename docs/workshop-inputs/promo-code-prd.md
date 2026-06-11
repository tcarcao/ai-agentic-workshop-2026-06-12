# PRD — Promo Code at Checkout

> **Read with the design spec** (`promo-code-design.md`).
> ⚠️ **This feature is already built.** Reset to `checkpoint/promo-seam-start` and
> you'll find a complete promo implementation. Your job as the orchestrator is the
> last mile: **verify it like you own the gate, then ship it.**

## Problem

Marketing wants to run promotions, but checkout has no way to accept a code.

## Goal

Let a customer enter a promo code at checkout and see the discount applied to
their total.

## Intended behaviour (what "correct" looks like — verify against this)

1. The cart page has an optional promo-code input + an "Apply" action.
2. Codes:
   - `SAVE10` → 10% off the subtotal.
   - `SAVE5` → 500 cents ($5) off.
   - Any unknown or empty code → **no discount and no error** (checkout still works).
3. The applied discount shows as its own line on the cart and on the confirmation,
   and the total reflects it. The total never goes below 0.
4. The discount rule lives in the **domain** and is unit-tested.

## Out of scope

- Stacking multiple codes; per-restaurant codes; expiry dates; usage limits.

## Definition of done

- The four gates green (`npm test && npm run build && npm run lint && npm run arch:check`)
  **and** the intended behaviour above verified **in the browser**.
- Shipped with a sensible commit message.
