## Context

The repository already has CONTRIBUTING.md with a commit convention section and a PR template. The community template change (just archived) added these but did not include branch naming or CODEOWNERS. This change adds those two missing pieces.

Existing constraints:

- Branch naming should follow the same type prefixes as conventional commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`)
- CODEOWNERS should point to the Pekanbaru Dev GitHub organization team or individual maintainers
- The PR template should remind contributors to use the correct branch naming

## Goals / Non-Goals

**Goals:**

- Document a branch naming convention in CONTRIBUTING.md
- Add `.github/CODEOWNERS` for automatic review assignment
- Add `MAINTAINERS.md` listing the core team
- Update PR template with a branch naming reminder

**Non-Goals:**

- Setting up branch protection rules or CI enforcement
- Changing the commit convention (already documented)
- Adding any source code or build configuration

## Decisions

### Decision: Branch naming format `type/short-description`

**Choice:** Use `type/short-description` where `type` matches conventional commit types (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`).

**Rationale:** Matches the existing commit convention, is widely understood, and keeps branch names predictable. The slash separator is standard in Git and GitHub.

**Alternatives considered:**

- `type/issue-number/short-description` — adds noise; issue numbers can go in the PR body
- No convention at all — leads to inconsistent branch names

### Decision: MAINTAINERS.md lists core team members

**Choice:** Add `MAINTAINERS.md` at the repo root with a list of core team members (GitHub handles).

**Rationale:** Contributors can see who runs the project. The file is a common open-source convention and complements CODEOWNERS by providing human-readable attribution.

**Alternatives considered:**

- Only CODEOWNERS — technical routing works but lacks transparency
- No maintainer listing — contributors have no way to know who the core team is

### Decision: CODEOWNERS with `@pekanbaru-dev/core-team` and `@pekanbaru-dev/maintainer` teams

**Choice:** Use the existing GitHub teams `@pekanbaru-dev/core-team` and `@pekanbaru-dev/maintainer` as default owners for all files.

**Rationale:** Both teams already exist in the organization. Teams scale better than individual usernames and can be managed in GitHub without editing the file.

**Alternatives considered:**

- Individual usernames — fragile, requires file edit when maintainers change
- No CODEOWNERS — no automatic review assignment
- [Branch convention is advisory, not enforced] → Contributors may ignore it. Mitigation: the PR template reminder catches non-conforming branches at PR time.
