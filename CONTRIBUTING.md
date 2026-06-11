# Contributing

This repo holds **two independent projects** plus a shared contract and an acceptance suite.
Their tooling (lint, arch-check, test, CI) is **decoupled** — each runs on its own. Start with
the guide for the part you're working on:

- **Backend** → [`apps/api/CONTRIBUTING.md`](apps/api/CONTRIBUTING.md) · strategy: [`apps/api/TESTING_STRATEGY.md`](apps/api/TESTING_STRATEGY.md)
- **Frontend** → [`apps/web/CONTRIBUTING.md`](apps/web/CONTRIBUTING.md) · strategy: [`apps/web/TESTING_STRATEGY.md`](apps/web/TESTING_STRATEGY.md)
- **End-to-end (BDD)** → [`e2e/CONTRIBUTING.md`](e2e/CONTRIBUTING.md) · strategy: [`e2e/TESTING_STRATEGY.md`](e2e/TESTING_STRATEGY.md)
- **Shared contract** (`packages/shared`) — wire types + helpers imported by both apps; keep it framework-free and never import from either app.

Repo overview is in [`README.md`](README.md); AI-agent placement rules are in [`AGENTS.md`](AGENTS.md).

## Ground rules (apply everywhere)
- The frontend and backend are separate apps that communicate over HTTP; the only thing they share is the **contract** in `@workshop/shared`. Neither app imports the other's source.
- **Conventional Commits** (`feat|fix|refactor|test|chore|docs(scope): subject`).
- Each project's verification gate (lint + arch-check + test + build) must pass before "done"; for UI changes, also click it in the browser.
