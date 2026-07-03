## 1. License and Conduct Files

- [x] 1.1 Add `LICENSE` file with full MIT License text, copyright line `Copyright (c) <current-year> Pekanbaru Dev`
- [x] 1.2 Add `CODE_OF_CONDUCT.md` with Contributor Covenant 2.1 full text and a clearly-marked enforcement contact placeholder
- [x] 1.3 Add `SECURITY.md` with vulnerability reporting instructions (private GitHub Security Advisory, response time window, report contents)

## 2. Contributing Guide

- [x] 2.1 Add `CONTRIBUTING.md` documenting: prerequisites (Node.js version, pnpm install), clone + dev server, pnpm command set, code style (Svelte 5 runes, Tailwind v4 `@theme` tokens, Prettier tabs), commit convention, PR process
- [x] 2.2 Link CONTRIBUTING.md to `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md` for detailed conventions instead of duplicating
- [x] 2.3 Add OpenSpec workflow section to CONTRIBUTING.md

## 3. GitHub Templates

- [x] 3.1 Add `.github/ISSUE_TEMPLATE/bug_report.yml` — structured form with required fields: summary, steps to reproduce, expected/actual behavior; optional: environment, screenshots
- [x] 3.2 Add `.github/ISSUE_TEMPLATE/feature_request.yml` — structured form with required fields: problem being solved, proposed solution; optional: alternatives considered
- [x] 3.3 Add `.github/ISSUE_TEMPLATE/config.yml` with `blank_issues_enabled: false` and a contact link pointing to the templates
- [x] 3.4 Add `.github/PULL_REQUEST_TEMPLATE.md` with sections: Summary, Related Issue, Type of Change (bug fix/feature/docs/refactor), Checklist (tests, lint, `pnpm check`), Reviewer Notes

## 4. Funding Config

- [x] 4.1 Add `.github/FUNDING.yml` with placeholder/commented entries so the Sponsor button appears with no active platform link

## 5. README Rewrite

- [x] 5.1 Add one-line project description under the title and a badges row (license: MIT, build status placeholder, SvelteKit version)
- [x] 5.2 Add a "Getting started" section with `pnpm install` + `pnpm dev` and the dev server URL
- [x] 5.3 Preserve the existing "Commands" table and "Project structure" section verbatim
- [x] 5.4 Preserve the existing "Design system" section and ensure it links to `PRODUCT.md` and `DESIGN.md`
- [x] 5.5 Add a "Contributing" section linking to `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`
- [x] 5.6 Move the "rtk" section under a "Tooling" heading to declutter the top of the README
- [x] 5.7 Preserve the existing "Agent setup" and "OpenSpec workflow" sections at the bottom of the README

## 6. Verification

- [x] 6.1 Verify `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` exist at repo root
- [x] 6.2 Verify `.github/ISSUE_TEMPLATE/` contains `bug_report.yml`, `feature_request.yml`, and `config.yml`
- [x] 6.3 Verify `.github/PULL_REQUEST_TEMPLATE.md` and `.github/FUNDING.yml` exist
- [x] 6.4 Verify `README.md` has description, badges, Getting started, Contributing section, and all preserved existing sections
- [x] 6.5 Run `pnpm check` and `pnpm lint` to confirm no source or config regressions (community files are non-code, so these should pass unchanged)
