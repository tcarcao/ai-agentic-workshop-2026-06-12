# Order Notes — approved implementation plan

> **Approved implementation plan (reference).** Reachable via `checkpoint/plan-done`
> for anyone who wants to start implementing from a reviewed plan instead of
> writing their own.
>
> Feature: an optional free-text "special instructions" note on an order
> (PRD: `order-notes-prd.md`, design: `order-notes-design.md`). Hexagonal, **domain
> outward**. Whitespace-only → stored as `""`. **No new endpoint** (PRD out-of-scope).
> Done = `npm test && npm run build && npm run lint && npm run arch:check` + the browser check.

## Order of work (commit after each green step — `git reset --hard HEAD~1` is your undo)

### 1. Domain — carry (and trim) the note
- `apps/api/src/modules/ordering/domain/entities.ts`: add `note: string` to the Order
  entity. Where the Order is constructed, accept an optional note and **trim it** —
  whitespace-only becomes `""`. Keep the domain pure (no Prisma, no HTTP).
- Test (`apps/api/src/modules/ordering/.../placeOrder.test.ts` or a domain test): a `"   "`
  note becomes `""`; a real note is preserved.
- Gate: `npm test`.

### 2. Application — thread it through the use case
- `apps/api/src/modules/ordering/application/placeOrder.ts` (`makePlaceOrder`): accept
  `note` on the input and pass it into the domain Order. Depend only on the outbound **port
  interface** — do **not** import Prisma here (`arch:check` enforces this).
- Update the fake-port test so a placed order round-trips `note`.
- Gate: `npm test`.

### 3. Shared contract — the FE↔BE seam (do this deliberately)
- `packages/shared/src/contracts.ts`: add `note?: string` to `PlaceOrderRequest` and
  `note: string` to the `Order` response type. This is the **single source of truth** — both
  apps import it. This is the exact `lines`-vs-`items` seam from Part 1: if the field name
  drifts here, every gate stays green and the note silently vanishes.
- Gate: `npm run build` (types must line up across packages).

### 4. Infrastructure — persist it
- `apps/api/prisma/schema.prisma`: add `note String @default("")` to the Order model.
- From `apps/api`: `npx prisma migrate dev --name order-notes` (the adapter URL stays the
  relative `file:prisma/dev.db`).
- `apps/api/src/modules/ordering/infrastructure/mappers.ts`: map `note` row⇄domain both ways.
- Gate: `npm test && npm run build`.

### 5. API route — read it off the request (thin)
- `apps/api/src/server.ts`: the place-order route parses `note` from the body and passes it
  to the `ordering` facade. No Prisma, no domain logic in the route. Extend the **existing**
  place-order call — no new endpoint.
- Gate: `npm run build && npm run arch:check`.

### 6. Web — send it, capture it, show it
- `apps/web/src/lib/api.ts`: include `note` in the place-order request body (the **only**
  place that talks HTTP).
- Cart (`src/features/cart`): add the "Special instructions (optional)" control between the
  total row and the name field. Use the `Input` primitive from `src/components/ui` (extend it
  to render a `<textarea>` if needed). **Never hard-code a hex or border colour** — use the
  design tokens; `npm run lint` will fail otherwise. Placeholder: "e.g. no onions, ring doorbell".
- Order confirmation (`src/features/orders`): render the note in a labelled block **only when
  non-empty**, wrapped in the `Card` primitive, label in `var(--color-text-muted)`.
- Gate: `npm run lint && npm run build`.

### 7. Verify → self-review → ship
- Browser (`localhost:5173`): order **with** a note → it shows on confirmation; order
  **without** → no block; type **only spaces** → treated as empty.
- Hand the agent its own diff: any raw colours? all UI from `components/ui`? note trimmed
  before the domain? `npm run lint` + `npm run arch:check` clean?
- Commit.

## Definition of done
`npm test && npm run build && npm run lint && npm run arch:check` all green, the three
browser cases pass, committed. (`npm run e2e` is **out of scope** for the session.)
