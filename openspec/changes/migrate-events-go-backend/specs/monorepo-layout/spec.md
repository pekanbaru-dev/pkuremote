## ADDED Requirements

### Requirement: The repository is organized as `web/`, `api/`, and `proto/` at the root

The repository SHALL contain three top-level application directories: `web/` (the complete SvelteKit app — `src/`, `static/`, `package.json`, `vite.config.ts`, `svelte.config.js`, `playwright.config.ts`, `components.json`, `db/` legacy schema, and all web tooling configs), `api/` (the Go service — `go.mod`, `cmd/`, `internal/`, `migrations/`, `queries/`), and `proto/` (the buf-managed gRPC contracts). Orchestration and repo-wide files SHALL stay at the root: `docker-compose*.yml`, `Caddyfile`, `openspec/`, `docs/`, `CLAUDE.md`/`AGENTS.md`, `ARCHITECTURE.md`, `.github/`. There SHALL be no `apps/` nesting level.

#### Scenario: A contributor locates each application

- **WHEN** a contributor opens the repo root
- **THEN** all SvelteKit code is under `web/`, all Go code is under `api/`, all `.proto` contracts are under `proto/`, and no application source remains at the root

#### Scenario: Root stays orchestration-only

- **WHEN** the root directory listing is inspected
- **THEN** it contains compose files, CI, docs, and OpenSpec — no `package.json` app entry point and no `go.mod`

### Requirement: The restructure commit is mechanical and behavior-preserving

Moving the SvelteKit app into `web/` SHALL be an isolated commit (or minimal commit series) with no behavior change: every path-sensitive config (Dockerfile build context, `docker-compose*.yml` build contexts and volumes, `.github/workflows/*` working directories and paths, `components.json`, `playwright.config.ts`, `.impeccable/live/config.json`, MCP config files, `CLAUDE.md`/`AGENTS.md`/`ARCHITECTURE.md` path references) SHALL be updated in the same commit. The full verify suite MUST pass from the new layout before any Go code is introduced.

#### Scenario: Verify suite passes after the move

- **WHEN** the restructure commit is checked out and `pnpm check`, `pnpm lint`, and `pnpm test:unit -- --run` run from `web/`
- **THEN** all three pass with no source changes beyond path updates

#### Scenario: The Docker image still builds

- **WHEN** the web Docker image is built from the restructure commit
- **THEN** the build succeeds using the `web/` build context and produces a runnable image identical in behavior to the pre-move image

#### Scenario: No stale path references remain

- **WHEN** the repo is searched for references to the old root-level `src/`, `db/`, or `static/` paths in configs, workflows, and docs
- **THEN** no reference resolves to a now-nonexistent path

### Requirement: CI scopes work by path filters

The CI and deploy workflows SHALL use path filters so that changes touching only `web/**` do not build or deploy the api image, changes touching only `api/**` or `proto/**` do not build or deploy the web image, and changes touching `proto/**` run contract checks (`buf lint`, `buf breaking`) plus both apps' builds when generated code changes.

#### Scenario: A web-only change skips the api pipeline

- **WHEN** a commit modifies only files under `web/**`
- **THEN** CI runs the web checks and (on deploy branches) builds only the web image

#### Scenario: An api-only change skips the web pipeline

- **WHEN** a commit modifies only files under `api/**`
- **THEN** CI runs the Go checks and (on deploy branches) builds only the api image
