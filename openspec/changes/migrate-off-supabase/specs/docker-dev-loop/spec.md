## MODIFIED Requirements

### Requirement: `docker-compose.yml` runs the FE on `localhost:5173` with hot reload

The repository SHALL contain a `docker-compose.yml` at the repo root that brings up the SvelteKit FE for local development with a single `docker compose up`. The compose file SHALL define an `app` service that builds the `dev` target of the repo's `Dockerfile`, bind-mounts the current directory into `/app` (with `node_modules`/`.svelte-kit` overridden by anonymous volumes), and exposes port `5173` on `127.0.0.1`. It SHALL also define a `postgres` service (in-stack database for dev, mirroring prod) and a **dev-only** `dex` service (see the `local-oidc-dev` capability) publishing `5556` on `127.0.0.1`. The `app` service SHALL receive `DATABASE_URL` (→ the `postgres` service) and the `OIDC_*` variables from the host `.env`, and SHALL NOT reference any Supabase variable. The compose file SHALL NOT include a Caddy service and SHALL NOT publish any port other than `5173` and `5556`.

#### Scenario: A contributor can run the FE in Docker with one command

- **WHEN** a contributor with Docker installed runs `docker compose up` from the repo root
- **THEN** the `app`, `postgres`, and `dex` containers start, Vite binds to `0.0.0.0:5173` inside the app container, and `http://localhost:5173` serves the landing page

#### Scenario: Source edits trigger hot reload

- **WHEN** a contributor edits a `.svelte` or `.ts` file under the repo root while the stack is up
- **THEN** Vite's HMR picks up the change and the browser refreshes without restarting the container

#### Scenario: No Supabase variables are required

- **WHEN** the dev stack starts
- **THEN** it needs no `SUPABASE_*` values; the app reads `DATABASE_URL` (→ `postgres`) and `OIDC_*` (→ `dex`)

## ADDED Requirements

### Requirement: The dev OIDC issuer address resolves identically from browser and app

Because id_token verification asserts the `iss` claim matches `OIDC_ISSUER`, the issuer URL MUST resolve to the same Dex instance from both the browser (on the host) and the app (wherever it runs). The dev-loop SHALL support two topologies, and the chosen `OIDC_ISSUER` SHALL be documented in `.env.example`/`LOCAL_DEV_ADMIN.md`:

1. **Host app (recommended for OIDC work):** the app runs on the host via `pnpm dev`; `OIDC_ISSUER=http://localhost:5556`. Both the browser and the host-run app reach Dex at `localhost:5556`.
2. **Containerized app:** the app runs inside compose. A single issuer value MUST resolve from both sides — e.g. the operator maps `127.0.0.1 dex` in the host's `/etc/hosts` and sets `OIDC_ISSUER=http://dex:5556` (Dex published on the host as `5556`), so the browser resolves `dex` via `/etc/hosts` and the app container resolves `dex` via the compose network. `OIDC_ISSUER=http://localhost:5556` MUST NOT be used with a containerized app, because inside the container `localhost` points at the app, not Dex.

For everyday non-auth UI work, the containerized dev-loop MAY rely on the `DEV_ADMIN_EMAIL` bypass and skip Dex entirely.

#### Scenario: Host-run app completes OIDC against Dex

- **WHEN** the app runs via `pnpm dev` on the host with `OIDC_ISSUER=http://localhost:5556` and Dex is up in compose
- **THEN** the browser and the app both reach Dex at `localhost:5556`, the `iss` claim matches, and a login round-trip completes

#### Scenario: Containerized app uses a shared issuer hostname

- **WHEN** the app runs inside compose with `OIDC_ISSUER=http://dex:5556` and the operator has mapped `127.0.0.1 dex` in `/etc/hosts`
- **THEN** the browser (via `/etc/hosts`) and the app container (via the compose network) resolve the same issuer, and login completes

#### Scenario: The misconfigured localhost issuer is rejected as unsupported

- **WHEN** the app runs inside compose with `OIDC_ISSUER=http://localhost:5556`
- **THEN** the setup is documented as unsupported (the container's `localhost` is not Dex) and the contributor is directed to topology 1 or 2
