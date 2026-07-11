# production-deploy

## Purpose

TBD — Production deploy path for the SvelteKit FE: `adapter-node` build, containerized Node app, Caddy reverse proxy with Let's Encrypt, deploy-time env template, and README runbook. Single-host / single-VPS target; no Kubernetes, no CDN, no staging.

## Requirements

### Requirement: SvelteKit is built for Node SSR

The project SHALL use `@sveltejs/adapter-node` (and SHALL NOT use `@sveltejs/adapter-auto`) so that `pnpm build` produces a runnable Node server in the `build/` directory. The `package.json` SHALL list `@sveltejs/adapter-node` as a dev dependency and SHALL NOT list `@sveltejs/adapter-auto` after this change. The `vite.config.ts` SHALL import `adapter-node` and pass it to the `sveltekit()` plugin.

#### Scenario: Build produces a runnable Node server

- **WHEN** a developer runs `pnpm build` on a clean clone
- **THEN** a `build/` directory exists containing `build/index.js` and `node build build` starts an HTTP server that serves the landing page

#### Scenario: Dev server is unaffected

- **WHEN** a developer runs `pnpm dev`
- **THEN** the dev server still starts on `http://localhost:5175` and the adapter swap does not change the dev-time behavior

### Requirement: Multi-stage Dockerfile produces a small runtime image

The repository SHALL contain a `Dockerfile` at the repo root with at least three stages. A shared `base` stage SHALL install pnpm and run `pnpm install --frozen-lockfile` to produce a fully-populated `node_modules` (including dev deps). A `build` stage SHALL extend `base`, run `pnpm build` to produce the Node bundle, and prune dev deps with `pnpm prune --prod`. A `runtime` stage SHALL be based on `node:22-alpine` (or another slim Node 22+ image), SHALL copy only `build/`, the SvelteKit output, and the production-only `node_modules` from the `build` stage, and SHALL default to `CMD ["node", "build"]`. A `dev` stage SHALL extend `base` and SHALL default to `CMD ["pnpm", "dev", "--host", "0.0.0.0"]`. The Dockerfile SHALL be the default target for production builds (i.e. `docker build .` produces the `runtime` image unless `--target dev` is passed). A `.dockerignore` SHALL be present at the repo root and SHALL exclude `node_modules`, `.svelte-kit`, `build`, `.env`, `.env.*` (except `.env.example`), `.git`, `.gitignore`, `openspec`, `.agents`, `.claude`, `.codex`, `.impeccable`, `.serena`, `playwright-report`, `test-results`, and `caddy_data`.

#### Scenario: Image builds from a clean context

- **WHEN** an operator runs `docker build -t pkuremote .`
- **THEN** the build completes without network access to anything other than the pnpm registry and the base images, and the final image is under 250 MB

#### Scenario: Runtime image does not include dev dependencies

- **WHEN** the runtime image is inspected
- **THEN** the image does not contain `vite`, `svelte-check`, `vitest`, or any other `devDependency` from `package.json`

#### Scenario: Container serves the landing page

- **WHEN** the built image is run with `docker run --rm -p 3000:3000 pkuremote`
- **THEN** an HTTP request to `http://localhost:3000` returns the landing page HTML with status 200

#### Scenario: The dev stage is selectable

- **WHEN** an operator runs `docker build --target dev -t pkuremote:dev .`
- **THEN** the build produces an image whose `CMD` is `["pnpm", "dev", "--host", "0.0.0.0"]` and whose `node_modules` includes `vite`

### Requirement: Caddyfile terminates HTTPS and reverse-proxies to the app

The repository SHALL contain a `Caddyfile` at the repo root. The Caddyfile SHALL define two site blocks:

- An HTTP listener on `:80` for the value of `{$SITE_DOMAIN}` (with a documented default) that issues a 301 redirect to `https://{host}{uri}`.
- An HTTPS listener on `:443` for the same host that requests a Let's Encrypt cert via the ACME HTTP-01 challenge, sets the `Strict-Transport-Security` header to `max-age=31536000; includeSubDomains; preload`, enables gzip, and reverse-proxies all requests to `http://app:3000`.

The Caddyfile SHALL use Caddy's `{$VAR}` placeholder syntax for the domain and the email, with the email read from `{$ACME_EMAIL}`.

#### Scenario: HTTP requests are redirected to HTTPS

- **WHEN** a request arrives at `http://$SITE_DOMAIN/` after the cert is provisioned
- **THEN** Caddy responds with a 301 redirect to `https://$SITE_DOMAIN/` and the response body is empty

#### Scenario: HTTPS responses set HSTS

- **WHEN** a request arrives at `https://$SITE_DOMAIN/`
- **THEN** the response includes the `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header

#### Scenario: HTTPS requests are reverse-proxied to the app

- **WHEN** a request arrives at `https://$SITE_DOMAIN/`
- **THEN** Caddy forwards it to `http://app:3000` on the internal Docker network and returns the app's response to the client

### Requirement: docker-compose.prod.yml runs app and caddy together

The repository SHALL contain a `docker-compose.prod.yml` at the repo root. It SHALL define **three** services: `app`, `postgres`, and `caddy` (the database is now in-stack — Supabase Cloud no longer provides it). The `app` service SHALL build from the repo's `Dockerfile`, SHALL listen only on the internal Docker network (no `ports:` block publishing the Node port to the host), SHALL set `HOST=127.0.0.1`, `PORT=3000`, SHALL receive `DATABASE_URL` pointing at the in-stack `postgres` service (e.g. `postgresql://…@postgres:5432/…`), SHALL receive the `OIDC_*` variables (`OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_REDIRECT_URI`) and `ADMIN_EMAILS`, and SHALL NOT reference any Supabase variable. The `app` service SHALL declare `depends_on` on `postgres` (healthcheck-aware form preferred). The `postgres` service SHALL use a pinned `postgres:16` (or newer) image, SHALL NOT publish a host port, SHALL set `POSTGRES_*` credentials from the host env, and SHALL mount a `postgres_data` named volume at `/var/lib/postgresql/data`. The `caddy` service SHALL use a pinned `caddy:2.x` image, SHALL publish ports `80` and `443`, SHALL mount the `Caddyfile` and the `caddy_data`/`caddy_config` named volumes, and SHALL receive `SITE_DOMAIN` and `ACME_EMAIL`. All services SHALL share a user-defined bridge network; `caddy` SHALL declare `depends_on: [app]`.

#### Scenario: Stack comes up with one command

- **WHEN** an operator with `SITE_DOMAIN`, `ACME_EMAIL`, `DATABASE_URL`, `OIDC_*`, and the `POSTGRES_*` credentials set in `.env` runs `docker compose -f docker-compose.prod.yml up -d --build`
- **THEN** the `app`, `postgres`, and `caddy` containers start; `postgres` and `app` are reachable only on the internal network; and `caddy` publishes ports 80 and 443 on the host

#### Scenario: App talks to the in-stack Postgres

- **WHEN** the stack is up and the app serves a request that queries the database
- **THEN** the query reaches the `postgres` service over the internal network via `DATABASE_URL` (host `postgres`, port 5432), with no external database dependency

#### Scenario: Neither app nor postgres is reachable from the host directly

- **WHEN** the stack is up and an operator runs `curl http://localhost:3000` or connects to `localhost:5432` from the host
- **THEN** the connection is refused (no host port is published for `app` or `postgres`)

### Requirement: Let's Encrypt certs survive container restarts

The `caddy_data` named volume SHALL persist the ACME account, the issued certificate, and the Caddy config cache across `docker compose` restarts. Destroying the `caddy_data` volume SHALL trigger a fresh registration on the next start.

#### Scenario: Cert is reused after a container restart

- **WHEN** an operator runs `docker compose -f docker-compose.prod.yml restart caddy` after a cert has been issued
- **THEN** Caddy does not contact Let's Encrypt on the next start and the existing cert is loaded from the `caddy_data` volume

#### Scenario: Destroying the volume forces a new registration

- **WHEN** an operator runs `docker compose -f docker-compose.prod.yml down` and then `docker volume rm <project>_caddy_data` and then `docker compose -f docker-compose.prod.yml up -d`
- **THEN** Caddy performs a new ACME registration with Let's Encrypt and the site is again reachable over HTTPS

### Requirement: `.env.example` documents the production deploy variables

The `.env.example` at the repo root SHALL include the production-only variables used by `docker-compose.prod.yml`, each with an inline comment. The entries SHALL include `SITE_DOMAIN` (default `pkuremote.example.com`), `ACME_EMAIL` (required for Let's Encrypt), `APP_PORT` (default `3000`, internal-only), the `POSTGRES_*` credentials for the in-stack database, a `DATABASE_URL` that points at the `postgres` service, and the `OIDC_*` variables. It SHALL NOT contain any Supabase variable or `DIRECT_URL`.

#### Scenario: A new operator can configure a deploy

- **WHEN** a new operator copies `.env.example` to `.env` on a server and fills in `SITE_DOMAIN`, `ACME_EMAIL`, the `POSTGRES_*`/`DATABASE_URL`, and the `OIDC_*` values
- **THEN** `docker compose -f docker-compose.prod.yml up -d --build` starts the three-service stack, `app` connects to `postgres`, and Caddy requests a cert for the configured domain

### Requirement: README documents the production deploy

The `README.md` SHALL contain a `Deploy` section that explains: (1) the DNS prerequisite (an A or AAAA record for `SITE_DOMAIN` pointing at the host's public IP), (2) the env vars to set (`SITE_DOMAIN`, `ACME_EMAIL`), (3) the one command to start the stack, (4) how to follow the cert issuance in the Caddy logs, and (5) how to roll back (`docker compose -f docker-compose.prod.yml down`).

#### Scenario: README explains the deploy

- **WHEN** a new operator reads the README's Deploy section
- **THEN** they can complete a first deploy without reading any other file

### Requirement: Production Postgres data survives restarts

The `postgres_data` named volume SHALL persist the database across `docker compose` restarts and redeploys, so an app image upgrade (pull + recreate) does not lose data. Destroying the `postgres_data` volume SHALL start from an empty database that `pnpm db:migrate` + `pnpm db:seed` can re-provision.

#### Scenario: Data survives an app redeploy

- **WHEN** an operator redeploys the `app` service (new image, `docker compose up -d`) without touching the `postgres` volume
- **THEN** the database rows written before the redeploy are still present after it

#### Scenario: Migrations run against the in-stack Postgres

- **WHEN** an operator runs the migration step against the running stack (`DATABASE_URL` → the `postgres` service)
- **THEN** every migration in `db/migrations/` applies to the in-stack database and the app can serve queries
