# Contributing — `apps/api` (backend)

> This is the contributor guide for the **backend project**. `apps/api` and `apps/web` are two
> independent projects sharing a repo; their tooling (lint, arch, test, CI) is **decoupled** and
> runs on its own. The repo-wide overview is the root `README.md`; agent-specific rules live in
> the root `AGENTS.md`. **This file is the human foundation for the backend.**

## Quick start
```bash
npm install                     # from repo root (workspaces)
npm run db:setup -w apps/api    # migrate + seed the local SQLite db
npm run dev -w apps/api         # API on http://localhost:3001
```
Verification gate (must all pass before "done"):
```bash
npm run lint -w apps/api && npm run arch:check -w apps/api \
  && npm run test -w apps/api && npm run test:integration -w apps/api \
  && npm run build -w apps/api
```

## What this project is
A **Hono** HTTP API with a **hexagonal** core over **Prisma 7 / SQLite**. It owns the domain and the database; nothing else talks to the DB.

## Architecture rules (machine-enforced by `npm run arch:check`)
- `src/modules/<context>/domain/` — pure entities + rules. **No** imports of Prisma, Hono/HTTP, or anything in `application`/`infrastructure`. Domain returns plain errors; it knows nothing about HTTP.
- `src/modules/<context>/application/` — use cases as factory functions (`makePlaceOrder`) + outbound **port interfaces** in `ports.ts`. Depend on the interfaces, **never** on Prisma or adapters.
- `src/modules/<context>/infrastructure/` — Prisma adapters that implement the ports, plus `mappers.ts` (DB row ⇄ domain).
- `container.ts` — composition root; exports the module facade (`ordering`, `accounts`).
- `src/shared/prismaClient.ts` — the **only** place that imports `@prisma/client`.
- `src/server.ts` — thin Hono routes: parse → call the facade → translate domain errors to HTTP. **Never** touch Prisma or a repository from a route.
- Bounded contexts (`ordering`, `accounts`) meet **only** through each other's `container.ts` facade — never reach into a sibling's internal layers.

## Code conventions
- **TypeScript `strict`** everywhere; no `// @ts-ignore`/suppressions without a comment explaining why.
- **ESM / NodeNext:** every relative import carries the **`.js` suffix** (`import { x } from "./x.js"`). Enforced by ESLint.
- `import type { … }` for type-only imports (enforced).
- Use-case factories are named `make<UseCase>`; ports are interfaces in `application/ports.ts`; adapters implement them in `infrastructure/`.
- **No `console.log`** in committed code (`console.error`/`warn` allowed; never in `domain/`/`application/`).
- **Async safety:** always `await`; no floating promises (enforced — an unawaited promise in a handler silently swallows errors).

## Testing (see `TESTING_STRATEGY.md` for the full rationale)
- **Unit:** Vitest + fake ports for `domain/` and `application/`. Add/extend a test when behaviour changes.
- **Component/integration:** Vitest + Hono `app.fetch` against an **ephemeral temp SQLite** (real migrations via `prisma migrate deploy`). Lives in `src/tests/**`, run with `npm run test:integration -w apps/api`.
- Every behavioural change needs a test; pure refactors must keep the gate green.

## Database
- Prisma 7 + libsql adapter; SQLite at a **relative** `file:prisma/dev.db` (Windows-safe). The URL is env-driven via `DATABASE_URL` for tests.
- Schema change: from `apps/api`, `npx prisma migrate dev --name <change>`. Mappers live in `infrastructure/mappers.ts`.

## Commits & PRs
- **Conventional Commits:** `<type>(<scope>): <subject>` — types `feat|fix|refactor|test|chore|docs`; scope usually `api` (or a module).
- PR body: what + why + how to verify. End AI-assisted commits with the `Co-Authored-By` trailer.

## Working with AI agents
The linter + `arch:check` are how we make "the agent followed our architecture" a **verifiable assertion**, not a hope. A clean lint is necessary but not sufficient — for behavioural changes, also run the integration tests. See `AGENTS.md` for agent-specific placement rules.
