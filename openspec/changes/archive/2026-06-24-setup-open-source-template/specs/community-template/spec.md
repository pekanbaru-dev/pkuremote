## ADDED Requirements

### Requirement: Repository includes an MIT LICENSE file

The repository root SHALL contain a `LICENSE` file with the full MIT License text. The copyright line SHALL read `Copyright (c) <year> Pekanbaru Dev`.

#### Scenario: License file present and valid

- **WHEN** a visitor opens the repository root
- **THEN** a `LICENSE` file exists containing the MIT License with the copyright line `Copyright (c) <current-year> Pekanbaru Dev`.

### Requirement: CONTRIBUTING.md defines the contributor path

The repository root SHALL contain a `CONTRIBUTING.md` that documents: prerequisites (Node.js version, pnpm install), how to clone and run the dev server, the pnpm command set, code style expectations (Svelte 5 runes, Tailwind v4 `@theme` tokens, Prettier tabs), the commit message convention, the PR process, and links to `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md` for detailed conventions.

#### Scenario: New contributor follows the guide

- **WHEN** a new contributor reads CONTRIBUTING.md
- **THEN** they can install dependencies, start the dev server, run lint/check/test, and open a PR without consulting any other document.

#### Scenario: Convention references are linked, not duplicated

- **WHEN** CONTRIBUTING.md mentions Svelte 5 runes, Tailwind v4 tokens, or agent conventions
- **THEN** it links to `AGENTS.md`, `PRODUCT.md`, or `DESIGN.md` rather than restating their contents.

### Requirement: CODE_OF_CONDUCT.md uses Contributor Covenant 2.1

The repository root SHALL contain a `CODE_OF_CONDUCT.md` with the full Contributor Covenant 2.1 text, including an enforcement contact placeholder clearly marked for maintainers to fill.

#### Scenario: Contributor reads conduct expectations

- **WHEN** a visitor opens `CODE_OF_CONDUCT.md`
- **THEN** they see the Contributor Covenant 2.1 text and a clearly marked enforcement contact (email or GitHub handle) for reporting violations.

### Requirement: SECURITY.md provides vulnerability reporting instructions

The repository root SHALL contain a `SECURITY.md` that states the supported version, instructs reporters to open a private GitHub Security Advisory (not a public issue), and lists what information to include in a report.

#### Scenario: Researcher reports a vulnerability

- **WHEN** a security researcher reads `SECURITY.md`
- **THEN** they find instructions to use GitHub's private vulnerability reporting, the expected response time window, and the information to include (affected version, reproduction steps, impact).

### Requirement: Issue templates guide bug and feature reports

`.github/ISSUE_TEMPLATE/` SHALL contain a `bug_report.yml` and a `feature_request.yml` issue form, plus a `config.yml` that disables blank issues and points contributors to the templates.

#### Scenario: Contributor opens a bug report

- **WHEN** a contributor clicks "New issue" and selects the bug report template
- **THEN** a structured form renders with required fields for a summary, steps to reproduce, expected behavior, and actual behavior, plus optional fields for environment and screenshots.

#### Scenario: Contributor opens a feature request

- **WHEN** a contributor selects the feature request template
- **THEN** a structured form renders with required fields for the problem being solved and the proposed solution, plus an optional field for alternatives considered.

#### Scenario: Blank issue creation is blocked

- **WHEN** a contributor attempts to open a blank issue without selecting a template
- **THEN** GitHub shows a message directing them to choose a template, because `config.yml` sets `blank_issues_enabled: false`.

### Requirement: Pull request template standardizes PR descriptions

`.github/PULL_REQUEST_TEMPLATE.md` SHALL render when a PR is opened, prompting the contributor for: a summary of changes, the related issue link, the type of change (bug fix / feature / docs / refactor), a checklist (tests added/updated, lint passes, `pnpm check` passes), and a notes section for reviewers.

#### Scenario: Contributor opens a pull request

- **WHEN** a contributor opens a new pull request
- **THEN** the PR body is pre-filled with the template sections: Summary, Related Issue, Type of Change, Checklist, and Reviewer Notes.

### Requirement: FUNDING.yml signals sponsorship readiness

`.github/FUNDING.yml` SHALL exist so the "Sponsor" button appears on the repository sidebar. It MAY contain placeholder or commented-out entries until the maintainers decide on a funding platform.

#### Scenario: Sponsor button appears with no active platform

- **WHEN** a visitor views the repository sidebar on GitHub
- **THEN** the "Sponsor" button is visible (because FUNDING.yml exists) but no platform link is active until configured by maintainers.

### Requirement: README serves as project landing and contributor entry point

`README.md` SHALL include: the project name and a one-line description, a badges row (license, build status placeholder, SvelteKit version), a "Getting started" section with install and dev commands, the existing commands table, the existing project structure section, a "Design system" section linking to `PRODUCT.md` and `DESIGN.md`, a "Contributing" section linking to `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`, and the existing "Agent setup" and "OpenSpec workflow" sections.

#### Scenario: First-time visitor scans the README

- **WHEN** a first-time visitor opens `README.md`
- **THEN** within the first screen they see the project description, a badges row, how to install and run it, and a link to the contributing guide.

#### Scenario: Contributor finds onboarding links

- **WHEN** a contributor wants to start contributing
- **THEN** the "Contributing" section links to `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md` so they can follow the full onboarding path without searching the file tree.
