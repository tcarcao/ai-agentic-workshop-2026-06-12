# Testing & Validation Strategy — `apps/web` (frontend)

> **Scope:** this document covers the **frontend project only**. `apps/web` and `apps/api` are
> two independent projects that happen to share a repo; their test/lint/arch/CI processes are
> **decoupled** and each runs on its own. The web project **never** imports from `apps/api` — it
> talks to the backend only over HTTP, and shares the wire contract through `@workshop/shared`.

The frontend is a **Vite + React 19 + react-router** SPA. Crucially, **all HTTP goes through one chokepoint, `src/lib/api.ts`** — that single seam is what makes the views cheap to test in isolation: we mock the network there (or, better, just below it) and render the real component tree.

## The pyramid (frontend)

| Layer | Tool | Runs against | Speed | What it uniquely catches |
|---|---|---|---|---|
| **Unit** *(partly exists)* | Vitest | pure logic (cart, helpers) | ms · many | reducer/utility math (e.g. cart add/increment/remove) |
| **UI / view** *(the priority gap)* | Vitest + React Testing Library + **MSW** | real React tree in jsdom, **network mocked** | ms · many | component↔HTTP wiring: wrong context method, state-machine skips, swallowed error fields |
| **Architecture** *(new)* | dependency-cruiser (web's own config) | the import graph | ms · CI gate | feature/layer leaks; accidental `apps/api` import |
| **Lint** *(new)* | ESLint v9 + react plugins + Prettier | source | ms · CI + pre-commit | hook-deps bugs, a11y, raw `fetch` outside `api.ts`, hardcoded design tokens |

There is **no database here**. End-to-end (real browser + real backend) is a separate project (`e2e`); this project mocks the backend so its tests stay fast and deterministic.

---

## 1. Unit tests (keep, expand modestly)

Pure logic already tested (`src/features/cart/domain/cart.test.ts`). Keep this pattern for any future framework-free logic (formatters, reducers, derived-state helpers). Runner: Vitest (`environment: "jsdom"` already configured), `*.test.ts` co-located.

---

## 2. UI / view tests (the priority gap)

**Goal:** render real views/pages/contexts into jsdom and assert on what a user sees and does, with the **network mocked at the boundary** — no real backend, no browser.

### Stack
```
@testing-library/react        ^16   # v16+ targets React 19's renderer
@testing-library/user-event   ^14
@testing-library/jest-dom     ^6
msw                           ^2     # Mock Service Worker — intercept at fetch level
```
jsdom and Vitest are already present. Add a setup file and two `vitest.config.ts` lines (`setupFiles`, `globals: true`).

### Why MSW, not `vi.mock("../lib/api")`
`api.ts` is a thin but **non-trivial** translation layer (`apiFetch` error-normalization, `credentials: "include"`, the JSON-parse fallback that turns server errors into readable messages). Mocking the module bypasses all of it — you'd test that the component calls a function and handles the value you handed it, not that it survives what the real `api.ts` + HTTP stack returns. **MSW intercepts at `fetch`**, so the full `component → AuthContext → api.ts → fetch` chain runs for real with only the wire replaced. Set `onUnhandledRequest: "error"` so any unmocked call fails loudly.

### What this layer SHOULD and SHOULD NOT cover
**Should:** page-level state machines (`AccountPage` login→signup→confirm, incl. the dev-code hint), data-driven rendering after fetch (`RestaurantsPage` search + cuisine filter, empty states), auth-gated branching (`OrdersPage` guest vs logged-in), error states from the API (a 409 surfaces "Email already registered"), `AuthContext` initial `getMe`, and "`useX` throws without its provider".
**Should NOT:** pure logic (unit), visual/CSS fidelity or multi-page journeys (e2e), or API contract correctness (the backend project's integration tests). The bright line: **touches a real network request or cross-page navigation → it's e2e, not here.**

### Concrete example — AccountPage signup → confirm transition
```tsx
// src/pages/AccountPage.test.tsx  (sketch)
it("transitions signup → confirm and shows the dev-code hint", async () => {
  server.use(
    http.post("/api/auth/signup", () => HttpResponse.json({ ok: true }, { status: 201 })),
    http.get("/api/dev/confirmation-code", () => HttpResponse.json({ code: "123456" })),
  );
  const user = userEvent.setup();
  render(<MemoryRouter><AuthProvider><AccountPage/></AuthProvider></MemoryRouter>);

  await user.click(screen.getByRole("button", { name: /create account/i }));
  await user.type(screen.getByLabelText(/email/i), "user@test.com");
  await user.type(screen.getByLabelText(/password/i), "secret-pw");
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(await screen.findByRole("heading", { name: /confirm your email/i })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("123456");
});
```
The `AuthProvider` wraps the page exactly as the real app does — no stubbing of `useAuth`, no module mocks.

### Wiring
- `src/test/server.ts` — shared MSW node server with default (unauthenticated, empty-data) handlers.
- `src/test/setup.ts` — `server.listen({ onUnhandledRequest: "error" })`, `resetHandlers()` per test, `import "@testing-library/jest-dom"`.
- `vitest.config.ts` — add `setupFiles: ["src/test/setup.ts"]`, `globals: true`.
- Convention: co-located `*.test.tsx` next to the subject (no `__tests__/`).

### Component-level vs page-level
"Component tests" for this SPA = the same toolchain pointed at smaller units (a single `RestaurantCard`, a `ui/` primitive) instead of a whole page. Same stack, narrower scope; no separate tool needed. Note: **Playwright Component Testing** (real Chromium per component) is the alternative — rejected here as 5–10× slower for state/DOM assertions; reserve real-browser fidelity for the `e2e` project.

---

## 3. Architecture tests (new — web's own dependency-cruiser)

The web project gets its **own** `apps/web/.dependency-cruiser.cjs` and its **own** `arch:check` script — independent of the backend's. The codebase passes these today, so locking in is free. Rules:

```js
// no importing the other project — only the shared contract package
{ name: "no-api-app-import", severity: "error",
  from: { path: "^src" }, to: { path: "@workshop/api" } }

// design-system primitives stay primitive
{ name: "ui-stays-primitive", severity: "error",
  from: { path: "^src/components/ui" }, to: { path: "^src/(features|pages)/" } }

// dependency direction is pages → features, never the reverse
{ name: "features-dont-import-pages", severity: "error",
  from: { path: "^src/features/" }, to: { path: "^src/pages/" } }

// features are vertical slices — no cross-feature imports
{ name: "no-cross-feature-imports", severity: "error",
  from: { path: "^src/features/([^/]+)/" }, to: { path: "^src/features/(?!\\1/)([^/]+)/" } }

{ name: "no-circular", severity: "error", from: {}, to: { circular: true } }
```
The "only `lib/api.ts` may call `fetch`" rule is **not** here — `fetch` is a browser global, not an import, so the graph can't see it. That belongs to ESLint (below).

---

## 4. Lint & static checks (new — frontend's own config)

This project gets its **own** `eslint.config.mjs` (ESLint v9 flat) — not shared with the backend.

- React: `eslint-plugin-react-hooks` with **`exhaustive-deps: "error"`** (an error, so agents can't silently skip a dep), `react/react-in-jsx-scope: "off"` (React 19), `react/prop-types: "off"`.
- Accessibility: `eslint-plugin-jsx-a11y` recommended — catches `alt`, `button type`, semantics that TypeScript can't see (vital for agent-generated JSX).
- Boundaries: `no-restricted-imports` blocking `apps/api` / `@workshop/api` and deep internal paths; `no-restricted-syntax`/`no-restricted-globals` flagging **raw `fetch(` outside `src/lib/api.ts`**.
- Design tokens: a rule flagging hardcoded hex colors in inline styles — AGENTS.md forbids them and there are **live violations** today (`#1A0E03`, `#F4882A` in `RestaurantCard`, `MenuItemRow`, `RestaurantsPage`, `OrderConfirmation`); the `Logo.tsx` SVG gradient is a legitimate `eslint-disable` exception. Pair with `stylelint` for `.css`.
- `consistent-type-imports`. (Type-aware linting is **off by default** here — `moduleResolution: bundler` makes it costlier and the payoff is lower than on the async backend; add later if needed.)
- Formatter: **Prettier**, this project's own config. Scripts: `lint`, `lint:fix`, `format`, `format:check`.

### Architecture-tests vs lint — the split
- **dependency-cruiser** = the import **graph** (feature/layer/package boundaries, cycles).
- **ESLint** = **call-site & style** (hooks, a11y) and what the graph can't see (the raw-`fetch` global, hardcoded colors).

---

## 5. Conventions

This project gets its **own** `apps/web/CONTRIBUTING.md`: setup, the feature-folder rule (`src/features/<name>/{components,context,domain}`), the "design system only — never hardcode colors/spacing" rule, the "HTTP only via `src/lib/api.ts`, types only from `@workshop/shared`" rule, hooks/`exhaustive-deps` policy, pages-fetch-data convention, Conventional Commits. `AGENTS.md` (root) stays the agent overlay.

---

## 6. CI (this project's own job)

A dedicated `web` job, independent of and parallel to the API job:
```
npm ci
npm run lint -w apps/web
npm run format:check -w apps/web
npm run arch:check -w apps/web
npm run test -w apps/web
npm run build -w apps/web
```

---

## Why these layers matter (for the talk)

- **UI/view tests** catch the large middle band of failures that live at the React-to-HTTP boundary — a component wired to the wrong context method, a state machine that skips a step, an error field renamed so the UI silently swallows the message. These are invisible to unit tests (no rendering) and expensive to diagnose in e2e (slow, full-flow reproduction). With MSW they surface within seconds of the change that caused them, with no backend and no browser.
- **Architecture + lint** make "the agent followed our frontend conventions" a **verifiable assertion** instead of a hope: an agent asked to "add a filter" will happily build a raw `fetch()` into a component or import across features — a failing `arch:check`/lint is the guardrail it must satisfy before merge. (The hardcoded-color violations already in the tree are exactly the kind of drift a linter would have stopped.)
