# Contributing — `e2e` (end-to-end acceptance, BDD)

> A **separate, self-contained project** (its own workspace + Playwright config + CI job). It
> treats `apps/api` and `apps/web` as **black boxes over HTTP** and never imports their source —
> that is what lets the two app projects stay decoupled while still being proven to work together.
> See `TESTING_STRATEGY.md` for the full rationale.

## Quick start
```bash
npm install                # from repo root (workspaces; "e2e" is a workspace)
npx playwright install     # one-time: browser binaries
npm run e2e                # from repo root: bddgen + playwright test
npm run e2e:ui             # interactive UI mode
```
Playwright's `webServer` boots the API and web automatically and waits for them; a `globalSetup` resets + seeds the database once.

## Stack
- **playwright-bdd** (Gherkin `.feature` files → native Playwright runner). No Cucumber runtime.
- `@playwright/test`.

## Layout
- `features/` — Gherkin scenarios (the living, stakeholder-readable spec).
- `steps/` — step definitions.
- `pages/` — page objects (one per route page).
- `support/` — `global-setup` (db reset+seed), API helpers (the dev confirmation-code), fixtures.
- `.auth/` — gitignored cached `storageState`.

## Conventions
- **Selectors target accessible roles/labels** (`getByRole`, `getByLabel`) — never brittle CSS paths.
- **Keep it small:** 5–8 high-value journeys (guest checkout, full auth journey, guest-order-claim-on-login, search smoke). Push everything else down to the cheaper layers (unit, UI/view, backend integration). Test at the lowest layer that gives confidence.
- **DB:** run single-worker; reset + seed once in `globalSetup`; use timestamp-suffixed emails per scenario so runs are collision-free. SQLite is single-writer — do not parallelize workers against it.
- **Email confirmation** uses the dev-only `GET /api/dev/confirmation-code?email=` (no inbox). Fetch it via Playwright's `request` context; this couples e2e to a dev-only affordance, so the helper throws clearly if the code is absent (i.e. you're hitting production).
- **Auth** is an httpOnly cookie captured automatically in `storageState`; log the seed account in once per suite, not per scenario.

## Commits & PRs
- **Conventional Commits**, scope `e2e`. A new product journey should arrive with (or as) a `.feature` scenario.
