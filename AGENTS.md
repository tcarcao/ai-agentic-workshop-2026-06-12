# Ember — conventions for agents

A food-delivery app split into a **backend** (`apps/api`), a **frontend** (`apps/web`), and **shared contracts** (`packages/shared`). Put code where it belongs; the backend boundaries are enforced by `npm run arch:check` (it fails the build if you cross them).

## The monorepo (npm workspaces)
- **`apps/api`** — a **Hono** API server. Owns the domain + the SQLite database. Nothing else talks to the DB.
- **`apps/web`** — a **Vite + React** SPA (react-router). The only UI. It talks to the API over HTTP via `src/lib/api.ts`.
- **`packages/shared`** (`@workshop/shared`) — the API **contract types** + money helpers, imported by **both** apps.
- Run from the repo root: `npm run dev` (api `:3001` + web `:5173`), `npm test`, `npm run arch:check`, `npm run db:setup`.

## Backend — `apps/api`, hexagonal in `src/modules/ordering/`
- `domain/` — pure entities + rules. **No** imports of Prisma, HTTP/Hono, or anything in `application`/`infrastructure`.
- `application/` — use cases (factory functions like `makePlaceOrder`) + outbound port interfaces in `ports.ts`. Depend on the **interfaces**, never on Prisma.
- `infrastructure/` — Prisma adapters that implement the ports, plus `mappers.ts` (DB row ⇄ domain).
- `container.ts` — the composition root; exports the `ordering` facade.
- `src/server.ts` — the Hono routes. Keep them **thin**: parse the request, call the `ordering` facade, translate domain errors to HTTP. **Never** touch Prisma or a repository from a route.
- `src/modules/accounts/` is a sibling bounded context to `ordering/` — a full hexagon with its own `container.ts` facade (email+password auth: scrypt hashing, JWT in an httpOnly cookie). The shared Prisma client lives in `src/shared/prismaClient.ts`. Auth is resolved by a middleware in `server.ts` that sets `userId` (or `null`) on the request context; **anonymous checkout works with `userId === null`**. Orders carry an optional `userId`, so order history syncs for logged-in users while guests keep using `localStorage`. **Deliberate decision:** `GET /api/orders/:id` has no ownership check — guests must be able to fetch their own orders without auth, and the cuid ids are unguessable; don't "fix" this by requiring auth on that route.

## Frontend — `apps/web` (Vite + React SPA)
- `src/features/{restaurants,menu,cart,orders}` — one folder per feature; keep its components/context/logic together.
- `src/components/ui/` — design-system primitives (`Button`, `Card`, `Tag`, `Price`, `Input`, `Stars`).
- `src/pages/` — react-router route pages; fetch data via `src/lib/api.ts` (**the only place that talks HTTP**).
- The web app imports types/helpers **only from `@workshop/shared`** — never from `apps/api`.

## Shared — `packages/shared` (`@workshop/shared`)
- `contracts.ts` — the wire types (`Restaurant`, `MenuItem`, `Order`, `OrderLine`, `PlaceOrderRequest`, `PlaceOrderResponse`). When the FE↔BE contract changes, change it **here** and update **both** sides.
- `money.ts` — `formatCents`, `sumLines`.

## Design system
- Lives in `apps/web/src/design/` (`design.md` + `ember.css` — the tokens are `:root` custom properties in `ember.css`; `tokens.css` is a legacy import shim), used via `src/components/ui`.
- **Never hard-code colours or spacing.** Use the CSS custom properties and the `ui` components. Dietary labels use `<Tag tone="…">`; money uses `<Price cents={…} />` (or `formatCents` from `@workshop/shared`).

## Workflow
- Tests are Vitest. `npm test` from the root runs all workspaces. Pure logic (domain, use cases with fake ports, cart) is unit-tested — add/extend tests when you change behaviour.
- Before you're done: **`npm test && npm run build && npm run arch:check`** must all pass — then run the app and **click it in the browser** (green CI ≠ done).
- The database is SQLite via Prisma 7 (libsql driver adapter) in `apps/api`. Schema changes: from `apps/api`, `npx prisma migrate dev --name <change>`. The adapter URL must stay a **relative** `file:prisma/dev.db` (Windows-safe).
- **A change to the FE↔BE contract spans all three packages:** `packages/shared` (the contract) → `apps/api` (route + use case) → `apps/web` (`api.ts` + the UI). Keep them in sync — a mismatch (e.g. the UI sends `lines` but the API reads `items`) passes every automated gate and only shows up when a human clicks the button.

## Agent skills

### Issue tracker

Local markdown — PRDs and issues live under `docs/issues/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, defaults unchanged (`ready-for-agent` is the AFK-ready one). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. **`CONTEXT.md` (repo root) is the glossary** — the ubiquitous language with one canonical name per concept and the synonyms to avoid; use its terms in code, tests, issues, and PRDs. This `AGENTS.md` stays the conventions/architecture reference. `/grill-with-docs` maintains `CONTEXT.md` inline as terms get resolved. See `docs/agents/domain.md`.
