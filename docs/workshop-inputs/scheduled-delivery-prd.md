# PRD — Scheduled Delivery

> **Exercise E3 · angle: spec-driven, multi-state.** Read with the design spec.
> This PRD is **fully specified on purpose** — including one rule and one state
> that agents routinely forget on the first plan. The exercise is **plan-review**:
> read the generated plan against the acceptance criteria *before* approving. A
> rule caught at plan time costs a sentence; caught after the build, an afternoon.

## Problem
Customers can only order for "now." People want to order lunch at 9am for noon, or
dinner before they leave the office. Today the order has no notion of *when*.

## Goal
Let a customer optionally schedule their order for a future time. Default stays
ASAP; a scheduled order is persisted and clearly shown.

## User stories
- As a customer, I want to schedule delivery for later so it arrives when I need it.
- As a customer in a hurry, I want ASAP to remain the default so nothing changes
  for me.

## Acceptance criteria (observable in the browser + tests)
1. The cart page has an optional "Deliver later" date-time control. Default is
   **ASAP** (the control is empty / off).
2. **ASAP state:** if no time is set, the order is placed as now, and the
   confirmation shows an ASAP message (e.g. "Arriving in ~30–45 min").
3. **Scheduled state:** if a valid future time is set, it is persisted, and the
   confirmation shows "Scheduled for {weekday} {HH:MM}" instead of the ASAP
   message.
4. **Past-time rule (the one that's easy to miss):** if the chosen time is in the
   **past**, the order is **rejected with a 400** and a clear message; **nothing
   is persisted**. This rule lives in the **domain**, not just the UI.
5. The domain owns "scheduled time must not be in the past," with unit tests for
   both the accept (future) and reject (past) cases.

## Out of scope
- Editing or cancelling the schedule after the order is placed.
- Fixed delivery-window slots / capacity limits.
- Time zones beyond the browser's local time.

## Definition of done
- `npm test && npm run build && npm run lint && npm run arch:check` all green,
  including domain unit tests for the future-accept and past-reject cases.
- Browser: confirm **both** confirmation states (ASAP and scheduled) render
  correctly, and that a past time is rejected with the message (no order created).
- A plan you **reviewed** before approving — specifically check it includes
  acceptance #4 (the 400 path) and both render states from #2/#3.
