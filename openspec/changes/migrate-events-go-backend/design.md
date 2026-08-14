## Context

All backend logic lives inside the SvelteKit process (`adapter-node`), isolated in `src/lib/server/**`: events/registrations/categories/dashboard reads and writes via Drizzle ORM, OIDC auth (Arctic + jose) with DB-backed sessions, banner uploads on local disk. Routes never touch the DB directly — `+page.server.ts` load functions and form actions call named functions like `getUpcomingEvents`, `bookEvent`, `setRegistrationStatus`. Postgres 16 runs in the same compose stack; drizzle-kit owns schema migrations (`db/schema/*.ts` → `db/migrations/*.sql`).

The roadmap (mobile app, payments, public API) requires a backend that serves non-browser clients. Decisions were made in an explore session and recorded in issue [#41](https://github.com/pekanbaru-dev/pkuremote/issues/41). The app is pre-production: staging and prod are the same box/DB, so cutover risk tolerance is high, but user-visible behavior must be preserved and verified before merging `feat/go-backend-migration` to `master`.

## Goals / Non-Goals

**Goals:**

- Extract the event domain (events, categories, registrations/booking, admin operations, dashboard, CSV export, banner uploads) into a Go service reachable only on the private Docker network.
- SvelteKit becomes a BFF: identical browser-facing behavior (SSR, form actions, progressive enhancement, SEO endpoints), but load functions/actions call the Go API via a generated typed client.
- Contract-first everything: buf-managed `.proto` as the API source of truth; goose-managed SQL as the schema source of truth; sqlc-generated Go as the query layer.
- Restructure the repo (`web/` + `api/` + `proto/`) so both apps have clean homes, as an isolated no-behavior-change commit.
- Put admin authorization in Go from day one so authorization policy has a single owner on the side that will eventually own auth.

**Non-Goals:**

- Moving OIDC/session issuance to Go (future change; this design keeps the seam clean for it).
- Exposing the Go API through Caddy / to browsers or mobile clients.
- Any schema redesign — tables are carried over as-is (baseline re-owned by goose).
- Payments, mobile app, public API versioning policy.
- Separate staging environment design (staging == prod today).
- Rewriting the BFF's remaining auth queries away from Drizzle (legacy until auth moves to Go).

## Decisions

### 1. SvelteKit as BFF; Go API is private

Browser → SvelteKit only. SvelteKit → Go server-to-server on the compose network; the api container publishes no ports and is not in the Caddy config. Preserves SSR/SEO (sitemap, JSON-LD, event pages) and progressive-enhancement form actions; avoids CORS and cookie-domain work entirely. *Alternative rejected:* browser calls Go directly — forces CORS, cookie scoping, and gRPC-Web plumbing now, for no current client that needs it.

### 2. ConnectRPC + buf, raw `.proto` (gunk rejected)

Contracts are hand-written `.proto` under `proto/` with `buf lint` and `buf breaking` in CI, `buf generate` emitting connect-go into `api/` and connect-es into `web/`. connect-go serves gRPC, gRPC-Web, and JSON/HTTP on one port — real gRPC for learning and future clients, `curl`-able JSON for debugging. *Alternatives rejected:* gunk (dormant — last release v0.11.0 May 2022; learning gunk's dialect instead of protobuf); plain grpc-go + grpc-web proxy (extra proxy component, worse DX); REST + OpenAPI (fine, but the user explicitly wants gRPC).

### 3. Trusted-header identity; authorization lives in Go

The BFF resolves the session cookie (existing code) and forwards only `X-User-Id` on internal calls. Go treats the header as authenticated identity — safe because the network is private; a shared-secret header (`X-Internal-Token`) is added as a cheap second factor so a misconfigured port-publish is not instantly fatal. `ADMIN_EMAILS` moves to the api container's env; Go middleware enforces it on admin RPCs. The BFF's `/admin/+layout.server.ts` gate calls `AuthService.GetMe(user_id)` and branches on `is_admin` — the BFF no longer reads `ADMIN_EMAILS`. *Alternatives rejected:* duplicating `ADMIN_EMAILS` in both services (two authorities, drift); shared sessions table read from Go (implements half of auth-in-Go without committing to it); JWT minting in the BFF (ceremony without a second consumer yet).

### 4. goose owns all DDL; sqlc + pgx for queries; no ORM in Go

`api/migrations/` holds plain SQL goose migrations. Migration zero is a baseline representing the current schema (generated from the live schema; applied databases mark it as applied via `goose` versioning rather than re-running DDL). drizzle-kit never generates migrations again; `db/schema/*.ts` survives only as TS types for the BFF's legacy auth queries (refreshed via `drizzle-kit pull` if the auth tables ever change). Go queries are hand-written SQL in `api/queries/*.sql` compiled by sqlc against pgx v5 — type mismatches fail at generation time. Booking keeps its transactional semantics in one SQL transaction: decrement `remaining_slots` guarded by `remaining_slots > 0`, insert registration, rely on the unique `(user_id, event_id)` constraint; sqlc queries composed inside a pgx `tx`. *Alternatives rejected:* GORM (fights the existing CHECK-constraint/hand-SQL style), sqlx (runtime scanning, no compile-time query checking), Atlas (heavier than needed; goose's plain-SQL files match the no-ORM philosophy).

### 5. Monorepo layout: `web/` + `api/` + `proto/` at root

Two apps and no shared JS packages → no `apps/` nesting. Compose files, `openspec/`, docs stay at root. The restructure is a single mechanical commit (git mv + path fixes: Dockerfile context, workflows, compose build contexts, `components.json`, playwright, impeccable config, CLAUDE/ARCHITECTURE docs, MCP configs) with zero behavior change, verified by `pnpm check && pnpm lint && pnpm test:unit -- --run` and a production build before any Go code lands. CI gains path filters (`web/**`, `api/**`, `proto/**`) so single-side changes build one image.

### 6. Go service shape

Single binary, `api/cmd/server`, internal packages by domain (`internal/events`, `internal/registrations`, `internal/categories`, `internal/dashboard`, `internal/authz`, `internal/storage`). connect-go handlers are thin; domain logic sits in plain functions mirroring today's `db-*.ts` functions to make transliteration reviewable 1:1. `log/slog` for logging, `net/http` + connect mux, graceful shutdown, `/healthz` plain HTTP. Config via env (`DATABASE_URL`, `ADMIN_EMAILS`, `INTERNAL_TOKEN`, `UPLOAD_DIR`). Module path `github.com/pekanbaru-dev/pkuremote/api`.

### 7. Phased hard cutover, one domain slice at a time

Reads (events/categories + dashboard reads) → booking/registrations → admin writes (CRUD, check-in, CSV, uploads). Each phase deletes the corresponding `src/lib/server/**` module in the same commit that rewires the routes — no dual-path flag, since the app is pre-production and the feature branch never deploys. Rollback = revert the phase commit. QR generation stays in the BFF (it renders a data URL for a page the BFF serves); the registration *data* comes from Go.

### 8. Uploads move with the admin phase

Banner upload/serve moves to Go in the admin phase: Go stores to the shared `uploads_data` volume and serves bytes over an RPC/HTTP handler; the BFF's `/uploads/[file]` route proxies (keeps public URLs stable). Local disk is retained — object storage is explicitly deferred.

## Risks / Trade-offs

- **[Two codebases per feature]** Every event-domain feature now touches proto + Go + web. → Accepted deliberately (roadmap requires it); contract-first codegen keeps the boundary typed; thin handlers keep Go changes small.
- **[Booking semantics drift during transliteration]** Quota decrement / duplicate-booking behavior is the highest-risk logic. → Port `bookEvent` with a side-by-side review against `db-registrations.ts`; unit-test the Go transaction against a real Postgres (dockertest or compose) including the quota-exhausted and duplicate paths; keep the DB constraints as the final guard.
- **[Baseline migration mismatch]** goose baseline diverging from what drizzle actually created. → Generate the baseline from a `pg_dump --schema-only` of a freshly drizzle-migrated DB, not by hand; CI job spins up Postgres, runs goose from zero, and diffs against the dump.
- **[Trusted header spoofing]** If the api port is ever published, `X-User-Id` is an auth bypass. → No published ports + `INTERNAL_TOKEN` shared secret checked by middleware; fail closed when unset in production.
- **[Restructure breaks tooling silently]** Many configs encode paths (CI, compose, impeccable, MCP, docs). → Isolated commit, full verify suite + docker build before proceeding; grep for `src/` and `./db` references across configs as a checklist item.
- **[connect-es in SvelteKit SSR]** Client must be created per-request server-side (no shared state, correct fetch). → Use a factory in `web/src/lib/server/api/client.ts`; Node 22 native fetch transport; never import the client in browser-side modules (enforce via ESLint `no-restricted-imports` on `$lib/server/api` from client code — same pattern the repo already uses).
- **[Two deploy artifacts, one box]** Compose stack gains a service; a bad api image can take bookings down while web still serves. → `/healthz` + compose `depends_on` with healthcheck; single-box reality accepted (staging == prod today).

## Migration Plan

1. **Restructure** (mechanical commit): `web/` move + path fixes + CI path filters. Verify: check/lint/unit/build + docker build.
2. **Skeleton**: `proto/` with buf config + first `events.v1` package; `api/` module with connect-go server, `/healthz`, goose baseline, sqlc setup; compose service (internal network, healthcheck); `GetMe` + authz middleware; connect-es client factory in web.
3. **Reads cutover**: events/categories/dashboard read RPCs; rewire `/`, `/events`, `/events/[slug]` (load), `/myregistrations` reads, sitemap; delete `db-events.ts`, `db-categories.ts`, `db-dashboard.ts` read paths.
4. **Booking cutover**: `BookEvent`, registration queries, cancel, ticket lookup; rewire the `book` action and ticket page; delete `db-registrations.ts` user-facing paths.
5. **Admin cutover**: event CRUD, attendee check-in, CSV export, banner uploads; rewire all `/admin` actions + export endpoint; delete `db-event-writes.ts`, remaining registration admin paths, `storage/` write path; `/admin` layout gate switches to `GetMe`.
6. **Verification before merge**: end-to-end pass of the full surface (browse/filter, detail, book + ticket QR, my registrations, admin CRUD/check-in/CSV/upload, login/logout) against the compose stack; then merge `feat/go-backend-migration` → `master` (deploys prod).

Rollback strategy: pre-merge, revert phase commits on the branch; post-merge, redeploy previous image tag (existing `workflow_dispatch` rollback path) — DB schema is unchanged by this migration, so images are interchangeable.

## Open Questions

- Does `GetMe` live in its own `auth.v1` proto package (future-proof for the auth migration) or inside a shared `common.v1`? Leaning `auth.v1`.
- goose invocation: run migrations as an api-container entrypoint step vs. a separate one-shot compose service. Leaning entrypoint step (matches current behavior where the app runs drizzle migrations).
- Whether `events.category` free-text column (separate from the `event_categories` M2M) gets carried into the proto contract or quietly dropped from responses — needs a data check on what production rows actually use.
