# PRD — Special Instructions on Orders

> **Workshop input #1 of 2.** Hand this to your agent together with the design spec.

## Problem

Customers often need to communicate preferences to the kitchen ("no onions", "extra sauce", "ring the doorbell"). Today the order captures only items and a customer name. Kitchen staff miss these signals; customers are frustrated.

## Goal

Let any customer add a free-text note to their order at checkout. The note must reach the kitchen and appear on the order confirmation so the customer can verify it was received.

## User stories

- As a customer, I want to type a note at checkout so the kitchen gets my preferences before they start cooking.
- As a customer who has no special requests, I want the field to be optional so I am never blocked from checking out.

## Acceptance criteria

1. The cart page shows an optional "Special instructions" textarea.
2. A note typed at checkout is sent with the order and **persisted server-side** on the `Order` record.
3. The order confirmation page (`/orders/[id]`) shows the note in a labelled block when present; the block is **absent** when the note is empty.
4. Whitespace-only input is stored as empty string (trimmed before persisting).
5. A fresh-clone setup (`npm install && npm run db:setup`) works without any manual steps.

## Definition of done (non-negotiable)

- `npm test` passes (existing tests plus any new/updated ones).
- `npm run build` passes.
- `npm run lint` passes (no hardcoded hex colours or Tailwind colour classes — the design-token gate).
- `npm run arch:check` passes with no violations.
- The acceptance criteria above are verifiable in the browser.

## Out of scope

- Per-item notes (this is order-level only).
- Editing a note after the order is placed.
- Anything that requires a new API endpoint.
