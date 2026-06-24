# Change: Add Caddy reverse proxy + Let's Encrypt for production, plus a Docker-based local dev workflow

## Why

The site has no production deploy path, and contributors who prefer Docker over installing Node locally have no way to run the FE without `pnpm`. The landing page is a SvelteKit app built with `@sveltejs/adapter-auto`, and the FE + Supabase architecture decision rules out a separate backend — so the only thing standing between `pnpm build` and a live URL is a TLS-terminating reverse proxy. Caddy gives us automatic Let's Encrypt certs, an HTTP→HTTPS redirect, and gzip out of the box, with a Caddyfile that is small enough to review in a PR. For local dev, the same Dockerfile runs `pnpm dev` with the source mounted as a bind volume, exposed directly on `localhost:5173` — no Caddy, no HTTPS, no port 80/443.

## What Changes

- Switch the SvelteKit adapter from `@sveltejs/adapter-auto` to `@sveltejs/adapter-node` so `pnpm build` produces a Node server.
- Replace the two-stage `Dockerfile` with a three-stage build: a `base` stage that installs all deps (used by both `dev` and `build`), a `build` stage that produces the prod Node bundle and prunes dev deps, and a slim `runtime` stage that runs `node build/`.
- Add a `Caddyfile` parameterized with `{$SITE_DOMAIN}` (default `pkuremote.example.com`) that reverse-proxies to the SvelteKit container, redirects HTTP→HTTPS, and requests a Let's Encrypt cert via the ACME HTTP-01 challenge.
- Add `docker-compose.yml` for local dev: a single `app` service that builds the `dev` stage, mounts the source as a bind volume for hot reload, and exposes `localhost:5173`. No Caddy, no HTTPS.
- Add `docker-compose.prod.yml` for production: two services, `app` (prod build) and `caddy` (HTTPS reverse proxy). The `caddy` service exposes 80 and 443 to the host; `app` is reachable only on the internal Docker network.
- Persist Caddy's certs and config cache to a named volume (`caddy_data`, `caddy_config`) so certs survive container restarts.
- Add deploy-time env vars to `.env.example`: `SITE_DOMAIN`, `ACME_EMAIL`, `APP_PORT` (internal).
- Add `Local dev` and `Deploy` sections to the README. The `Local dev` section documents the Docker path (`docker compose up`) as an alternative to `pnpm dev`; the `Deploy` section documents the one-time `docker compose -f docker-compose.prod.yml up -d` command.

**No backend, no queue, no separate origin** — Caddy sits in front of the SvelteKit container only in production. Supabase is reached over the public internet as before; nothing about the Supabase integration changes.

## Capabilities

### New Capabilities

- `production-deploy`: end-to-end production path for the SvelteKit site — `adapter-node` build, containerized Node app, Caddy reverse proxy with Let's Encrypt, deploy-time env template, and README runbook.
- `docker-dev-loop`: Docker-based local dev workflow — `docker compose up` brings up the FE on `localhost:5173` with hot reload, using the same `.env` as the pnpm workflow. No Caddy, no HTTPS, no prod certs.

### Modified Capabilities

None. `landing-page`, `shadcn-components`, and the archived `setup-supabase-drizzle` are unaffected at the spec level. (The Caddy container is independent of the Supabase integration; the dev compose is independent of the prod compose.)

## Impact

- **Adapter swap.** `package.json` swaps `@sveltejs/adapter-auto` for `@sveltejs/adapter-node` (dev dep). The adapter import in `vite.config.ts` changes from `adapter-auto` to `adapter-node`. The `pnpm build` output moves from platform-specific (Vercel/Netlify/etc.) to a Node bundle under `build/`.
- **New runtime dep:** none. Caddy runs in its own container, not in the SvelteKit process.
- **New dev deps:** none for this change. `docker compose` is the only new tooling requirement, and it is already a prerequisite of the archived `setup-supabase-drizzle` change.
- **New files:**
  - `Dockerfile` (3-stage: `base`, `build`, `dev`, `runtime`)
  - `Caddyfile`
  - `docker-compose.yml` (local dev)
  - `docker-compose.prod.yml` (production)
  - `.dockerignore`
- **Modified files:** `package.json` (adapter swap), `vite.config.ts` (adapter import), `.env.example` (Caddy/LE placeholders), `README.md` (local dev and deploy sections), `.gitignore` (add `caddy_data/` in case someone runs the stack without the named volume).
- **External services:** Let's Encrypt (free ACME). The first deploy must reach the public DNS for `SITE_DOMAIN`; the cert is stored on the host via the `caddy_data` Docker volume. Local dev does not need any external service.
- **Security:** Production Caddy enforces HSTS (`Strict-Transport-Security` header) on the HTTPS listener. The HTTP listener is a 301 redirect to the HTTPS host. The local dev compose binds to `127.0.0.1:5173` only.
- **Build / CI:** `pnpm check` and `pnpm lint` remain green; the Dockerfile is not run in CI by this change (a later change can add a `docker build` smoke test if desired).
