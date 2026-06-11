# Ember

A small, **fully working** food-delivery app — the sample project for the *Agentic AI* workshop. It's split into a **separate backend and frontend** so the seams are real:

- **`apps/api`** — a **Hono** API server that owns the domain (hexagonal architecture) + the database.
- **`apps/web`** — a **Vite + React** single-page app that consumes the API over HTTP.
- **`packages/shared`** — the API contract types + shared helpers, imported by **both** apps.

Clean, modular, machine-checked boundaries so agents (and humans) can extend it with confidence — and the front-end / back-end boundary is a real HTTP contract, not an in-process call.

> This is the app you'll extend in the hands-on session — see [`docs/workshop-inputs/`](docs/workshop-inputs/) for the feature PRDs and design specs.

## Quick start

You need **Node 20+**. No database server — it uses a local SQLite file.

```bash
npm install
npm run db:setup     # migrate + seed the SQLite db (in apps/api)
npm run dev          # api → http://localhost:3001 · web → http://localhost:5173
```

Open <http://localhost:5173>, click a restaurant, add a dish, and place an order. The app also supports optional accounts (email + password; in dev, the email confirmation code is shown on the confirm screen) — create one to see your favorites and order history sync across devices. Anonymous checkout still works with no account required.

## Scripts (run from the repo root)

| Script | What it does |
|---|---|
| `npm run dev` | Start the API (`:3001`) and the web app (`:5173`) together |
| `npm run build` | Build both apps |
| `npm test` | Run all unit tests (Vitest, all workspaces) |
| `npm run arch:check` | Verify the backend architecture boundaries (dependency-cruiser) |
| `npm run db:setup` | Migrate + seed the database |
| `npm run db:seed` / `npm run db:reset` | Reseed / reset the database |

Per-app commands: append `-w apps/api` or `-w apps/web` (e.g. `npm run test -w apps/api`).

## Architecture

Two apps and a shared contract. The point: clean seams let agents contribute safely, and the FE↔BE boundary is an explicit HTTP contract.

### Backend — `apps/api` (Hono + hexagonal)
```
src/modules/ordering/
  domain/          pure entities + business rules (no framework imports)
  application/     use cases + outbound PORT interfaces (depend on interfaces, not Prisma)
  infrastructure/  Prisma adapters that implement the ports + row⇄domain mappers
  container.ts     composition root — wires adapters into use cases, exports the `ordering` facade
src/server.ts      Hono routes — thin; they call the `ordering` facade, never Prisma directly
```
Routes: `GET /api/restaurants`, `GET /api/restaurants/:id`, `POST /api/orders`, `GET /api/orders/:id`. Dependencies always point inward toward `domain`; `npm run arch:check` enforces it.

### Frontend — `apps/web` (Vite + React SPA)
```
src/features/        restaurants / menu / cart / orders — each owns its components / context / logic
src/components/ui/   design-system primitives (Button, Card, Tag, Price, Input, Stars)
src/pages/           route pages (react-router) — they fetch via src/lib/api.ts
src/lib/api.ts       typed fetch helpers — the only place that talks HTTP
```
The web app **never imports backend code** — only the shared contracts. In dev, Vite proxies `/api` → `:3001` (no CORS).

### Shared — `packages/shared` (`@workshop/shared`)
The wire **contracts** (`Restaurant`, `MenuItem`, `Order`, …) + money helpers, imported by both apps so the front-end and back-end agree on the shape that crosses HTTP.

### Design system
Lives in [`apps/web/src/design/`](apps/web/src/design/) (`design.md` + `tokens.css`), consumed via `src/components/ui`. **Never hard-code colours** — use the tokens and the `ui` components.

## Tech
**Backend:** Hono · Prisma 7 + SQLite · TypeScript. **Frontend:** Vite · React 19 · react-router · Tailwind CSS v4. **Tooling:** npm workspaces · Vitest · dependency-cruiser.
