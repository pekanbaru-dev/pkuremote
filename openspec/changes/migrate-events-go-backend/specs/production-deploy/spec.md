## MODIFIED Requirements

### Requirement: docker-compose.prod.yml runs app and caddy together

The repository SHALL contain a `docker-compose.prod.yml` at the repo root defining **four** services: `app` (the SvelteKit BFF), `api` (the Go service), `postgres`, and `caddy`. The `app` service SHALL build from `web/` (context `web/`), listen only on the internal network, and receive `DATABASE_URL` (legacy auth queries), the `OIDC_*` variables, `API_URL` (→ the `api` service), and `INTERNAL_TOKEN`; it SHALL NOT receive `ADMIN_EMAILS`. The `api` service SHALL build from `api/`, listen only on the internal network (no published ports, not proxied by Caddy), apply goose migrations before serving, expose a healthcheck on `/healthz`, and receive `DATABASE_URL`, `ADMIN_EMAILS`, `INTERNAL_TOKEN`, and `UPLOAD_DIR` with the `uploads_data` volume mounted. The `postgres` service SHALL use a pinned `postgres:16` (or newer) image, publish no host port, and mount the `postgres_data` volume. The `caddy` service SHALL publish `80`/`443` and proxy only to `app`. `app` SHALL declare `depends_on` on `api` and `postgres` (healthcheck-aware form); `api` SHALL declare `depends_on` on `postgres`. All services SHALL share the internal network.

#### Scenario: Stack comes up with one command

- **WHEN** an operator with the documented variables set runs the compose deploy
- **THEN** `postgres` starts, `api` migrates and becomes healthy, `app` starts against the healthy api, and `caddy` publishes 80/443 proxying to `app` only

#### Scenario: The api is never publicly reachable

- **WHEN** the stack is up and a client on the internet or host attempts to reach the api service directly (any port) or via a Caddy route
- **THEN** the connection fails — the api has no published port and no Caddy route

#### Scenario: App talks to the in-stack services

- **WHEN** the app serves a request needing event data and session data
- **THEN** event data comes from the `api` service over the internal network (`API_URL`) and session resolution queries `postgres` directly via `DATABASE_URL`

### Requirement: `.env.example` documents the production deploy variables

The `.env.example` at the repo root SHALL include the production deploy variables, each with an inline comment: `SITE_DOMAIN`, `ACME_EMAIL`, the `POSTGRES_*` credentials, `DATABASE_URL` (consumed by both `app` and `api`), the `OIDC_*` variables (app), `ADMIN_EMAILS` (api only), `API_URL` (app → api internal address), `INTERNAL_TOKEN` (shared secret between app and api, required in production), and `UPLOAD_DIR` (api). It SHALL NOT contain any Supabase variable or `DIRECT_URL`.

#### Scenario: A new operator can configure a deploy

- **WHEN** a new operator copies `.env.example` to `.env` on a server and fills in the documented values including `INTERNAL_TOKEN`
- **THEN** the compose deploy starts the four-service stack with the app authenticating to the api via the shared token

## ADDED Requirements

### Requirement: Deploys build and ship two images

The deploy pipeline SHALL build and push two GHCR images — `pkuremote-web` (from `web/`) and `pkuremote-api` (from `api/`) — tagged consistently per release (`sha-<short>` and a moving branch tag), and the server-side compose SHALL pull both by tag. Path filters SHALL skip rebuilding an image whose sources did not change, in which case the previous tag of that image remains deployed. The existing approval gate and rollback mechanism (redeploy a previous tag via `workflow_dispatch`) SHALL cover both images; rolling back either image alone MUST be safe because this change makes no schema modifications.

#### Scenario: A release ships both images

- **WHEN** a commit touching `web/**` and `api/**` merges to the deploy branch and the gate is approved
- **THEN** both images are built, pushed with the same release tag, and the stack is recreated with both

#### Scenario: A one-sided change ships one image

- **WHEN** a merged commit touches only `web/**`
- **THEN** only the web image is rebuilt and redeployed; the api container keeps running its current image

#### Scenario: Rollback restores a previous release

- **WHEN** an operator triggers the rollback workflow with a previous tag
- **THEN** the stack recreates with that tag's image(s) and serves correctly, since no deploy in this change alters the database schema
