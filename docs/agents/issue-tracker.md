# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files under `docs/issues/`
(a visible, version-controlled local tracker — so a `/to-prd` run produces a
real artifact in the repo, with no GitHub needed).

## Conventions

- One feature per directory: `docs/issues/<feature-slug>/`
- The PRD is `docs/issues/<feature-slug>/PRD.md`
- Implementation issues are `docs/issues/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `docs/issues/<feature-slug>/` (creating the directory if
needed), and set its `Status:` line (e.g. `Status: ready-for-agent`).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the
feature slug directly.
