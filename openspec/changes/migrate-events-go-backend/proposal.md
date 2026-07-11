## Why

The event domain (events, registrations, categories, admin) is expected to grow — a mobile app, payments, and a public API are on the roadmap — and a single SvelteKit process cannot serve non-browser clients well. The backend logic is currently cleanly isolated in `src/lib/server/**`, which makes extraction into a dedicated Go service cheap now and increasingly expensive later. Decision log and phasing were agreed in GitHub issue [pekanbaru-dev/pkuremote#41](https://github.com/pekanbaru-dev/pkuremote/issues/41).

## What Changes

- **BREAKING (repo layout)**: monorepo restructure — SvelteKit moves to `web/`, a new Go service lives in `api/`, gRPC contracts live in `proto/`. Pure mechanical first commit, no behavior change.
- New Go backend service (`api/`) serving the event domain over gRPC (ConnectRPC: connect-go server, speaks gRPC + gRPC-Web + JSON on one port). Private Docker network only — never exposed through Caddy in this change.
- SvelteKit becomes a **BFF**: `+page.server.ts` load functions and form actions call the Go API via a generated connect-es client instead of querying Postgres. Browser-facing behavior (routes, forms, SSR, SEO) is preserved unchanged.
- API contract defined in `.proto` files with **buf** (lint, breaking-change detection, codegen for Go + TypeScript).
- **BREAKING (tooling)**: database DDL ownership moves from drizzle-kit to **goose** (plain SQL migrations in `api/`). drizzle-kit never generates migrations again; Drizzle ORM remains only as legacy query code for auth tables in the BFF.
- Go data access is ORM-free: **sqlc + pgx** over hand-written SQL.
- Interim auth: BFF keeps OIDC + DB sessions and passes `X-User-Id` to Go over the private network. Admin authorization (`ADMIN_EMAILS`) moves into Go from day one; the BFF `/admin` gate consults Go via a `GetMe` RPC.
- Event-domain migration is phased with hard cutover per phase (no fallback flag): reads (events/categories) → booking/registrations → admin (CRUD, attendees/check-in, dashboard, CSV export, banner uploads).
- Deployment: a second GHCR image (`api`) joins the compose stack on the internal network.

**Out of scope** (documented direction, future changes): moving OIDC/session issuance to Go, exposing the API publicly through Caddy, mobile app, payments. Closing/archiving the `migrate-off-supabase` change happens in a separate PR.

**Branch policy**: all work on `feat/go-backend-migration`; no merge to `master` (deploys prod) until old behavior is verified end-to-end.

## Capabilities

### New Capabilities

- `monorepo-layout`: repository structure — `web/` (SvelteKit), `api/` (Go), `proto/` (contracts) at root; build contexts, CI path filters, tooling paths.
- `api-contract`: gRPC contract conventions — proto package layout, buf lint/breaking rules, codegen targets (connect-go for `api/`, connect-es for `web/`), versioning.
- `go-api-service`: the Go backend service — ConnectRPC server, configuration, health check, trusted-header identity (`X-User-Id`), event-domain RPCs (events, categories, registrations/booking, admin operations, dashboard aggregates, CSV export, banner uploads), private-network deployment posture.
- `go-db-access`: ORM-free data layer — goose owns all migrations (including auth tables), sqlc + pgx query layer, transactional booking semantics (quota decrement, unique user+event).

### Modified Capabilities

- `architecture`: layering changes — SvelteKit demoted to BFF; backend logic lives in `api/`, not `src/lib/server/**`; new dependency rule web → api via generated client only.
- `admin-access`: admin authorization moves from the BFF env check to the Go service (`ADMIN_EMAILS` enforced in Go); BFF admin layout gates via `GetMe` RPC instead of local `isAdmin`.
- `drizzle-integration`: drizzle-kit loses DDL ownership (goose takes over); Drizzle ORM demoted to legacy query-only usage for auth tables, scheduled for deletion when auth moves to Go.
- `docker-dev-loop`: dev compose gains the `api` service; buf/sqlc/goose join the dev toolchain; dev server workflow spans two processes.
- `production-deploy`: deploy builds and ships two images (web + api); api container joins the stack on the internal network only.

## Impact

- **Code**: `src/lib/server/{events,registrations,categories,dashboard,storage}/**` is transliterated to Go and deleted from the web app; all `+page.server.ts`/`+server.ts` that touch those modules are rewired to the connect-es client. `src/lib/server/auth/**` and `db/schema` auth usage stay (legacy, query-only).
- **Repo layout**: every path-sensitive file — `Dockerfile`, `docker-compose*.yml`, `.github/workflows/*`, `components.json`, `playwright.config.ts`, `.impeccable/live/config.json`, `CLAUDE.md`/`ARCHITECTURE.md`, MCP configs.
- **Dependencies**: new Go module (`connect-go`, pgx, sqlc-generated code, goose); web gains `@connectrpc/connect` + generated stubs; drizzle-kit demoted.
- **Database**: no schema changes required by the migration itself; DDL toolchain swaps (drizzle-kit → goose baseline).
- **CI/CD**: workflows split by path filter; second GHCR image; existing prod deploy gate unchanged.
- **Behavior**: user-visible behavior must remain identical — verification surface: browse/filter events, event detail, booking + ticket QR, my registrations, admin CRUD/check-in/CSV export, login/logout.
