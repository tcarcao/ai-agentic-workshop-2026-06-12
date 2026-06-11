# Design spec — Promo Code at Checkout

> **Exercise E2, input #2 of 2.** Read with the PRD.
> The feature is already styled in the starter; use this to judge whether the
> *behaviour* matches the *intent*, and to keep your work on-brand.
> Source of truth for tokens/components: `apps/web/src/design/{design.md,ember.css}`
> + the `@/components/ui` primitives. **Use real tokens — do not invent names.**

## Cart page

**Promo input:** a single-line input + an "Apply" button, in the order-summary
area below the subtotal. Reuses the `<Input>` / `.field` treatment (border
`var(--color-border)`, radius `var(--radius-input)`, focus matches `<Input>`;
padding `var(--space-3)`/`var(--space-4)`). The Apply button is the standard
`<Button>` from `@/components/ui`.

**Applied state:** when a valid code is applied, show a discount line:
```
Subtotal            $24.00
Promo (SAVE10)      -$2.40    ← label var(--color-text-muted); amount via <Price>, negative
Total               $21.60
```
An unknown code shows a quiet inline note in `var(--color-text-muted)` ("code not
recognised") — not an error colour, and checkout is never blocked.

## Confirmation page

When the order has a discount, show the same Promo line in the receipt totals
block, between subtotal and total, using the existing row styling.

## Token and component rules (machine-checked by `npm run lint`)
- Money via `<Price>` / `formatCents` from `@workshop/shared`.
- Spacing via `var(--space-*)`; rows match the existing receipt totals.
- **Never a hex colour or a Tailwind colour utility class** — eslint errors on both.
