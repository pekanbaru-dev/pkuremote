# Local development setup

How to get the full app running on your machine and sign in — no cloud accounts,
no Supabase. Everything (database + login provider) runs locally in Docker.

For **admin-panel** specifics (the dev-login bypass) see
[`local-dev-admin.md`](local-dev-admin.md). For **production** see
[`DEPLOY.md`](../DEPLOY.md).

## What runs where

`docker compose` gives you three services:

| Service    | URL / port            | What it is                                                             |
| ---------- | --------------------- | ---------------------------------------------------------------------- |
| `app`      | http://localhost:5175 | Vite dev server (SvelteKit), hot reload                                |
| `postgres` | `localhost:5432`      | The app's own Postgres (mirrors prod)                                  |
| `dex`      | `localhost:5556`      | Dev-only [Dex](https://dexidp.io) OIDC provider — stands in for Google |

> **Why 5175 and not Vite's default 5173?** So this project can run alongside
> another local Vite app that holds 5173. The port is set in `vite.config.ts`.

**Dex is a faithful stand-in for Google.** The app talks to a generic OIDC
issuer, so the exact same login code runs locally and in production — only
`OIDC_ISSUER` differs (Dex in dev, `https://accounts.google.com` in prod).

## Prerequisites

- **Docker** + Compose v2
- **Node 22+** and **pnpm 9+** (for the recommended host-Node path)

## Recommended path — host-Node (real login works)

Run Postgres + Dex in Docker and the app on the host. This is the path where the
**real OIDC login works**, because the issuer `http://localhost:5556` resolves
identically from your browser and the app.

```sh
cp .env.example .env                 # committed defaults are dev-ready as-is
docker compose up -d postgres dex    # database + Dex
pnpm install
pnpm db:migrate                      # apply the schema
pnpm db:seed                         # sample events / announcements / posts
pnpm dev                             # → http://localhost:5175
```

Open http://localhost:5175 and you're running.

## Signing in

There are two ways in — pick per task.

### A. Real OIDC login via Dex (use this to exercise auth)

Leave `DEV_ADMIN_EMAIL` **unset** in `.env`, then:

1. Go to http://localhost:5175/login → **Continue with Google**.
2. You land on Dex's login form. Sign in with a test user:

| Email                      | Password   | Role                                         |
| -------------------------- | ---------- | -------------------------------------------- |
| `admin@pkubersua.local`    | `password` | **admin** — lands in `/admin`                |
| `attendee@pkubersua.local` | `password` | attendee — can book events, see `/myprofile` |

These users are defined in [`dex-config.yaml`](../dex-config.yaml). The admin
email is in the dev `ADMIN_EMAILS`, which is what grants `/admin` access.

On first sign-in the app provisions a `users` + `profiles` (+ `oauth_accounts`)
row automatically and issues a DB-backed session cookie.

### B. Dev-login bypass (fastest for UI work)

Skip OAuth entirely and be signed in as a chosen user. Set `DEV_ADMIN_EMAIL`
(and add it to `ADMIN_EMAILS`) in `.env`, run `pnpm db:seed-dev-admin` once, and
restart `pnpm dev`. Full detail in [`local-dev-admin.md`](local-dev-admin.md).

## Docker-only path (everything in a container)

```sh
docker compose up --build            # app + postgres + dex
# then, once up:
pnpm db:migrate && pnpm db:seed
```

Fine for general UI work — use the **dev-login bypass (B)** to reach `/admin`.
The **real Dex login (A) does _not_ work** with a containerized app, because
inside the container `localhost:5556` points at the app, not Dex. To drive real
OIDC from a containerized app you need the `dex:5556` + `/etc/hosts` topology in
[`local-dev-admin.md`](local-dev-admin.md). For real-login work, prefer the
host-Node path above.

## Everyday commands

| Command                  | What it does                                                     |
| ------------------------ | ---------------------------------------------------------------- |
| `pnpm dev`               | Dev server on http://localhost:5175                              |
| `pnpm check`             | Typecheck + Svelte diagnostics (run after `.svelte`/`.ts` edits) |
| `pnpm lint` / `format`   | Prettier + ESLint                                                |
| `pnpm test`              | Unit (Vitest) then e2e (Playwright)                              |
| `pnpm db:migrate`        | Apply migrations to the DB at `DATABASE_URL`                     |
| `pnpm db:seed`           | Idempotent sample data                                           |
| `pnpm db:seed-dev-admin` | Provision the dev-login bypass user                              |
| `pnpm db:studio`         | Drizzle Studio                                                   |

## Tear down

```sh
docker compose down        # stop containers, keep the DB
docker compose down -v     # also wipe the database volume (fresh slate)
```

Stop the host `pnpm dev` with `Ctrl-C`.

## Troubleshooting

### Port 5432 is already in use (another Postgres on your machine)

`docker compose up` fails with `Bind for 0.0.0.0:5432 failed: port is already
allocated`. Don't stop your other project — remap **this** project's Postgres to
a free host port with a **local-only** override. Create
`docker-compose.override.yml` (already git-ignored) at the repo root:

```yaml
services:
  postgres:
    # `!override` REPLACES the base ports list (compose otherwise appends,
    # which would still try to bind the conflicting 5432).
    ports: !override
      - 127.0.0.1:55432:5432
```

Then point host tooling at the new port — in `.env`:

```sh
DATABASE_URL=postgresql://pkuremote:pkuremote@localhost:55432/pkuremote
```

(The containerized app is unaffected — it reaches `postgres:5432` over the
compose network regardless.)

### Port 5175 is taken / the dev server jumps to 5176

Another Vite app is holding 5175. Vite will auto-bump, but then the OIDC
`redirect_uri` (fixed at `:5175`) won't match. Free 5175 first:

```sh
lsof -nP -iTCP:5175 -sTCP:LISTEN     # find the process
```

Stop that process (or run it on another port), then restart `pnpm dev`.

### Dex login says "Invalid Email Address and password"

Check `dex-config.yaml`: each `hash` must be a **valid 53-char bcrypt hash**
(the string after `$2a$10$` is 22 salt + 31 hash chars). Regenerate one for the
password `password` and normalize the prefix `$2y$` → `$2a$` (Go's bcrypt
doesn't accept `$2y$`):

```sh
htpasswd -bnBC 10 "" password | cut -d: -f2   # then replace $2y$ with $2a$
```

Dex uses in-memory storage, so **restart it after editing the config**:
`docker compose restart dex`.

### App 500s on the first request

Migrations haven't been applied to the local Postgres yet — run
`pnpm db:migrate` (and `pnpm db:seed`).

## Related docs

- [`README.md`](../README.md) — project overview + quickstart
- [`local-dev-admin.md`](local-dev-admin.md) — admin access + dev-login bypass detail
- [`.env.example`](../.env.example) — every environment variable, documented
- [`DEPLOY.md`](../DEPLOY.md) — production deployment
