# Domain Docs

How the engineering skills should consume this repo's domain documentation.

## Layout: single-context

**`CONTEXT.md` at the repo root is the glossary** — the ubiquitous language
(one canonical name per concept, with terms to avoid). The conventions and
architecture reference is **`AGENTS.md`** at the root (it describes the bounded
contexts — `ordering` and `accounts` — the hexagonal layering, and the FE↔BE
contract rules). There is no `CONTEXT-MAP.md` (single context) and no
`docs/adr/` yet — create an ADR there only when a decision is hard to reverse,
surprising without context, and a real trade-off.

## Use the established vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a
test name), use the terms exactly as `CONTEXT.md` defines them — and respect its
`_Avoid_` lists. For code-level names, follow the existing code (`Order`,
`OrderLine`, `PlaceOrderRequest`, the `ordering` facade, ports/adapters).
Don't drift to synonyms. When a new concept gets named in a session
(e.g. via /grill-with-docs), add it to `CONTEXT.md` as it's resolved — don't
batch it for later.
