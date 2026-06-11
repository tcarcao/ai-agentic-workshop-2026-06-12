# Testing Strategy — `e2e` (end-to-end acceptance, BDD)

> **Scope:** this is a **separate, self-contained project** (its own workspace, `package.json`,
> Playwright config, and CI job). It treats `apps/api` and `apps/web` as **black boxes over
> HTTP** — it never imports their source. That is exactly what keeps the two app projects
> decoupled while still proving they work together.

E2E is the **top of the pyramid**: few, slow, high-value. It is the only automated layer that runs a **real browser** against the **real Vite proxy + real Hono server + real SQLite + real httpOnly cookie** — the one place the full vertical slice is proven. We use **BDD (Gherkin)** so the same `.feature` files double as living, stakeholder-readable acceptance criteria.

## Tooling decision: `playwright-bdd`

**`playwright-bdd`** (Gherkin `.feature` files compiled by `bddgen` into tests that run on the **native Playwright runner**). Honest comparison:

- **`playwright-bdd`** ✅ — true Gherkin **and** zero loss of Playwright tooling: fixtures, `storageState`, trace viewer, parallelism, UI mode all work because you're literally running Playwright tests. Only added ceremony: run `bddgen` before `playwright test`.
- **`@cucumber/cucumber` + Playwright** ✗ — Cucumber owns the runner, so you lose native workers, trace integration, `storageState` as a fixture, and carry a second dependency tree. In steady decline for TS projects.
- **Plain Playwright spec-style** ✗ for us — fastest to write, but the user wants Gherkin as stakeholder-facing acceptance criteria; worth it for a workshop/demo context.

Install surface: `@playwright/test` (1.45+), `playwright-bdd` (8.x), `@types/node`. No Cucumber runtime.

## Project layout (new fourth workspace)

```
e2e/                         ← @workshop/e2e (add "e2e" to root workspaces)
  package.json
  playwright.config.ts
  features/                  ← Gherkin (the living spec)
    guest-checkout.feature
    auth-journey.feature
    order-history.feature
  steps/                     ← step definitions
  pages/                     ← page objects (RestaurantsPage, MenuPage, CartPage, AccountPage, OrdersPage)
  support/                   ← global-setup (db reset+seed), api helpers (dev-code), fixtures
  .auth/signed-in.json       ← gitignored cached session (storageState)
```
Root scripts (fan-out only, no coupling): `"e2e": "bddgen -c e2e/playwright.config.ts && playwright test -c e2e/playwright.config.ts"`.

## The hard problems, solved for this app

- **App lifecycle** — Playwright `webServer` boots the API and web (`npm run dev:api`, `npm run dev:web`), waiting on `:3001/api/restaurants` and `:5173`. `reuseExistingServer: !process.env.CI` (fast local re-runs; always fresh on CI). Use the **dev server** locally; preview/build only if production-fidelity ever matters (this SPA has no SSR/build-time transforms).
- **DB determinism & isolation** — the app shares one SQLite file, so run **single-worker** (`workers: 1`) with a `globalSetup` that runs `npm run db:reset -w apps/api` once (restores 7 restaurants / 43 dishes). Each test that creates a user uses a **timestamp-suffixed email** so there are no collisions; restaurants/menus are read-only so tests never pollute the seed. SQLite is single-writer — **don't** parallelize workers against it (locked-DB errors); per-worker DB files are possible later but not worth it for ~5–8 scenarios that run in <90 s.
- **Email confirmation** — there's no inbox; the dev-only `GET /api/dev/confirmation-code?email=` returns the code. Fetch it from a step via Playwright's **`request` API context** (not the browser). Wrap it in `support/api.ts` as `getDevConfirmationCode(...)` that throws clearly if `code` is null (which would mean you're accidentally hitting production). Document that this step depends on `NODE_ENV !== "production"`.
- **Auth / cookies** — the session is an **httpOnly** cookie (`ember_session`); Playwright captures it in `storageState` automatically (it works at the network layer, not `document.cookie`). `globalSetup` signs up + confirms + logs in **one** seed account and saves `.auth/signed-in.json`; scenarios needing a logged-in user load that state (one login per suite, not per scenario). Scenarios that test **login itself** log in fresh.

## Example — one feature + the selector approach

```gherkin
# features/auth-journey.feature
Feature: Authenticated customer journey
  Scenario: Place an order and see it in order history
    Given I am signed up and confirmed as "tester+{timestamp}@example.com" with password "TestPass99!"
    And I am logged in
    And I am on the restaurants page
    When I open the first restaurant's menu
    And I add the first menu item to my cart
    And I navigate to the cart and place the order as "Ada Lovelace"
    Then I should see the order confirmation
    When I navigate to my order history
    Then I should see the order for "Ada Lovelace"
```
Selectors target **accessible roles/labels** (the app already exposes them): `getByLabel("Email"/"Password"/"6-digit code")`, `getByRole("button", { name: /create account|sign in|confirm/i })`, `getByRole("link", { name: "Cart" })`, the menu add button `aria-label="Add {name}"`. These are the most refactor-stable selectors available — no brittle CSS paths.

## What e2e SHOULD and SHOULD NOT cover

**Cover (5–8 scenarios max):**
1. Guest checkout happy path (browse → menu → cart → name → place → confirmation).
2. Full auth journey (signup → dev-code confirm → login → order → history).
3. **Guest order claimed on login** (place as guest, then sign in → order appears in history) — a product requirement no cheaper layer can prove.
4. Restaurant search/filter smoke.
5. *(optional)* Sign-in → email shows in nav.

**Do NOT cover:** cart math / order domain rules (unit), every form-validation error (backend integration / unit), visual regression (dedicated tool), exhaustive edge cases, device permutations. **Rule: test at the lowest layer that gives confidence; e2e earns a spot only when it needs a real browser + real network + real cookie + real DB.**

## Why this layer matters (for the talk)

The only class of defect that unit and component tests **structurally cannot** find is the cross-layer mismatch — the frontend sends `lines` but the API reads `items`; the Vite proxy drops a cookie the Hono server expects; `claimOrders` silently no-ops because `localStorage` clears at the wrong moment. Every one of these passes `npm test`, `build`, and `arch:check`, and is only caught when a human opens a browser and clicks **Place order**. A small BDD e2e suite is the only automated layer that proves the independently-correct pieces work **together as a system**. And Gherkin doubles the value: the `.feature` files Playwright executes are readable by anyone in the room without TypeScript — living acceptance criteria that can't go stale, because if the scenario passes the spec is met and if it fails the spec is broken.
