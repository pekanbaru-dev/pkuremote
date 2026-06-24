## Why

The repository has no community-facing files — no LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates, or a README that welcomes contributors. Before the project can accept external contributions, it needs the standard open source template that communicates license terms, contribution process, behavioral expectations, and reporting channels.

## What Changes

- Add `LICENSE` file (MIT)
- Add `CONTRIBUTING.md` with contribution guidelines (setup, dev workflow, commit style, PR process)
- Add `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1)
- Add `SECURITY.md` with vulnerability reporting instructions
- Add issue templates under `.github/ISSUE_TEMPLATE/` (bug report, feature request)
- Add pull request template at `.github/PULL_REQUEST_TEMPLATE.md`
- Add `.github/FUNDING.yml` placeholder
- Rewrite `README.md` with badges, install instructions, usage docs, and contributor onboarding links

## Capabilities

### New Capabilities

- `community-template`: The set of community-facing files (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates, funding config) and the README contributor onboarding section that together make the project ready for external contributions.

### Modified Capabilities

_None._ No existing spec-level behavior changes.

## Impact

- New files: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/FUNDING.yml`
- Modified files: `README.md` (rewritten with badges, install/usage sections, contributor links)
- No source code, build, or dependency changes
- No API or runtime behavior changes