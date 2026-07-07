# PKU Remote

The public site for the Pekanbaru remote-worker community — a quiet, editorial bulletin for events, announcements, and blog posts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Build status](https://img.shields.io/badge/build-passing-brightgreen)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5-ff3e00)

## Local development

> **New to the project?** [`docs/local-dev.md`](docs/local-dev.md) is the
> step-by-step setup guide — spin up the local stack (app + Postgres + Dex), sign
> in with the test users, and troubleshoot common port conflicts. The sections
> below are the condensed version.

### Quickstart (Docker — recommended)

The fastest path. No local Node required, hot reload works. Brings up the app,
an in-stack Postgres, and a dev-only Dex OIDC provider.

```sh
cp .env.example .env          # defaults work out of the box for local dev
docker compose up --build     # app :5175, postgres :5432, dex :5556
pnpm db:migrate               # apply the schema to the composed Postgres
pnpm db:seed                  # insert one row per content table
# open http://localhost:5175
```

Stop with `Ctrl-C` or `docker compose down`. For `/admin` work, set
`DEV_ADMIN_EMAIL` (see [Signing in locally](#1a-signing-in-locally)).

### Quickstart (host Node — fastest iteration, and best for OIDC work)

```sh
cp .env.example .env
docker compose up -d postgres dex   # just the db + Dex; app runs on the host
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev                            # Vite on http://localhost:5175
```

### Full walkthrough

Prerequisites: **Node 22+** (for the host-Node path), **Docker** (for both
paths), **pnpm 9+**. No external accounts — the database and the OIDC provider
both run locally in Docker.

### 1. The local dev stack

`docker compose up` brings up three services (no Supabase, no cloud accounts):

- **`postgres`** — the app's own Postgres, published on `localhost:5432`.
- **`dex`** — a dev-only [Dex](https://dexidp.io) OIDC provider on
  `localhost:5556`, a faithful offline stand-in for Google (the app's auth code
  path is identical; only `OIDC_ISSUER` differs between dev and prod).
- **`app`** — Vite's dev server on `localhost:5175`, bind-mounted for HMR.

For OIDC work, the **host-Node path is recommended** (run `pnpm dev` on the host
against the composed `postgres`/`dex`), because the issuer `http://localhost:5556`
then resolves identically from the browser and the app. See
[`docs/local-dev-admin.md`](docs/local-dev-admin.md) for the containerized-app topology.

### 1a. Signing in locally

Two ways to authenticate — full detail in [`docs/local-dev-admin.md`](docs/local-dev-admin.md):

- **Dev-login bypass (fastest)** — set `DEV_ADMIN_EMAIL` (and add the same email
  to `ADMIN_EMAILS`) in `.env`; `pnpm dev` then signs you in as that user with
  no OAuth. Best for day-to-day admin work. Run `pnpm db:seed-dev-admin` once so
  booking / `/myprofile` work too.
- **Real OIDC via Dex** — leave `DEV_ADMIN_EMAIL` unset and sign in through the
  Dex login form (test users `admin@pkubersua.local` / `attendee@pkubersua.local`,
  password `password`). Exercises the real Arctic + session machinery.

### 2. Configure environment

```sh
cp .env.example .env
```

The committed defaults in `.env.example` work as-is for the local Docker stack.
The variables the FE and the Drizzle scripts need are:

- `DATABASE_URL` — a single direct connection to the app's Postgres. Local
  default: `postgresql://pkuremote:pkuremote@localhost:5432/pkuremote` (used by
  `pnpm db:migrate`/`db:seed` and host-run `pnpm dev`; the containerized app
  reaches `postgres:5432` on its own).
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — credentials for the
  in-stack `postgres` service.
- `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` / `OIDC_REDIRECT_URI` —
  the OIDC provider. Local defaults point at Dex; in prod they point at Google.
- `ADMIN_EMAILS` — comma-separated admin allow-list (`/admin` access).
- `DEV_ADMIN_EMAIL` — optional dev-login bypass (see above).

> `.env` is git-ignored — never commit real secrets. There is **no** Supabase
> URL/anon/service-role key and **no** `DIRECT_URL` — the app owns its Postgres
> and its auth.

### 3. What the commands do

The Quickstart above is the minimum to get the dev server running. For reference:

- `cp .env.example .env` — copies the env template; the defaults work for local dev.
- `docker compose up` — starts `app` + `postgres` + `dex`; the repo is bind-mounted so edits trigger HMR.
- `pnpm install` — installs Node deps on the host. Not needed if you only use the Docker path.
- `pnpm db:migrate` — applies the SQL in `db/migrations/` to the Postgres at `DATABASE_URL`. Idempotent.
- `pnpm db:seed` — inserts one row into each of `users`/`profiles`, `events`, `announcements`, `posts` so the FE and Drizzle Studio have something to show. Re-runnable, never duplicates.
- `pnpm dev` — Vite's dev server on `http://localhost:5175` with hot reload (host Node).

Open `http://localhost:5175` once a dev server is up. Run `pnpm db:studio` in another terminal for Drizzle Studio.

### Useful commands

| Command                  | What it does                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `pnpm dev`               | Dev server on `http://localhost:5175` (host Node)                                         |
| `docker compose up`      | Dev server + Postgres + Dex (everything in Docker)                                        |
| `pnpm db:generate`       | Generate a new migration after editing `db/schema/`                                       |
| `pnpm db:migrate`        | Apply pending migrations to the Postgres at `DATABASE_URL`                                |
| `pnpm db:push`           | Push schema changes directly (prototyping only — does not create a migration)             |
| `pnpm db:studio`         | Open Drizzle Studio against the configured Postgres                                       |
| `pnpm db:seed`           | Idempotently insert dev data                                                              |
| `pnpm db:seed-dev-admin` | Provision the dev-login admin user ([`docs/local-dev-admin.md`](docs/local-dev-admin.md)) |

## Commands

| Command            | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `pnpm dev`         | Dev server on `http://localhost:5175`                                  |
| `pnpm build`       | Production build (SvelteKit + Vite)                                    |
| `pnpm check`       | `svelte-kit sync` then `svelte-check` (typecheck + Svelte diagnostics) |
| `pnpm lint`        | `prettier --check . && eslint .`                                       |
| `pnpm format`      | `prettier --write .`                                                   |
| `pnpm test:unit`   | Vitest (unit + component). Add `-- --run` for a single run.            |
| `pnpm test:e2e`    | Playwright (installs browsers first)                                   |
| `pnpm test`        | Unit then e2e, in that order                                           |
| `pnpm db:generate` | Generate a new Drizzle migration from `db/schema/`                     |
| `pnpm db:migrate`  | Apply pending migrations to the Postgres at `DATABASE_URL`             |
| `pnpm db:push`     | Push schema directly to the DB (no migration file)                     |
| `pnpm db:studio`   | Open Drizzle Studio                                                    |
| `pnpm db:seed`     | Insert dev data (idempotent)                                           |

Verify after edits: `pnpm check` → `pnpm lint` → `pnpm test`.

## Deploy (production)

Production is a tag-triggered GHCR image deployed by GitHub Actions onto a VPS,
where it runs as a three-service stack — the SvelteKit Node build (`app`), an
in-stack `postgres`, and a shared Caddy reverse proxy (managed by the
[`caddyku`](https://github.com/jufianto/caddyku) CLI) that terminates HTTPS with
automatic Let's Encrypt certs. Auth is the app's own OIDC flow (Arctic +
DB-backed sessions) against Google — there is no Supabase.

**See [`DEPLOY.md`](DEPLOY.md) for the full runbook**: one-time server setup
(Docker, firewall, `caddyku`, the Google OAuth client, the server `.env`), the
GitHub `production` Environment + secrets, and the release / rollback flow
(`git tag v1.2.0 && git push origin v1.2.0`). Database migrations are applied
manually over an SSH tunnel (also in `DEPLOY.md`), not by the deploy.

## Project structure

```
src/
├── app.html              # HTML shell (Google Fonts preconnect + stylesheet)
├── lib/
│   ├── components/ui/    # shadcn-svelte primitives (button, separator, navigation-menu)
│   ├── server/db/        # Drizzle client (server-only)
│   └── utils.ts          # cn() + WithElementRef types (shadcn utility)
└── routes/
    ├── +layout.svelte    # Imports layout.css, renders favicon
    ├── +page.svelte      # Landing page (header, hero, event, announcements, posts, about, footer)
    └── layout.css        # Tailwind v4 @theme tokens + base + component classes
db/
├── schema/               # Drizzle table definitions (users, oauth_accounts, sessions, profiles, …)
├── migrations/           # Generated SQL migrations (committed)
├── seed.ts               # Idempotent dev-data seeder
└── seed-dev-admin.ts     # Provision the dev-login bypass user (docs/local-dev-admin.md)

# Container / deploy
Dockerfile                # multi-stage: base / build / dev / runtime
docker-compose.yml        # local dev: app + postgres + dex (OIDC) on :5175/:5432/:5556
docker-compose.deploy.yml # production: app + postgres, joins the shared caddy-proxy (see DEPLOY.md)
dex-config.yaml           # dev-only Dex OIDC provider config
.dockerignore             # keep the build context small
```

**[ARCHITECTURE.md](./ARCHITECTURE.md)** — how `src/lib/` is organized (components vs features vs server), dependency rules, and the recipe for adding a new feature.

## Design system

- **PRODUCT.md** — register, users, purpose, brand personality, anti-references.
- **DESIGN.md** — the "Quiet Bulletin" visual spec: OKLCH palette, Spectral (display) + Source Sans 3 (body) typography, flat-by-default elevation, the One Voice Rule (ochre accent ≤10% of any screen).

Read both before any UI work.

## Contributing

We welcome contributions. Please read:

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, code style, commit convention, PR process
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community standards
- [SECURITY.md](SECURITY.md) — vulnerability reporting

## Tooling

### rtk (token-optimized CLI proxy)

[rtk](https://github.com/cyber-rico/rtk) is a CLI proxy that filters and summarizes command output before it reaches AI agents, saving 60–90% of tokens on common commands. It is optional for humans but recommended when using AI coding agents in this repo.

Install:

```sh
brew install rtk   # or see https://github.com/cyber-rico/rtk
```

Then prefix shell commands with `rtk`:

```sh
rtk git status
rtk pnpm install
rtk pnpm check
```

Meta commands (use bare): `rtk gain` (token savings analytics), `rtk discover` (find what rtk can optimize), `rtk proxy <cmd>` (run raw command without filtering).

## Agent setup (optional)

This repo is configured for AI coding agents (OpenCode, Claude Code, Codex). Three MCP servers are wired up:

- **serena** — symbolic code navigation and editing
- **codebase-memory-mcp** — code graph queries
- **context7** — up-to-date library docs

Install `serena` and `codebase-memory-mcp` on `PATH`:

```sh
pipx install serena
pipx install codebase-memory-mcp
```

`context7` runs via `npx` (no install needed). MCP config files live at `opencode.json`, `.agents/mcp.json`, `.claude/.mcp.json`, and `.codex/config.toml`. See `AGENTS.md` for usage rules.

## OpenSpec workflow

Changes are proposed, implemented, and archived via OpenSpec. The OpenSpec CLI must be installed globally (see [CONTRIBUTING.md](CONTRIBUTING.md) for install steps); in agent sessions, trigger the OpenSpec skills by name:

- `openspec-propose` — scaffold a new change (proposal, design, specs, tasks) from a short description.
- `openspec-explore` — think through an idea or investigate a problem before or during a change.
- `openspec-apply-change` — implement tasks from an existing change.
- `openspec-sync-specs` — sync delta specs into canonical specs without archiving.
- `openspec-archive-change` — finalize and archive a completed change.

Then use it to manage changes:

```sh
openspec new change "<name>"          # scaffold a change
openspec status --change "<name>"    # check artifact status
```

Active changes live at `openspec/changes/<name>/`; archived changes at `openspec/changes/archive/YYYY-MM-DD-<name>/`; canonical specs at `openspec/specs/<capability>/spec.md`.
