# Contributing — `apps/web` (frontend)

> This is the contributor guide for the **frontend project**. `apps/web` and `apps/api` are two
> independent projects sharing a repo; their tooling (lint, arch, test, CI) is **decoupled** and
> runs on its own. The web app talks to the backend **only over HTTP** and shares the wire
> contract through `@workshop/shared` — it never imports from `apps/api`. Agent-specific rules
> live in the root `AGENTS.md`. **This file is the human foundation for the frontend.**

## Quick start
```bash
npm install                  # from repo root (workspaces)
npm run dev -w apps/web      # web SPA on http://localhost:5173 (expects the API on :3001)
```
Verification gate (must all pass before "done"):
```bash
npm run lint -w apps/web && npm run arch:check -w apps/web \
  && npm run test -w apps/web && npm run build -w apps/web
```
Green CI is **not** "done" — also click through the affected feature in the browser.

## What this project is
A **Vite + React 19 + react-router** SPA. The only UI. All HTTP goes through **one chokepoint**, `src/lib/api.ts`.

## Architecture rules (machine-enforced by `npm run arch:check`)
- `src/features/{restaurants,menu,cart,orders,auth}/` — one folder per feature (its `components`, `context`, `domain` together). **No cross-feature imports** — features are vertical slices.
- `src/components/ui/` — design-system primitives (`Button`, `Card`, `Tag`, `Price`, `Input`, `Stars`, `Logo`). Must **not** import from `features/` or `pages/` (they stay primitive and reusable).
- `src/pages/` — react-router route pages. Dependency direction is **pages → features**, never the reverse.
- `src/lib/api.ts` — the **only** place that talks HTTP. No `fetch` anywhere else (enforced by ESLint).
- Imports come **only from `@workshop/shared`**, never from `apps/api`/`@workshop/api` (enforced).

## Code conventions
- **TypeScript `strict`**; `import type { … }` for type-only imports.
- **Design system, always:** never hard-code colours or spacing — use the CSS custom properties in `src/design/` and the `ui` components (dietary labels `<Tag tone="…">`, money `<Price cents={…}>` / `formatCents`). Enforced by a lint rule (the only allowed hardcoded-hex exception is SVG gradient data, with an `eslint-disable` + reason).
- **Hooks:** Rules of Hooks + `exhaustive-deps` are **errors**, not warnings. Custom hooks live in `src/lib/` or beside their feature.
- **Accessibility:** `jsx-a11y` rules are enforced — real roles/labels, `alt` text, `button type`.
- Data fetching happens in page components or dedicated hooks (via `src/lib/api.ts`), not deep in primitives.

## Testing (see `TESTING_STRATEGY.md` for the full rationale)
- **Unit:** Vitest for framework-free logic (e.g. `features/cart/domain`).
- **UI/view:** Vitest + React Testing Library + **MSW** (mock at the network boundary, not `api.ts`). Co-located `*.test.tsx`. Cover page state machines, filters, auth-gated branches, and error states.
- This project has **no database** and boots **no backend** — the backend is mocked. Real-stack journeys live in the separate `e2e` project.

## The contract triangle
A change to the FE↔BE contract spans three packages: `packages/shared` (the type) → `apps/api` (route + use case) → `apps/web` (`lib/api.ts` + UI). If the UI and the API disagree on a field name, every automated gate passes and only a human clicking the button catches it — so keep all three in sync and lean on the e2e suite.

## Commits & PRs
- **Conventional Commits:** `<type>(<scope>): <subject>` — scope usually `web`. PR body: what + why + how to verify (incl. the browser check).

## Working with AI agents
The linter + `arch:check` turn "the agent followed our frontend conventions" into a verifiable assertion: an agent will happily build a raw `fetch()` into a component or import across features unless a machine stops it. See `AGENTS.md` for agent-specific rules.
