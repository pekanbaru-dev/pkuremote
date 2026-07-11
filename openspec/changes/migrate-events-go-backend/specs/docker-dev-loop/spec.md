## MODIFIED Requirements

### Requirement: `docker-compose.yml` runs the FE on `localhost:5175` with hot reload

The repository SHALL contain a `docker-compose.yml` at the repo root that brings up the full dev stack with a single `docker compose up`. The compose file SHALL define: an `app` service that builds the `dev` target of `web/Dockerfile` with build context `web/`, bind-mounts `web/` into the container (with `node_modules`/`.svelte-kit` overridden by anonymous volumes), and exposes port `5175` on `127.0.0.1`; an **`api` service** building from `api/` that joins the internal network, publishes no host port, runs its goose migrations on start, and reports health on `/healthz`; a `postgres` service; and a dev-only `dex` service publishing `5556` on `127.0.0.1`. The `app` service SHALL receive `DATABASE_URL` (→ `postgres`, for the legacy auth queries), the `OIDC_*` variables, `API_URL` (→ the `api` service), and `INTERNAL_TOKEN`; the `api` service SHALL receive `DATABASE_URL`, `ADMIN_EMAILS`, `INTERNAL_TOKEN`, and `UPLOAD_DIR`. The compose file SHALL NOT include a Caddy service and SHALL NOT publish any port other than `5175` and `5556`.

#### Scenario: A contributor can run the stack in Docker with one command

- **WHEN** a contributor with Docker installed runs `docker compose up` from the repo root
- **THEN** the `app`, `api`, `postgres`, and `dex` containers start, the api applies migrations and becomes healthy, and `http://localhost:5175` serves pages whose event data comes from the api

#### Scenario: Source edits trigger hot reload

- **WHEN** a contributor edits a `.svelte` or `.ts` file under `web/` while the stack is up
- **THEN** Vite's HMR picks up the change and the browser refreshes without restarting the container

#### Scenario: The api is internal-only in dev

- **WHEN** the dev stack is up and the host attempts to connect to the api service's port directly
- **THEN** the connection is refused; only the `app` container reaches it over the compose network

## ADDED Requirements

### Requirement: The backend toolchain is documented and reproducible

The dev loop SHALL document and script the Go-side toolchain: a single command regenerates all generated code (`buf generate` for connect stubs, `sqlc generate` for query code), and goose migrations run automatically when the api container starts (a manual invocation SHALL also be documented for host-run development). Contributor docs SHALL state the required tool versions (Go, buf, sqlc, goose) and how to install them.

#### Scenario: A contributor regenerates after a contract change

- **WHEN** a contributor edits a `.proto` or `.sql` query file and runs the documented regenerate command
- **THEN** the connect-go, connect-es, and sqlc outputs are refreshed in place and the diff contains only generated-code changes

#### Scenario: Host-run api development works

- **WHEN** a contributor runs the api on the host against the compose Postgres following the docs
- **THEN** migrations apply and the service starts, with the web dev server pointed at it via `API_URL`
