# Testing & Validation Strategy — `apps/api` (backend)

> **Scope:** this document covers the **backend project only**. `apps/api` and `apps/web` are
> two independent projects that happen to share a repo; their test/lint/arch/CI processes are
> **decoupled** and each runs on its own. Nothing here depends on the web project.

The backend is a **Hono** API with a **hexagonal** core (`src/modules/{ordering,accounts}/{domain,application,infrastructure}` + `container.ts` facades) over **Prisma 7 / SQLite**. The architecture is the asset: because use cases depend on **port interfaces** rather than Prisma, the valuable logic is testable in milliseconds with no I/O. Our strategy leans into that.

## The pyramid (backend)

| Layer | Tool | Runs against | Speed | What it uniquely catches |
|---|---|---|---|---|
| **Unit** *(exists)* | Vitest + fake ports | pure domain + use cases | ms · many | business rules, use-case branches (e.g. `placeOrder` stamps `userId` / stays null) |
| **Component / integration** *(new)* | Vitest + Hono `app.fetch` + ephemeral SQLite | the **real** app + real DB, in-process | ~1–2 s/file · medium | real SQL, real migrations, real middleware, cookie round-trip, serialization |
| **Architecture** *(extend)* | dependency-cruiser | the import graph | ms · CI gate | a hexagon silently ceasing to be one |
| **Lint** *(new)* | ESLint v9 + typescript-eslint + Prettier | source | ms · CI + pre-commit | floating promises, unsafe async, missing `.js` ESM suffix, Prisma leaking into domain |

E2E is **not** a backend concern — it lives in the separate `e2e` project and treats this API as a black box over HTTP.

---

## 1. Unit tests (keep as-is)

Already in place and healthy: pure `domain/` rules and `application/` use cases tested with **fake ports** (in-memory repos). This is the bottom of the pyramid and where most tests should live. Continue adding a unit test whenever a use case or domain rule changes.

- Runner: Vitest (`npm run test -w apps/api`), config `vitest.config.ts` (`environment: "node"`).
- Pattern: `*.test.ts` co-located with the unit under test.

---

## 2. Component / integration tests (the priority gap)

**Goal:** exercise a real request through the whole stack — auth middleware → route → use case → Prisma adapter → SQLite — against an **isolated, ephemeral** database. This is the only layer that verifies the parts the fakes can't: the actual SQL, the real migrations, the cookie/JWT round-trip, and HTTP status mapping.

### Default approach: in-process `app.fetch`, ephemeral file SQLite
Hono exposes `app.fetch`, a standard `Request → Response` handler. Call it in-process — **no TCP socket, no container** — against a real but throwaway SQLite file. For a file-based DB this is the right default; Testcontainers adds 10–15 s of Docker startup with **zero** added fidelity (SQLite is the same in a container as on the host). Revisit Testcontainers **only** if/when the datasource becomes Postgres.

### DB isolation: fresh temp file per test file
- One unique temp DB per Vitest worker/file: `file:${os.tmpdir()}/ember-test-${randomUUID()}.db`.
- Apply the **real** migrations once in `beforeAll` via `execSync("npx prisma migrate deploy", { env: { DATABASE_URL: url } })` — same CLI path as production, so schema drift is impossible.
- Seed minimal fixtures (one restaurant + one item), not the full catalog.
- Within a file, reset with targeted `deleteMany` or use unique emails per test (`Date.now()`); delete the file in `afterAll`.
- Granularity = **per file**, not per test (migrations are ~100–200 ms; don't pay that per `it()`).
- `maxWorkers: 1` / `fileParallelism: false` in the integration config to serialize DB setup.

### Two prerequisite refactors (BE-only, also just better design)
1. **Make the DB URL configurable.** `src/shared/prismaClient.ts` hardcodes `file:prisma/dev.db`. Change to `process.env.DATABASE_URL ?? "file:prisma/dev.db"`. Without this, tests trample the dev DB and can't run in CI.
2. **Extract an app factory.** Today `server.ts` wires module-level singletons (`ordering`, `accounts`) and calls `serve()` at import time, so tests can't inject a test DB. Extract `export function createApp(ordering, accounts): Hono` (routes only, no `serve`) and move `serve(...)` to a tiny `src/main.ts`. Tests then compose real adapters against the temp DB and mount `createApp`.

### Scryp­t cost in tests
`ScryptPasswordHasher` is deliberately memory-hard, so full auth flows are slow. Either drive a few real signup→confirm→login flows (worth it — the cookie round-trip is part of the gap) or pre-sign a JWT with `hono/jwt` `sign()` for tests that only need an authenticated caller.

### Concrete example — the order-ownership safety invariant (currently UNVERIFIED)
`PrismaOrderRepository.claim()` re-homes only orders **whose `userId` is null** (`updateMany WHERE userId IS NULL`). A fake port will always pass regardless of that clause. The integration test that earns its keep:

```ts
// src/tests/claim-orders.test.ts  (sketch)
it("does NOT re-home an already-owned order to a second user", async () => {
  const alice = await registerAndLogin("alice@test.com", "Password1!"); // returns cookie
  const bob   = await registerAndLogin("bob@test.com",   "Password1!");
  const orderId = await placeAnonymousOrder("test-item-1");

  await app.fetch(claimReq(orderId, alice));            // Alice claims it
  const bobOrders = await (await app.fetch(claimReq(orderId, bob))).json();

  expect(bobOrders.some((o) => o.id === orderId)).toBe(false); // Bob can't steal it
  const row = await db.order.findUnique({ where: { id: orderId } });
  expect(row.userId).toBe(aliceId);                     // still Alice's
});

it("rejects an unauthenticated claim with 401", async () => {
  const res = await app.fetch(claimReq(orderId /* no cookie */));
  expect(res.status).toBe(401);
});
```

### Stack & wiring
- Runner: Vitest (reuse — no second runner).
- New config: `vitest.integration.config.ts` (`include: ["src/tests/**/*.test.ts"]`, `testTimeout: 30_000`, `maxWorkers: 1`).
- Script: `"test:integration": "vitest run --config vitest.integration.config.ts"`.
- Keep unit and integration configs separate so unit stays instant.

---

## 3. Architecture tests (extend the existing dependency-cruiser)

`.dependency-cruiser.cjs` already enforces the core hexagon (domain pure; application off Prisma/infrastructure; server via facades; no cycles). **Add three rules — the codebase passes them today, so locking in is free:**

1. **Sibling-module isolation** — `accounts/*` and `ordering/*` may only meet through each other's `container.ts` facade, never internal layers:
```js
{ name: "no-cross-module-internals", severity: "error",
  from: { path: "^src/modules/([^/]+)/(domain|application|infrastructure)/" },
  to:   { path: "^src/modules/(?!\\1/)([^/]+)/(domain|application|infrastructure)/" } }
```
2. **Prisma has one entry point** — only `src/shared/prismaClient.ts` may import `@prisma/client`:
```js
{ name: "prisma-only-via-shared", severity: "error",
  from: { path: "^src/(?!shared/prismaClient)" }, to: { path: "@prisma/client" } }
```
3. **Domain is zero-dependency** — strengthen "pure" to also exclude Node built-ins and external packages (allow only same-module + `@workshop/shared`).

> Note: `server.ts` importing domain **error classes** directly is intentional (they're part of the observable API). Keep a comment so it isn't accidentally extended; optionally route them through a `*/errors.ts` barrel.

- Runs via this project's own `npm run arch:check -w apps/api` — **not** coupled to the web arch check.

---

## 4. Lint & static checks (new — backend's own config)

This project gets its **own** `eslint.config.mjs` (ESLint v9 flat). It is not shared with the web project.

- Base: `@typescript-eslint/recommended` + `consistent-type-imports`.
- **Type-aware** (`projectService: true`, scoped to this project): `no-floating-promises`, `no-misused-promises`, `await-thenable` — the highest-value rules for an async Hono backend (an unawaited promise in a handler silently swallows errors).
- `import/extensions: ["error", "always", { ignorePackages: true }]` — enforce the NodeNext `.js` suffix the code already uses.
- `no-console: ["warn", { allow: ["error","warn"] }]` (error in `domain/`/`application/`).
- `no-restricted-imports` in `domain/**` banning `@prisma/client`/`hono` — an **editor-level early warning** that complements (does not duplicate) the dependency-cruiser graph check.
- Formatter: **Prettier**, this project's own config.
- Scripts: `lint`, `lint:fix`, `format`, `format:check`.

### Architecture-tests vs lint — the split (no duplication)
- **dependency-cruiser** owns the **import graph** (layering, module/Prisma isolation, cycles).
- **ESLint** owns **call-site & style** (async safety, naming) and the cheap early-warning `no-restricted-imports`. Do **not** add `import/no-cycle` (slow; dependency-cruiser does it better).

---

## 5. Conventions

This project gets its **own** `apps/api/CONTRIBUTING.md` (separate from the web project's): setup, the hexagon layering rules in prose, the `make<UseCase>` factory naming, ports-in-`application`/adapters-in-`infrastructure`, the `.js` ESM suffix rule, thin-routes rule, the no-`console.log` policy, Prisma migration workflow, Conventional Commits. `AGENTS.md` (repo root) remains the **agent-specific overlay**; `CONTRIBUTING.md` is the human foundation.

---

## 6. CI (this project's own job)

A dedicated `api` CI job, independent of and parallel to the web job:
```
npm ci
npm run lint -w apps/api
npm run format:check -w apps/api
npm run arch:check -w apps/api
npm run test -w apps/api
npm run test:integration -w apps/api
npm run build -w apps/api
```
Independence is the point: a web failure never blocks the API job and vice-versa.

---

## Why these layers matter (for the talk)

- **Component/integration** is the only automated gate that runs **real SQL + real migrations + real middleware**. The `claim()` "only-if-unowned" safety rule is *unverified* by the unit suite — a fake repository passes no matter what the WHERE clause says. The properties that matter are **isolated** (test order can't change outcomes) and **ephemeral** (the DB is born and dies with the run — no shared dev state, no "works on my machine").
- **Architecture tests** are what keep a hexagon a hexagon as a team — and as AI agents — add code under pressure. Diagrams decay; a failing `arch:check` is the one signal a code-generating agent **can't rationalize around**. And those same boundaries are *why the unit tests are cheap*: the moment `application/` may import `infrastructure/`, millisecond fakes become impossible.
