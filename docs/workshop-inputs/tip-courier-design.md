# Design spec — Tip the Courier

> **Exercise E1, input #2 of 2.** Read with the PRD.
> Source of truth for tokens/components: `apps/web/src/design/{design.md,ember.css}`
> + the `@/components/ui` primitives. **Use real tokens — do not invent names.**

## Cart page addition

**Placement:** in the order-summary area, directly under the order-total row
(before the customer-name field).

**Label:** "Add a tip for your courier (optional)" — `var(--color-text-muted)`,
form-label size, `var(--font-body)`.

**Control:** a single-line money input reusing the `<Input>` / `.field` treatment:
- Border `var(--color-border)`, radius `var(--radius-input)`, focus matches
  `<Input>`.
- Padding `var(--space-3)` / `var(--space-4)`; width 100%.
- A leading currency affix (`$`) consistent with how `<Price>` renders money.
- Placeholder: `0.00`.

> Decide how the input maps to stored value (see the PRD's "Open questions"). If
> you reject a value, show the message in `var(--color-danger)` and keep the
> customer in the cart — never a silent no-op.

## Confirmation page addition

**Condition:** render the tip line only when the order has a tip greater than 0.

**Placement:** in the receipt totals block, as its own line between subtotal and
total, consistent with the existing total rows.

**Structure:**
```
Subtotal            $24.00
Tip                  $3.00     ← label var(--color-text-muted); amount via <Price>
Total               $27.00
```

## Token and component rules (machine-checked by `npm run lint`)
- Money is rendered with `<Price>` / `formatCents` from `@workshop/shared` — never
  a hand-formatted string.
- Spacing via `var(--space-*)`; the tip line matches the existing total rows.
- **Never a hex colour or a Tailwind colour utility class** (`text-gray-500`,
  `border-gray-300`, …) — eslint errors on both.
