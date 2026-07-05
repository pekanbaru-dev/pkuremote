## MODIFIED Requirements

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

### Requirement: `.env.example` documents the production deploy variables

The `.env.example` at the repo root SHALL include the production-only variables used by `docker-compose.prod.yml`, each with an inline comment. The entries SHALL include `SITE_DOMAIN` (default `pkuremote.example.com`), `ACME_EMAIL` (required for Let's Encrypt), `APP_PORT` (default `3000`, internal-only), the `POSTGRES_*` credentials for the in-stack database, a `DATABASE_URL` that points at the `postgres` service, and the `OIDC_*` variables. It SHALL NOT contain any Supabase variable or `DIRECT_URL`.

#### Scenario: A new operator can configure a deploy

- **WHEN** a new operator copies `.env.example` to `.env` on a server and fills in `SITE_DOMAIN`, `ACME_EMAIL`, the `POSTGRES_*`/`DATABASE_URL`, and the `OIDC_*` values
- **THEN** `docker compose -f docker-compose.prod.yml up -d --build` starts the three-service stack, `app` connects to `postgres`, and Caddy requests a cert for the configured domain

## ADDED Requirements

### Requirement: Production Postgres data survives restarts

The `postgres_data` named volume SHALL persist the database across `docker compose` restarts and redeploys, so an app image upgrade (pull + recreate) does not lose data. Destroying the `postgres_data` volume SHALL start from an empty database that `pnpm db:migrate` + `pnpm db:seed` can re-provision.

#### Scenario: Data survives an app redeploy

- **WHEN** an operator redeploys the `app` service (new image, `docker compose up -d`) without touching the `postgres` volume
- **THEN** the database rows written before the redeploy are still present after it

#### Scenario: Migrations run against the in-stack Postgres

- **WHEN** an operator runs the migration step against the running stack (`DATABASE_URL` → the `postgres` service)
- **THEN** every migration in `db/migrations/` applies to the in-stack database and the app can serve queries
