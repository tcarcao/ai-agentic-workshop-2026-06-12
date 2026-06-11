# Design spec — Special Instructions

> **Workshop input #2 of 2.** Read together with the PRD.
> Source of truth for tokens and components: `apps/web/src/design/design.md`,
> `apps/web/src/design/ember.css` (token definitions), and the existing
> `@/components/ui` primitives. **Use the real tokens below — do not invent
> token names.** The Ember design system is class-based: prefer reusing the
> existing components/classes over hand-rolling styles.

---

## Cart page addition

**Placement:** between the order-total row and the customer-name field.

**Label:** "Special instructions (optional)" — colour `var(--color-text-muted)`,
`font-size` matching the rest of the form labels (`var(--font-body)`).

**Control:** a `<textarea>` that follows the same visual treatment as `<Input>`
from `@/components/ui`. `<Input>` renders the `.field` pattern from `ember.css`,
so the cleanest path is to **reuse that treatment** rather than restyle from
scratch. If you set explicit values, use the real tokens:
- Border: `1px solid var(--color-border)`
- Border-radius: `var(--radius-input)`
- Focus: match `.field input:focus` in `ember.css` **exactly** (border
  `var(--color-ember)` plus its focus ring) — reuse the rule; do not hand-pick
  a colour or shadow.
- Padding: `var(--space-3)` vertical, `var(--space-4)` horizontal (matches `Input`)
- Minimum height: ~80 px; width: 100%
- Placeholder text: `e.g. no onions, ring the doorbell`
- Font: `var(--font-body)`, same size as body

> Hint: extend `<Input>` to accept `as="textarea"` (preferred — one source of
> truth). **Either way you must extend `ember.css`:** the `.field` rules only
> select `.field input`, so a bare `<textarea>` inside `.field` is unstyled —
> add a `.field textarea { … }` rule mirroring the input treatment.

> **Label vs placeholder:** `.field`'s floating label relies on
> `placeholder=" "` + `:placeholder-shown`, so a field with a *real*
> placeholder can't float its label on content. For the textarea, render the
> label **always floated** (the small uppercase state) and keep the example
> placeholder.

---

## Confirmation page addition

**Condition:** render this block only when `order.note` is a non-empty string.

**Container:** a `<Card>` padded with `var(--space-5)` — set it via an inline
`style` or an `ember.css` class, placed under the totals block on the
confirmation page. **Note: this app does not generate Tailwind utilities**
(there is no `@import "tailwindcss"` in the CSS entry), so arbitrary-value
classes like `p-[var(--space-5)]` silently do nothing — don't use them.

**Structure:**
```
[Card]
  "Special instructions"   ← label, var(--color-text-muted), small, font-weight 500
  "No onions please, …"    ← body, var(--color-text), normal weight
[/Card]
```

**Spacing:** `var(--space-2)` between label and body text (e.g. an inline
`marginTop` on the body — same Tailwind caveat as above).

---

## Token and component rules

| Element | Use |
|---|---|
| Text field | `<Input>` from `@/components/ui` (or a textarea reusing the `.field` treatment) |
| Confirmation container | `<Card>` from `@/components/ui` |
| Label colour | `var(--color-text-muted)` |
| Body colour | `var(--color-text)` |
| Spacing | `var(--space-*)` tokens only — no raw `px`, no Tailwind `p-4` |
| Borders | `var(--color-border)` — never a hex value |

**Never hard-code a hex colour or a Tailwind colour utility class
(`text-gray-500`, `border-gray-300`, etc.).** Both are **machine-checked by
eslint** (`npm run lint`) — a hardcoded hex *or* a Tailwind colour class is a
lint error. (`arch:check` enforces the backend architecture boundaries, not
colours — different gate, different job.)
