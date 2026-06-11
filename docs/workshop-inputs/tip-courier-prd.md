# PRD — Tip the Courier

> **Exercise E1 · angle: validation under ambiguity.** Read with the design spec.
> ⚠️ This PRD is **deliberately under-specified.** It tells you the happy path and
> nothing else. The edge cases are *your* job — see "Open questions" below. In an
> agentic workflow, **ambiguity is a bug in the input**: if you don't decide, the
> agent will decide for you, confidently, and probably wrong.

## Problem
Couriers do the last mile, but the app gives customers no way to thank them. We
want customers to be able to add a tip at checkout.

## Goal
Let a customer add an optional tip to their order at checkout. The tip is added to
the order total and shown on the confirmation.

## User stories
- As a customer, I want to add a tip at checkout so I can reward good service.
- As a customer who doesn't want to tip, I want the field to be optional so I'm
  never blocked from checking out.

## Acceptance criteria (the happy path only)
1. The cart page shows an optional tip input.
2. A tip is added to the order total and persisted server-side.
3. The confirmation page shows the tip as its own line when a tip was added; the
   line is absent when there is no tip.

## Open questions the spec does NOT answer — **you decide, and be ready to defend it**
The grade isn't "did you match a hidden answer key" — it's "did you *notice* these,
make a deliberate call, and enforce it where it belongs (the domain)."
- What unit is the tip in — dollars or cents? What does the input accept and how
  is it stored?
- What happens with a **negative** tip?
- What happens with a **non-integer** like `5.5`, or a value the input can't
  parse (`"abc"`, empty, whitespace)?
- What happens when the tip is **larger than the order total**? Is that allowed?
- Is there an upper bound?

> Hint: `Number(body.tip)` will happily produce `NaN` and sail past the type
> checker and the linter — then store garbage. The gates won't catch it. *You*
> are the gate here.

## Out of scope
- Percentage-preset tip buttons (15% / 20%).
- Tipping or changing the tip after the order is placed.
- Splitting the tip across multiple couriers.

## Definition of done
- The validation rules **you chose** are enforced in the **domain** (not the UI),
  with unit tests covering each decision above that you made.
- `npm test && npm run build && npm run lint && npm run arch:check` all green.
- Browser: a valid tip shows on the confirmation and is in the total; your
  rejected/edge cases behave the way you said they would.
