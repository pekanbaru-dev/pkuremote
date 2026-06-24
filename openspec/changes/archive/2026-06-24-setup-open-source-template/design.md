## Context

The PKU Remote repository is a SvelteKit community site that currently has no community-facing files. The `README.md` covers stack and commands but lacks badges, contributor onboarding, and links to contribution guides. The `.github/` directory contains only agent prompt/skill scaffolding — no issue templates, PR template, funding config, or health files. The project needs to become ready for external contributions.

Existing constraints:
- Package manager is **pnpm** (not npm/yarn) — all contribution instructions must use pnpm commands.
- Svelte 5 runes mode, Tailwind v4, shadcn-svelte — CONTRIBUTING must mention the runes constraint and the Tailwind v4 `@theme` token system so contributors do not introduce legacy patterns.
- The repo already documents conventions in `AGENTS.md`, `PRODUCT.md`, and `DESIGN.md` — CONTRIBUTING should link to these rather than duplicate them.
- The project has a calm, editorial brand personality (per PRODUCT.md); community files should match that tone — clear, concise, no jargon.

## Goals / Non-Goals

**Goals:**
- Provide a LICENSE so contributors and users know the terms under which the code is shared.
- Give contributors a single, clear path from clone to first PR via CONTRIBUTING.md.
- Set behavioral expectations via CODE_OF_CONDUCT.md.
- Provide a private vulnerability reporting channel via SECURITY.md.
- Standardize issue and PR intake through templates so contributors provide the right information upfront.
- Rewrite README.md so it serves as both a project landing page (badges, description, install, usage) and a contributor onboarding entry point (links to all community files).

**Non-Goals:**
- Setting up CI/CD pipelines or GitHub Actions workflows.
- Creating a documentation site or storybook.
- Changing any source code, build configuration, or dependencies.
- Establishing a formal release process or versioning policy.
- Adding CLAUDE.md / AGENTS.md content (already present and out of scope).

## Decisions

### Decision: MIT License

**Choice:** Use the MIT License.

**Rationale:** MIT is permissive, widely understood, and appropriate for a small community open-source project. It imposes minimal friction on adoption and contribution. The copyright holder will be "Pekanbaru Dev" (the GitHub org name).

**Alternatives considered:**
- Apache 2.0 — adds patent grant complexity unnecessary for a community site.
- GPL — copyleft would restrict derivative use; not the intent for a public community site.

### Decision: Contributor Covenant 2.1

**Choice:** Adopt the Contributor Covenant 2.1 Code of Conduct.

**Rationale:** It is the de facto standard for open-source community projects, well-maintained, and available in a stable, widely-recognized form. Enforcement contact will point to the repository maintainer email (or a placeholder to be filled before first external contribution).

**Alternatives considered:**
- A custom code of conduct — unnecessary effort and lower recognition.
- Citizen Code of Conduct — less common and harder for contributors to recognize.

### Decision: Issue templates as YAML front-matter forms

**Choice:** Use YAML front-matter issue forms (`.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`) rather than markdown templates.

**Rationale:** YAML forms render as structured web forms in GitHub's issue editor, guiding contributors to fill each field. They reduce incomplete reports compared to plain markdown templates. The repo has no `config.yml` blank-issue redirect yet — we add one to discourage empty issues by pointing to the templates.

**Alternatives considered:**
- Plain markdown templates — less structured, higher rate of incomplete reports.
- Single generic template — does not differentiate bug vs feature intake.

### Decision: README structure — description first, contributor links near top

**Choice:** Rewrite README to: project name + one-line description, badges row, "Getting started" (install + dev), "Commands" table (preserve existing), "Project structure" (preserve existing), "Design system" (preserve existing, link to PRODUCT.md / DESIGN.md), "Contributing" section (links to CONTRIBUTING, CODE_OF_CONDUCT, SECURITY), "Agent setup" (preserve existing), "OpenSpec workflow" (preserve existing). Move "rtk" section to a subsection under a "Tooling" heading to declutter the top.

**Rationale:** A visitor scanning the README should understand what the project is, how to run it, and how to contribute within the first screen. Existing technical sections remain valuable but are reorganized so the contributor onboarding path is visible without scrolling past tooling details.

**Alternatives considered:**
- Keep current README, append a Contributing section — the current README leads with tooling (rtk) before commands; a contributor-first restructure is cleaner.
- Move all agent/tooling content to a separate docs file — would break the existing convention of keeping it in README.

### Decision: FUNDING.yml with no active sponsors yet

**Choice:** Add `.github/FUNDING.yml` with a commented-out or minimal placeholder (no active sponsor platform URLs), so the "Sponsor" button appears on the repo sidebar as a no-op until the maintainers decide on funding.

**Rationale:** Having the file present signals intent and avoids a future "forgot to add it" gap. Keeping it minimal avoids linking to personal accounts prematurely.

**Alternatives considered:**
- Omit FUNDING.yml entirely — loses the signal and requires a future change.
- Link to a maintainer Ko-fi/Patreon — premature; no decision made on funding platform.

## Risks / Trade-offs

- [Stale community files] → CONTRIBUTING, CODE_OF_CONDUCT, and SECURITY will need updates as the project matures (e.g., real maintainer email, real enforcement contact). Mitigation: keep contact references as a clearly-marked TODO placeholder so they are easy to find and update.
- [Issue templates too rigid] → YAML forms with required fields may deter quick bug reports. Mitigation: keep required fields to the minimum (summary + steps for bugs; problem + proposed solution for features) and allow optional context fields.
- [README restructure confuses existing contributors] → anyone who has bookmarked the current README layout will need to relearn it. Mitigation: preserve all existing sections and content; only reorder and add, do not remove.