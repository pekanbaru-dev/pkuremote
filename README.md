# PKU Remote

The public site for the Pekanbaru remote-worker community — a quiet, editorial bulletin for events, announcements, and blog posts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Build status](https://img.shields.io/badge/build-passing-brightgreen)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5-ff3e00)

## Local development

### Quickstart (Docker — recommended)

The fastest path. No local Node required, hot reload works.

```sh
cp .env.example .env          # fill in the Supabase project values (see step 2)
pnpm db:migrate               # apply the initial schema
pnpm db:seed                  # insert one row per content table
docker compose up --build     # start Vite on http://localhost:5173
```

Stop with `Ctrl-C` or `docker compose down`.

### Quickstart (host Node — fastest iteration)

```sh
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev                      # Vite on http://localhost:5173
```

### Full walkthrough

Prerequisites: **Node 22+** (for the host-Node path), **Docker** (for the Docker path), **pnpm 9+**, and a free [Supabase Cloud](https://supabase.com) account.

### 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project (free tier is fine).
2. Wait for the project to finish provisioning (~2 minutes).
3. From the dashboard, copy:
   - **Project URL** and **anon key** and **service_role key** from `Project Settings → API`.
   - **Connection string (Transaction pooler)** and **Direct connection** from `Project Settings → Database` (use the URI format).

> Free-tier projects pause after 7 days of inactivity. Unpause from the dashboard; the data is preserved.

### 1a. Enable the Google sign-in provider

The Supabase side is one toggle. The reason it's not "just a switch" is that Google requires **you** to register an OAuth client (Supabase can't share a generic one). Two prep steps in Google Cloud, one toggle in Supabase, one allow-list entry.

**In Google Cloud Console** — [console.cloud.google.com](https://console.cloud.google.com/):

1. **APIs & Services → OAuth consent screen** → External → fill in app name + support email → save.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → **Web application** → under **Authorized redirect URIs** add:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Save and copy the **Client ID** and **Client secret**.

**In Supabase** — [supabase.com/dashboard](https://supabase.com/dashboard):

3. **Authentication → Providers → Google** → toggle on → paste the Client ID and Client secret → save. The Supabase callback URL shown on this page must match step 2 byte-for-byte.
4. **Authentication → URL Configuration** → add `http://localhost:5173/auth/callback` (dev) and your prod origin + `/auth/callback` (e.g. `https://example.com/auth/callback`) to the redirect allow-list. Supabase validates the **full** `redirectTo` URL — including the `/auth/callback` path — against this list, so a bare-origin entry like `http://localhost:5173` is not enough and the OAuth round-trip will be rejected. (`/login` builds the `redirectTo` as `<origin>/auth/callback?next=<safe-target>`.)

That's it. A `profiles` row is created automatically the first time a Google identity signs in, by the `handle_new_user` trigger in `db/migrations/0001_*.sql`.

### 2. Configure environment

```sh
cp .env.example .env
```

Open `.env` and fill in the values you copied. The five variables the FE and the Drizzle scripts need are:

- `PUBLIC_SUPABASE_URL` — Project URL
- `PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (server-only; never expose to the browser)
- `DATABASE_URL` — Transaction pooler (port 6543, used at runtime)
- `DIRECT_URL` — Direct connection (port 5432, used for migrations and seed)

> The keys in `.env.example` are placeholders. The values you put in `.env` MUST NOT be committed — `.env` is git-ignored. **Dev-only keys must be replaced before any production deploy.**
>
> The same `.env` shape works for dev (a free-tier project) and prod (a paid project); only the URL and the keys change between environments. No code change is required.

### 3. What the commands do

The Quickstart above is the minimum to get the dev server running. For reference:

- `cp .env.example .env` — copies the env template. You only need the Supabase values; the production deploy vars (`SITE_DOMAIN`, `ACME_EMAIL`, `APP_PORT`) are ignored locally.
- `pnpm install` — installs Node deps on the host. Not needed if you only use the Docker path.
- `pnpm db:migrate` — applies the SQL in `db/migrations/` to your Supabase project. Idempotent.
- `pnpm db:seed` — inserts one row into each of `profiles`, `events`, `announcements`, `posts` so the FE and Drizzle Studio have something to show. Re-runnable, never duplicates.
- `pnpm dev` — Vite's dev server on `http://localhost:5173` with hot reload (host Node).
- `docker compose up --build` — same dev server, but everything in a container; the repo is bind-mounted so edits trigger HMR.

Open `http://localhost:5173` once any of the dev-server options is up. Run `pnpm db:studio` in another terminal for Drizzle Studio.

### Useful commands

| Command             | What it does                                                                  |
| ------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`          | Dev server on `http://localhost:5173` (host Node)                             |
| `docker compose up` | Dev server on `http://localhost:5173` (everything in Docker)                  |
| `pnpm db:generate`  | Generate a new migration after editing `db/schema/`                           |
| `pnpm db:migrate`   | Apply pending migrations to the configured Supabase project                   |
| `pnpm db:push`      | Push schema changes directly (prototyping only — does not create a migration) |
| `pnpm db:studio`    | Open Drizzle Studio against the configured Supabase project                   |
| `pnpm db:seed`      | Idempotently insert dev data                                                  |

## Commands

| Command            | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `pnpm dev`         | Dev server on `http://localhost:5173`                                  |
| `pnpm build`       | Production build (SvelteKit + Vite)                                    |
| `pnpm check`       | `svelte-kit sync` then `svelte-check` (typecheck + Svelte diagnostics) |
| `pnpm lint`        | `prettier --check . && eslint .`                                       |
| `pnpm format`      | `prettier --write .`                                                   |
| `pnpm test:unit`   | Vitest (unit + component). Add `-- --run` for a single run.            |
| `pnpm test:e2e`    | Playwright (installs browsers first)                                   |
| `pnpm test`        | Unit then e2e, in that order                                           |
| `pnpm db:generate` | Generate a new Drizzle migration from `db/schema/`                     |
| `pnpm db:migrate`  | Apply pending migrations to Supabase                                   |
| `pnpm db:push`     | Push schema directly to Supabase (no migration file)                   |
| `pnpm db:studio`   | Open Drizzle Studio                                                    |
| `pnpm db:seed`     | Insert dev data (idempotent)                                           |

Verify after edits: `pnpm check` → `pnpm lint` → `pnpm test`.

## Deploy (production)

Production is a two-container stack: the SvelteKit Node build (`app`) fronted by Caddy (`caddy`) for HTTPS with automatic Let's Encrypt certs. The `app` container is reachable only on the internal Docker network; the `caddy` container publishes ports `80` and `443` to the host.

### 1. Prerequisites

- A VPS running Linux with Docker + Docker Compose v2.
- DNS: an **A** (or **AAAA**) record for `$SITE_DOMAIN` pointing at the host's public IP. **This must be in place before the first deploy**, otherwise Caddy will retry and fail to obtain a cert. Verify with `dig +short $SITE_DOMAIN`.
- A Supabase Cloud project (paid tier for prod, or a separate free-tier project to isolate dev data).
- The host's public IP allowed through the cloud firewall on TCP `80` and `443`.

### 2. Configure environment

On the server:

```sh
cp .env.example .env
```

Edit `.env` and set the production values:

- `SITE_DOMAIN` — the FQDN the site serves (must match the DNS record).
- `ACME_EMAIL` — contact email for the Let's Encrypt account (uncomment the line).
- `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` — from the production Supabase project's API Settings.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL` — from the production project.

> The keys in `.env` are dev-only for a free-tier project. **The values in this server-side `.env` MUST be the production project's values**, not the dev project's.

### 3. Start the stack

```sh
docker compose -f docker-compose.prod.yml up -d --build
```

Watch the cert issuance:

```sh
docker compose -f docker-compose.prod.yml logs -f caddy
```

The first start takes ~30 seconds while Caddy talks to Let's Encrypt. When you see `certificate obtained successfully`, the site is live at `https://$SITE_DOMAIN`.

### 4. Roll back

```sh
docker compose -f docker-compose.prod.yml down
```

The `caddy_data` and `caddy_config` named volumes persist by default; destroy them only if you want a clean slate (this forces a fresh Let's Encrypt registration on the next start).

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
├── schema/               # Drizzle table definitions (Postgres)
├── migrations/           # Generated SQL migrations (committed)
└── seed.ts               # Idempotent dev-data seeder

# Container / deploy
Dockerfile                # multi-stage: base / build / dev / runtime
docker-compose.yml        # local dev: Vite on :5173
docker-compose.prod.yml   # production: app + caddy (HTTPS, Let's Encrypt)
Caddyfile                 # Caddy v2 config (HTTP→HTTPS, HSTS, reverse proxy)
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
