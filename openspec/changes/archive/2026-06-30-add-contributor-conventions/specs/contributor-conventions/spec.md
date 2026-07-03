## ADDED Requirements

### Requirement: Branch naming convention is documented

CONTRIBUTING.md SHALL include a "Branch naming" section that specifies the format `type/short-description` where `type` is one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

#### Scenario: Contributor reads branch naming convention

- **WHEN** a contributor reads CONTRIBUTING.md
- **THEN** they find a "Branch naming" section with the format `type/short-description` and the list of valid types.

### Requirement: CODEOWNERS assigns maintainers for review

The repository root SHALL contain a `.github/CODEOWNERS` file that assigns `@pekanbaru-dev/core-team` and `@pekanbaru-dev/maintainer` as the default owners for all files in the repository.

#### Scenario: Pull request requests maintainer review

- **WHEN** a contributor opens a pull request
- **THEN** GitHub automatically requests review from the `@pekanbaru-dev/core-team` and `@pekanbaru-dev/maintainer` teams.

### Requirement: MAINTAINERS.md lists core team

The repository root SHALL contain a `MAINTAINERS.md` file that lists the core team members with their GitHub handles.

#### Scenario: Contributor identifies project maintainers

- **WHEN** a contributor opens `MAINTAINERS.md`
- **THEN** they see a list of core team members with their GitHub handles.

### Requirement: PR template includes branch naming reminder

`.github/PULL_REQUEST_TEMPLATE.md` SHALL include a checklist item reminding contributors to use the correct branch naming convention.

#### Scenario: Contributor opens a pull request

- **WHEN** a contributor opens a new pull request
- **THEN** the PR template includes a checklist item: "Branch name follows the `type/short-description` convention."
