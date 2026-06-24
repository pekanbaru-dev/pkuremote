# drizzle-integration

## Purpose

TBD — Drizzle ORM as the SvelteKit FE's typed database access layer against a Supabase Cloud Postgres, plus the local dev configuration (`.env.example`, npm scripts) and the initial schema/seed that back the landing page's content shapes.
## Requirements
### Requirement: `.env.example` documents every required variable

The repository SHALL contain a `.env.example` at the repo root that lists every environment variable the FE and the Drizzle scripts need. Each variable MUST have an inline comment explaining its purpose, and the file MUST include the Supabase project URL, the publishable and secret Supabase keys, both database URLs (`DATABASE_URL` for the pooler and `DIRECT_URL` for direct connections / migrations), and the service role key.

#### Scenario: A new contributor can configure the project without reading the docs
- **WHEN** a contributor runs `cp .env.example .env` on a clean clone and fills in the values from a Supabase Cloud project's API Settings and Database Settings
- **THEN** every value referenced by the SvelteKit FE and the Drizzle scripts is present in `.env` and the contributor can run `pnpm db:migrate`, `pnpm db:seed`, and `pnpm dev` without further configuration

#### Scenario: Real secrets are not committed
- **WHEN** the repository is cloned
- **THEN** `.env`, `.env.local`, and any non-`.env.example` env file are git-ignored, so a contributor cannot accidentally commit a populated `.env`

### Requirement: npm scripts wrap the data layer lifecycle

The `package.json` SHALL expose `db:generate` (runs `drizzle-kit generate`), `db:migrate` (runs `drizzle-kit migrate`), `db:push` (runs `drizzle-kit push` for prototyping only), `db:studio` (runs `drizzle-kit studio`), and `db:seed` (runs `tsx db/seed.ts`). These scripts read `DATABASE_URL` and `DIRECT_URL` from the environment and SHALL NOT require Docker or any other local service.

#### Scenario: Migrations apply against Supabase Cloud
- **WHEN** a contributor runs `pnpm db:migrate` with `.env` pointing at a Supabase Cloud project
- **THEN** every migration in `db/migrations/` is applied to the project's Postgres and the command exits 0

#### Scenario: Studio is reachable for local DB inspection
- **WHEN** a contributor runs `pnpm db:studio`
- **THEN** Drizzle Studio starts on a local port and lists the tables defined in `db/schema/`

#### Scenario: Schema changes produce a new migration
- **WHEN** a developer edits a file in `db/schema/` and runs `pnpm db:generate`
- **THEN** a new SQL file is created under `db/migrations/` and `pnpm db:migrate` applies it without error

### Requirement: Drizzle ORM is the FE's typed database client

The project SHALL use Drizzle ORM as the typed database access layer for the SvelteKit FE. The Drizzle client SHALL be defined at `src/lib/server/db/client.ts` and SHALL live under the `src/lib/server/` segment so SvelteKit's bundler never includes it in the client bundle. The client SHALL connect to the URL specified by the `DATABASE_URL` environment variable using a `postgres` driver.

#### Scenario: Server-only enforcement
- **WHEN** a developer tries to import `$lib/server/db/client` from a `.svelte` file or any other client-side module
- **THEN** the SvelteKit build fails with the standard "server-only module imported from client" error

#### Scenario: Connection uses the configured URL
- **WHEN** the FE starts and `DATABASE_URL` is set
- **THEN** the Drizzle client is constructed with that URL and a query through the client reaches the configured Supabase Postgres

### Requirement: Drizzle config and migrations folder

The repository SHALL contain a `drizzle.config.ts` at the repo root that points at the schema folder (`db/schema/`), the migrations folder (`db/migrations/`), and uses the `DIRECT_URL` environment variable for migrations. The `db/migrations/` directory SHALL be tracked in git so the full schema history is part of the repository.

#### Scenario: Drizzle reads the schema and migrations folders
- **WHEN** `drizzle-kit` runs (via `pnpm db:generate`, `pnpm db:migrate`, or `pnpm db:push`)
- **THEN** it loads schema from `db/schema/` and reads/writes migrations to `db/migrations/` based on `drizzle.config.ts`

### Requirement: Initial schema covers the landing page's content shapes

The schema in `db/schema/` SHALL define the following tables, matching the dummy content the landing page currently renders, so the first feature change can replace dummy data with real queries:

- `profiles` — one row per `auth.users` row, with a foreign key to `auth.users.id`, a `display_name` column, and an `avatar_url` column (nullable; populated by the `handle_new_user` trigger from the Google identity's `picture` claim). Row Level Security is **enabled** on `profiles`: the `authenticated` role has `select` and `update` policies limited to rows where `id = auth.uid()`, and the `insert`/`delete` policies are revoked (the trigger and the service role own writes).
- `events` — `id`, `title`, `starts_at`, `location`, `excerpt`, `body`, `created_at`.
- `announcements` — `id`, `title`, `body`, `published_at`.
- `posts` — `id`, `title`, `slug` (unique), `author_id` (FK → `profiles.id`), `excerpt`, `body`, `published_at`, `created_at`.

Each table SHALL declare a primary key (`id` as `uuid` with a `gen_random_uuid()` default). `profiles` MUST have Row Level Security enabled; `events`, `announcements`, and `posts` MAY have RLS enabled or disabled (RLS on these is a future change's concern).

#### Scenario: All four tables exist after a fresh migrate

- **WHEN** a contributor runs `pnpm db:migrate` against an empty Supabase project
- **THEN** the `profiles`, `events`, `announcements`, and `posts` tables exist in the project and Drizzle Studio lists them

#### Scenario: A user can read and update only their own `profiles` row

- **WHEN** a request reaches Postgres with `auth.uid() = '<uuid-A>'` and a `select` is issued on `profiles` for `id = '<uuid-A>'`
- **THEN** the row is returned
- **WHEN** the same request issues a `select` on `profiles` for `id = '<uuid-B>'`
- **THEN** no row is returned
- **WHEN** the same request issues an `update` on `profiles` for `id = '<uuid-B>'`
- **THEN** the update affects 0 rows

#### Scenario: The service role can write `profiles` regardless of RLS

- **WHEN** the `handle_new_user` trigger (which runs as the table owner / `security definer`) inserts a `profiles` row
- **THEN** the insert succeeds and the row is visible to the owning user on their next `getUser()` call

### Requirement: Seed script populates dev data

The repository SHALL contain a `db/seed.ts` script that inserts at least one row into each of `events`, `announcements`, and `posts`, and one `profiles` row linked to a known UUID, so Drizzle Studio and the (future) FE have something to display after a fresh `pnpm db:migrate`. The seed script SHALL be idempotent: re-running it SHALL not produce duplicate rows (it uses `onConflictDoNothing` or equivalent).

#### Scenario: Seed produces a usable dev dataset
- **WHEN** a contributor runs `pnpm db:seed` against an empty database
- **THEN** the `events`, `announcements`, `posts`, and `profiles` tables each contain at least one row

#### Scenario: Re-running the seed is safe
- **WHEN** a contributor runs `pnpm db:seed` twice in a row
- **THEN** the second run does not error and the row counts are unchanged

### Requirement: Database access is not bundled into the client

No Drizzle schema or client file SHALL be reachable from a client-side bundle. The SvelteKit `src/lib/server/` segment, the `$lib/server/db` import path, and the `db/` repo-root scripts (config, schema, migrations, seed) SHALL remain server-only at build time. Drizzle is used only from `+page.server.ts`, `+server.ts`, and Node-only scripts.

#### Scenario: Client bundle is free of Drizzle imports
- **WHEN** `pnpm build` runs
- **THEN** no Drizzle module appears in the client-side output of the SvelteKit build

