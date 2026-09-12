## MODIFIED Requirements

### Requirement: npm scripts wrap the data layer lifecycle

The web app's `package.json` SHALL expose only the surviving data scripts: `db:studio` (runs `drizzle-kit studio` for local DB inspection), `db:pull` (runs `drizzle-kit pull` to refresh the TS types from the live schema), and `db:seed` (runs the dev seed). The DDL-generating scripts `db:generate`, `db:migrate`, and `db:push` SHALL be removed — schema migrations are owned by goose in `api/migrations/` (see the `go-db-access` capability). No web script SHALL be capable of emitting or applying DDL.

#### Scenario: DDL scripts are gone

- **WHEN** `web/package.json` is inspected
- **THEN** no script invokes `drizzle-kit generate`, `drizzle-kit migrate`, or `drizzle-kit push`

#### Scenario: Studio is reachable for local DB inspection

- **WHEN** a contributor runs `pnpm db:studio`
- **THEN** Drizzle Studio starts on a local port and lists the database's tables

### Requirement: Drizzle config and migrations folder

The web app SHALL contain a `drizzle.config.ts` used only for introspection tooling (`drizzle-kit studio`, `drizzle-kit pull`) pointing at the schema folder and `DATABASE_URL`. The `db/migrations/` directory and drizzle's migration journal SHALL be deleted — the schema history lives in goose migrations under `api/migrations/`, tracked in git.

#### Scenario: No drizzle migrations remain

- **WHEN** the repository is inspected after the cutover
- **THEN** `web/db/migrations/` does not exist and `drizzle.config.ts` configures no migration output

### Requirement: Drizzle ORM is the FE's typed database client

Drizzle ORM SHALL remain in the web app **only** as the legacy typed query client for the auth tables (`users`, `oauth_accounts`, `sessions`, `profiles`) used by the BFF's session and OIDC code, and it is scheduled for deletion when auth moves to the Go service. The client at `src/lib/server/db/client.ts` SHALL keep its existing server-only and lazy-initialization behavior (no connection or env read at import time; `DATABASE_URL` validated at first query). The TS schema SHALL cover only the auth tables; event-domain tables SHALL NOT have Drizzle schema definitions or queries in `web/`.

#### Scenario: Server-only enforcement

- **WHEN** a developer tries to import `$lib/server/db/client` from a `.svelte` file or any other client-side module
- **THEN** the SvelteKit build fails with the standard "server-only module imported from client" error

#### Scenario: The build does not require DATABASE_URL

- **WHEN** `pnpm build` runs in `web/` and `DATABASE_URL` is not set
- **THEN** the build completes without error and no connection is opened; the documented error is thrown at first query time instead

#### Scenario: Event-domain queries are absent

- **WHEN** the web app's Drizzle usage is inspected after the cutover
- **THEN** every remaining query touches only auth tables; no Drizzle query references events, registrations, categories, or event_categories

## REMOVED Requirements

### Requirement: Initial schema covers the landing page's content shapes

**Reason**: Content-table schema ownership moves to the goose baseline in `api/migrations/` (see `go-db-access`). The web app's TS schema retains only the auth tables; `events`, `announcements`, and `posts` are no longer defined in Drizzle.

**Migration**: The tables themselves are unchanged in the database — the goose baseline (generated from the current schema) carries them forward. Delete the corresponding `web/db/schema/*.ts` files except the auth tables.

### Requirement: `events` table carries the full shape the UI renders

**Reason**: The `events` table's definition is owned by the goose baseline; the web app no longer queries it via Drizzle. The column shape and constraints are preserved verbatim in the baseline and exercised by the `go-db-access` and `go-api-service` capabilities.

**Migration**: No database change. Remove `web/db/schema/events.ts`; the Go service's sqlc types replace the inferred Drizzle types.

### Requirement: `categories` table exists with `id`, `name`, `slug`

**Reason**: Ownership moves to the goose baseline (see `go-db-access`); the table and its unique constraints are unchanged.

**Migration**: No database change. Remove `web/db/schema/categories.ts`.

### Requirement: `event_categories` join table enables M2M between events and categories

**Reason**: Ownership moves to the goose baseline (see `go-db-access`); the join table, composite key, and cascade behavior are unchanged.

**Migration**: No database change. Remove `web/db/schema/event-categories.ts`.

### Requirement: `registrations` table exists with booking, ownership, status, and per-event attendee columns

**Reason**: Ownership moves to the goose baseline (see `go-db-access`); the table, unique `(userId, eventId)` constraint, status CHECK, and cascades are unchanged and are now exercised by the Go booking transaction.

**Migration**: No database change. Remove `web/db/schema/registrations.ts`.

### Requirement: `events` table gains `registrationClosesAt` column

**Reason**: Folded into the goose baseline along with the rest of the `events` shape; the booking-deadline behavior is specified by `go-api-service`.

**Migration**: No database change; the column is carried by the baseline.
