## Why

The repository has CONTRIBUTING.md with a commit convention section, but no documented branch naming convention and no CODEOWNERS file for automatic review assignment. Without these, contributors have inconsistent branch names and pull requests lack automatic reviewer routing.

## What Changes

- Add a branch naming convention to CONTRIBUTING.md (e.g., `type/short-description` matching conventional commits types)
- Add `.github/CODEOWNERS` file to automatically assign maintainers for review
- Add `MAINTAINERS.md` listing the core team members
- Update the PR template to reference the branch naming convention

## Capabilities

### New Capabilities
- `contributor-conventions`: Branch naming convention documented in CONTRIBUTING.md, CODEOWNERS file for automatic maintainer assignment, and PR template update to reference branch naming.

### Modified Capabilities
- `community-template`: CONTRIBUTING.md gets a new "Branch naming" section; PULL_REQUEST_TEMPLATE.md gets a branch naming reminder.

## Impact

- New files: `.github/CODEOWNERS`, `MAINTAINERS.md`
- Modified files: `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`
- No source code, build, or dependency changes
