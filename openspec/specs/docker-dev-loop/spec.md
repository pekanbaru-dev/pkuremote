# docker-dev-loop

## Purpose

TBD — Docker-based local development workflow for the SvelteKit FE: `docker compose up` brings up Vite's dev server on `http://localhost:5173` with hot reload, using the same `.env` and Supabase project as the host-Node workflow. No Caddy, no HTTPS, no port 80/443.

## Requirements

### Requirement: `docker-compose.yml` runs the FE on `localhost:5173` with hot reload

The repository SHALL contain a `docker-compose.yml` at the repo root that brings up the SvelteKit FE for local development with a single `docker compose up` command. The compose file SHALL define a single service named `app` that builds the `dev` target of the repo's `Dockerfile`, bind-mounts the current directory into `/app` (with `node_modules` and `.svelte-kit` overridden by anonymous Docker volumes so the image's installed deps win), and exposes port `5173` on `127.0.0.1` of the host. The service SHALL pass through the `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` environment variables from the host's `.env`. The compose file SHALL NOT include a Caddy service and SHALL NOT publish any port other than `5173`.

#### Scenario: A contributor can run the FE in Docker with one command
- **WHEN** a contributor with Docker installed runs `docker compose up` from the repo root
- **THEN** the `app` container starts, Vite's dev server binds to `0.0.0.0:5173` inside the container, and `http://localhost:5173` on the host serves the landing page

#### Scenario: Source edits trigger hot reload
- **WHEN** a contributor edits a `.svelte` or `.ts` file under the repo root while the stack is up
- **THEN** Vite's HMR picks up the change and the browser refreshes without restarting the container

#### Scenario: No HTTPS or Caddy in local dev
- **WHEN** the local dev stack is up
- **THEN** the only published host port is `5173`, no Caddy container is running, and `http://localhost:5173` returns 200 over plain HTTP

### Requirement: The dev compose reuses the prod Dockerfile's `dev` stage

The local `docker-compose.yml` and the production `docker-compose.prod.yml` SHALL both build from the same `Dockerfile` in the repo root. The `dev` stage SHALL include all dependencies needed to run `pnpm dev` (including `vite`, `svelte-check`, and other `devDependencies`), and SHALL be the target selected by the local compose. The `runtime` stage SHALL be the default target of the Dockerfile, used by the production compose.

#### Scenario: One Dockerfile covers both workflows
- **WHEN** a contributor runs `docker compose up` (local) or `docker compose -f docker-compose.prod.yml up -d` (production)
- **THEN** both commands build from the same `Dockerfile`; only the target stage differs

#### Scenario: The dev image includes Vite
- **WHEN** the `dev` stage image is inspected
- **THEN** it contains `vite` (or a directory under `node_modules/vite`) so `pnpm dev` can start the Vite dev server
