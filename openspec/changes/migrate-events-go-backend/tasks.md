## 1. Repo restructure (mechanical, no behavior change)

- [ ] 1.1 Move the SvelteKit app into `web/` (`git mv` for `src/`, `static/`, `db/`, `e2e/`, and all app configs: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `svelte.config.js`, `playwright.config.ts`, `components.json`, `eslint.config.js`, `.prettierrc`, `tsconfig.json`, `drizzle.config.ts`, `Dockerfile`)
- [ ] 1.2 Update `docker-compose.yml` / `docker-compose.override.yml` / `docker-compose.prod.yml` / `docker-compose.deploy.yml`: build context → `web/`, bind mounts → `web/`, volume paths
- [ ] 1.3 Update `.github/workflows/ci.yml`, `deploy.yml`, `deploy-staging.yml`: working-directory `web/`, checkout paths, docker build context; add path filters for `web/**` / `api/**` / `proto/**`
- [ ] 1.4 Update path-sensitive tooling: `.impeccable/live/config.json` (`web/src/app.html`), MCP configs if path-scoped, `.gitignore`
- [ ] 1.5 Update `CLAUDE.md`/`AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `docs/` for the new layout; grep the repo for stale root-level `src/`, `db/`, `static/` references and fix all hits
- [ ] 1.6 Verify: `pnpm check && pnpm lint && pnpm test:unit -- --run` from `web/`, `pnpm build`, and a `docker build` of the web image all pass; commit as the isolated restructure commit

## 2. Contract and Go service skeleton

- [ ] 2.1 Create `proto/` with `buf.yaml` + `buf.gen.yaml`; define `events.v1` (EventService, CategoryService messages/RPCs for reads) and `auth.v1` (`AuthService.GetMe`); run `buf lint`
- [ ] 2.2 Configure codegen: connect-go output into `api/gen/`, connect-es output into `web/src/lib/server/api/gen/`; commit generated code; add a root regenerate script/command
- [ ] 2.3 Bootstrap `api/` Go module (`github.com/pekanbaru-dev/pkuremote/api`): `cmd/server`, `internal/` package layout, `log/slog` logging, config from env (`DATABASE_URL`, `ADMIN_EMAILS`, `INTERNAL_TOKEN`, `UPLOAD_DIR`), graceful shutdown, `/healthz` with DB ping
- [ ] 2.4 Create the goose baseline: `pg_dump --schema-only` from a freshly drizzle-migrated Postgres → `api/migrations/00001_baseline.sql`; wire goose to run before serving; document baseline adoption (mark-applied) for the existing database
- [ ] 2.5 Set up sqlc (`sqlc.yaml`, `api/queries/`) against the baseline schema; verify `sqlc generate` output compiles
- [ ] 2.6 Implement auth middleware: `X-Internal-Token` check (fail closed in prod when unset), `X-User-Id` extraction, `ADMIN_EMAILS` parsing (trim/lowercase/fail-closed) and admin interceptor; implement `GetMe`
- [ ] 2.7 Add `api` service to all compose files (internal network only, healthcheck, depends_on postgres) and an `api/Dockerfile` (multi-stage, distroless/alpine runtime)
- [ ] 2.8 Add Go CI job: build, vet, test, `buf lint`, `buf breaking` against base branch, regenerate-and-diff check for buf + sqlc outputs
- [ ] 2.9 Create the connect-es client factory at `web/src/lib/server/api/client.ts` (per-request, `API_URL` env); extend ESLint restricted-imports so client code cannot import it; document `API_URL`/`INTERNAL_TOKEN` in `.env.example`

## 3. Reads cutover (events, categories, dashboard)

- [ ] 3.1 Implement sqlc queries + connect handlers for event reads (upcoming/past/all, by id, by slug, by category slug) and category reads; port `computeRemainingSlots` display logic
- [ ] 3.2 Add proto + handlers for dashboard aggregates
- [ ] 3.3 Go unit tests against real Postgres (compose) for the read queries
- [ ] 3.4 Rewire web loads to the API client: `/` (home), `/events`, `/events/[slug]` load, `sitemap.xml`; keep JSON-LD/SEO rendering in the BFF unchanged
- [ ] 3.5 Rewire `/admin` dashboard reads and `/admin/events` list; delete `db-events.ts`, `db-categories.ts`, `db-dashboard.ts` and the now-unused Drizzle event schema imports
- [ ] 3.6 Verify in the browser (compose stack): home, events list + category filter, event detail render identically; `pnpm check && pnpm lint && pnpm test:unit -- --run` pass

## 4. Booking cutover (registrations)

- [ ] 4.1 Define `events.v1` registration RPCs: `BookEvent`, `CancelRegistration`, `ListMyRegistrations`, `GetRegistrationByNumber`; map error conditions (quota exhausted, duplicate, closed, past) to stable Connect error codes
- [ ] 4.2 Implement the booking transaction in Go (guarded `remaining_slots` decrement + insert + unique constraint) and the other registration queries; port registration-number generation (`PKU-{year}-{nanoid(6)}` format preserved)
- [ ] 4.3 Go tests: concurrent last-slot booking (exactly one winner), duplicate booking, closed registration, cancel restoring a slot
- [ ] 4.4 Rewire the `book` form action on `/events/[slug]`, `/myregistrations`, and the ticket page `/events/[slug]/ticket/[number]` (QR stays BFF-side); translate Connect error codes to the existing user-facing messages
- [ ] 4.5 Delete `db-registrations.ts` user-facing paths; verify booking/cancel/ticket flows in the browser including error cases

## 5. Admin cutover (CRUD, attendees, export, uploads)

- [ ] 5.1 Define admin RPCs: event create/update/delete (validation parity with `validateEventInput` + category diffing), attendee list, `SetRegistrationStatus`, CSV export, banner upload/delete
- [ ] 5.2 Implement admin handlers + sqlc queries behind the admin interceptor; banner storage on the `uploads_data` volume in Go
- [ ] 5.3 Rewire `/admin/events` (delete), `/admin/events/new`, `/admin/events/[id]/edit`, `/admin/events/[id]/attendees` (+ `setStatus`), the CSV export endpoint, and `/admin/categories` CRUD
- [ ] 5.4 Switch the `/admin/+layout.server.ts` gate to `GetMe`; remove `ADMIN_EMAILS` reading from web (`src/lib/server/auth/admin.ts` reduced or deleted); keep `DEV_ADMIN_EMAIL` dev bypass working
- [ ] 5.5 Make the BFF `/uploads/[file]` route proxy to the api's upload storage; confirm previously uploaded banners remain reachable at unchanged URLs
- [ ] 5.6 Delete `db-event-writes.ts`, `event-form.ts` DB parts, remaining `db-registrations.ts` admin paths, `storage/` write path, and the event-domain Drizzle schema files; remove `db:generate`/`db:migrate`/`db:push` scripts and `db/migrations/`; convert `db/seed.ts` off the deleted schema (plain SQL) — Drizzle remains for auth tables only
- [ ] 5.7 Verify all admin flows in the browser: create/edit/delete event (with banner upload), attendee check-in, CSV export, category CRUD

## 6. Deploy pipeline and final verification

- [ ] 6.1 Update `deploy.yml`/`deploy-staging.yml` to build and push both GHCR images (`pkuremote-web`, `pkuremote-api`) with shared tags and path-filtered skips; update `docker-compose.deploy.yml` for the four-service stack (api internal-only, healthcheck ordering)
- [ ] 6.2 Document operator env changes (`INTERNAL_TOKEN`, `API_URL`, `ADMIN_EMAILS` moves to api) in `.env.example` and deploy docs; verify rollback path covers both images
- [ ] 6.3 Full end-to-end verification on the compose stack: browse/filter events, event detail, booking + ticket QR, my registrations, admin CRUD + check-in + CSV + upload, login/logout, sitemap/robots; `pnpm test:e2e` green
- [ ] 6.4 Confirm behavior parity sign-off, then merge `feat/go-backend-migration` → `master` (prod deploy gate)
