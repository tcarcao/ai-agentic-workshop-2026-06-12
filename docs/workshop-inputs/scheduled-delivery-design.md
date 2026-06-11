# Design spec — Scheduled Delivery

> **Exercise E3, input #2 of 2.** Read with the PRD.
> Source of truth for tokens/components: `apps/web/src/design/{design.md,ember.css}`
> + the `@/components/ui` primitives. **Use real tokens — do not invent names.**

## Cart page addition

**Placement:** in the order-summary area, below the order-total row.

**Control:** an optional "Deliver later" toggle/control:
- Default state is **ASAP** — the scheduler is collapsed or empty; placing the
  order in this state means "now."
- When the customer opts in, reveal a date-time picker reusing the `<Input>` /
  `.field` treatment (border `var(--color-border)`, radius `var(--radius-input)`,
  focus matches `<Input>`, padding `var(--space-3)`/`var(--space-4)`).
- **Validation feedback:** if the chosen time is in the past, show the message in
  `var(--color-danger)` and block checkout — never silently place an ASAP order
  instead.

## Confirmation page — two states (both required)

**ASAP (no scheduled time):**
```
Delivery        Arriving in ~30–45 min     ← var(--color-text-muted) label, var(--color-text) value
```

**Scheduled (future time set):**
```
Delivery        Scheduled for Fri 19:00    ← same styling; value shows weekday + HH:MM
```

Use the existing receipt row styling; the only difference between states is the
value text. Don't render an empty or broken row when the value is missing.

## Error state (past time)

On a 400 from the API, surface the message near the scheduler in
`var(--color-danger)`, keep the customer in the cart, and leave the order
un-placed. Match how other form errors render.

## Token and component rules (machine-checked by `npm run lint`)
- Reuse `<Input>` / `<Card>` from `@/components/ui`; spacing via `var(--space-*)`.
- Date/time formatting is presentation only — keep the rule ("not in the past") in
  the domain, not the component.
- **Never a hex colour or a Tailwind colour utility class** — eslint errors on both.
