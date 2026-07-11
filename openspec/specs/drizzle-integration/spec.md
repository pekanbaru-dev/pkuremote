# drizzle-integration

## Purpose

TBD — Drizzle ORM as the SvelteKit FE's typed database access layer against a self-hosted Postgres, plus the local dev configuration (`.env.example`, npm scripts) and the initial schema/seed that back the landing page's content shapes.

## Requirements

### Requirement: `.env.example` documents every required variable

The repository SHALL contain a `.env.example` at the repo root that lists every environment variable the FE and the Drizzle scripts need, each with an inline comment explaining its purpose. It MUST include a single `DATABASE_URL` (the direct connection to the app's Postgres) and the OIDC variables `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and `OIDC_REDIRECT_URI`. It MUST NOT reference any Supabase variable (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) or `DIRECT_URL`. It SHALL document that `OIDC_ISSUER` is a local Dex URL in development and `https://accounts.google.com` in production.

#### Scenario: A new contributor can configure the project without reading the docs

- **WHEN** a contributor runs `cp .env.example .env` on a clean clone and fills in the values (a local Dex issuer for dev, or a Google OAuth client for prod)
- **THEN** every value referenced by the SvelteKit FE and the Drizzle scripts is present in `.env` and the contributor can run `pnpm db:migrate`, `pnpm db:seed`, and `pnpm dev` without further configuration

#### Scenario: No Supabase variables remain

- **WHEN** `.env.example` is inspected
- **THEN** it contains no `SUPABASE_*`, `PUBLIC_SUPABASE_*`, or `DIRECT_URL` entries, and `DATABASE_URL` is the only database connection string

#### Scenario: Real secrets are not committed

- **WHEN** the repository is cloned
- **THEN** `.env`, `.env.local`, and any non-`.env.example` env file are git-ignored

### Requirement: npm scripts wrap the data layer lifecycle

The `package.json` SHALL expose `db:generate` (runs `drizzle-kit generate`), `db:migrate` (runs `drizzle-kit migrate`), `db:push` (runs `drizzle-kit push` for prototyping only), `db:studio` (runs `drizzle-kit studio`), and `db:seed` (runs `tsx db/seed.ts`). These scripts SHALL read a single `DATABASE_URL` from the environment (no `DIRECT_URL`, no pooler distinction) and SHALL NOT require the Supabase CLI or a service-role key.

#### Scenario: Migrations apply against the app's Postgres

- **WHEN** a contributor runs `pnpm db:migrate` with `.env` pointing `DATABASE_URL` at the Docker Postgres
- **THEN** every migration in `db/migrations/` is applied and the command exits 0

#### Scenario: A single connection string drives every db script

- **WHEN** any of `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed` runs
- **THEN** it uses `DATABASE_URL` and no script reads `DIRECT_URL`

### Requirement: Drizzle ORM is the FE's typed database client

The project SHALL use Drizzle ORM as the typed database access layer for the SvelteKit FE. The Drizzle client SHALL be defined at `src/lib/server/db/client.ts` under `src/lib/server/` so the bundler never includes it in the client bundle. The client SHALL be lazily initialized: importing the module SHALL NOT open a connection or read environment variables, so the build succeeds without `DATABASE_URL`. The first query that touches the client SHALL validate `DATABASE_URL` and open a `postgres` connection to it (a direct connection to the app's Postgres), throwing the documented "DATABASE_URL is not set" error if the variable is missing.

#### Scenario: Server-only enforcement

- **WHEN** a developer tries to import `$lib/server/db/client` from a `.svelte` file or any other client-side module
- **THEN** the SvelteKit build fails with the standard "server-only module imported from client" error

#### Scenario: Connection uses the configured URL

- **WHEN** a query reaches the client and `DATABASE_URL` is set
- **THEN** the Drizzle client is constructed with that URL and the query reaches the configured Postgres

#### Scenario: The build does not require DATABASE_URL

- **WHEN** `pnpm build` runs and `DATABASE_URL` is not set
- **THEN** the build completes without error and no `postgres` connection is opened
- **WHEN** a request later queries the client and `DATABASE_URL` is still not set
- **THEN** the documented "DATABASE_URL is not set" error is thrown at query time

### Requirement: Drizzle config and migrations folder

The repository SHALL contain a `drizzle.config.ts` at the repo root that points at the schema folder (`db/schema/`), the migrations folder (`db/migrations/`), and uses `DATABASE_URL` (not `DIRECT_URL`) for migrations. The `db/migrations/` directory SHALL be tracked in git so the full schema history is part of the repository.

#### Scenario: Drizzle reads the schema and migrations folders

- **WHEN** `drizzle-kit` runs (via `pnpm db:generate`, `pnpm db:migrate`, or `pnpm db:push`)
- **THEN** it loads schema from `db/schema/`, reads/writes migrations to `db/migrations/`, and connects using `DATABASE_URL`

### Requirement: Initial schema covers the landing page's content shapes

The schema in `db/schema/` SHALL define the following tables:

- `profiles` — one row per `users` row, with a foreign key `id → users.id` (`ON DELETE CASCADE`, shared 1:1 primary key), a `display_name` column, and a nullable `avatar_url` column (populated in the OIDC callback from the identity's `picture` claim). Row Level Security SHALL NOT be enabled on `profiles`, and there SHALL be no `auth.uid()`-based policies — access control lives in `$lib/server/` and `hooks.server.ts`, not the database.
- `events` — `id`, `title`, `starts_at`, `location`, `excerpt`, `body`, `created_at`.
- `announcements` — `id`, `title`, `body`, `published_at`.
- `posts` — `id`, `title`, `slug` (unique), `author_id` (FK → `profiles.id`), `excerpt`, `body`, `published_at`, `created_at`.

Each table SHALL declare a primary key (`id` as `uuid` with a `gen_random_uuid()` default, except `profiles.id` which equals `users.id`).

#### Scenario: All four tables exist after a fresh migrate

- **WHEN** a contributor runs `pnpm db:migrate` against an empty Postgres database
- **THEN** the `profiles`, `events`, `announcements`, and `posts` tables exist and Drizzle Studio lists them

#### Scenario: `profiles` has no RLS

- **WHEN** the schema and migrations are applied
- **THEN** `profiles` has Row Level Security disabled and no `profiles_select_own`/`profiles_update_own` policies exist

#### Scenario: `profiles.id` references the app-owned `users` table

- **WHEN** a `profiles` row is inserted
- **THEN** its `id` must match an existing `users.id` (the FK references `public.users`, not `auth.users`), and deleting the `users` row cascades to the `profiles` row

### Requirement: Seed script populates dev data

The repository SHALL contain a `db/seed.ts` script that inserts at least one row into each of `events`, `announcements`, and `posts`, plus a `users` row and a linked `profiles` row at a known UUID, so Drizzle Studio and the FE have data after a fresh `pnpm db:migrate`. The seed SHALL provision the user with a **direct insert into `users`** (not `supabase.auth.admin.createUser`) and SHALL NOT read any Supabase URL or service-role key. It SHALL be idempotent (uses `onConflictDoNothing` or equivalent).

#### Scenario: Seed produces a usable dev dataset

- **WHEN** a contributor runs `pnpm db:seed` against an empty database
- **THEN** the `users`, `profiles`, `events`, `announcements`, and `posts` tables each contain at least one row and the seed does not call any Supabase API

#### Scenario: Re-running the seed is safe

- **WHEN** a contributor runs `pnpm db:seed` twice in a row
- **THEN** the second run does not error and the row counts are unchanged

### Requirement: Database access is not bundled into the client

No Drizzle schema or client file SHALL be reachable from a client-side bundle. The SvelteKit `src/lib/server/` segment, the `$lib/server/db` import path, and the `db/` repo-root scripts (config, schema, migrations, seed) SHALL remain server-only at build time. Drizzle is used only from `+page.server.ts`, `+server.ts`, and Node-only scripts.

#### Scenario: Client bundle is free of Drizzle imports

- **WHEN** `pnpm build` runs
- **THEN** no Drizzle module appears in the client-side output of the SvelteKit build

### Requirement: `events` table carries the full shape the UI renders

The `events` table SHALL have the following columns in addition to the existing `id`, `title`, `startsAt`, `location`, `excerpt`, `body`, `createdAt`: `slug` (text, NOT NULL, UNIQUE), `endsAt` (timestamp with timezone, NULL), `bannerUrl` (text, NULL), `status` (text, NOT NULL, default `'upcoming'`, CHECK constraint in `'upcoming' | 'live' | 'past'`), `quota` (integer, NULL, positive), `remainingSlots` (integer, NULL, non-negative, SHALL be ≤ `quota` when both are set), `priceNormal` (integer, NULL, in IDR), `pricePromo` (integer, NULL, in IDR, SHALL be < `priceNormal` when both are set), `category` (text, NULL, CHECK constraint in `'workshop' | 'talk' | 'meetup' | 'social' | 'other'`). The `events` schema file at `db/schema/events.ts` SHALL declare all of these columns and export the Drizzle table object.

#### Scenario: A new event is inserted with the full shape

- **WHEN** a developer inserts a row into `events` with all fields populated
- **THEN** the insert succeeds, the `slug` is unique across the table, `pricePromo < priceNormal` when both are set, `remainingSlots <= quota` when both are set, and the row is queryable via Drizzle with the correct inferred TypeScript shape.

#### Scenario: A CHECK constraint rejects an invalid status

- **WHEN** a developer attempts to insert a row with `status = 'invalid'`
- **THEN** Postgres rejects the insert with a CHECK constraint violation error.

#### Scenario: A new migration captures the column additions

- **WHEN** a developer edits `db/schema/events.ts` to add a new column and runs `pnpm db:generate`
- **THEN** a new SQL file is created under `db/migrations/` adding the column with the right type and constraints, and `pnpm db:migrate` applies it without error.

### Requirement: `categories` table exists with `id`, `name`, `slug`

The Drizzle schema SHALL define a `categories` table at `db/schema/categories.ts` with three columns: `id` (uuid, primary key, default `gen_random_uuid()`), `name` (text, NOT NULL, UNIQUE), `slug` (text, NOT NULL, UNIQUE). The schema index SHALL re-export the `categories` table from `db/schema/index.ts`. A new Drizzle migration SHALL create the table on `pnpm db:migrate`.

#### Scenario: A category is inserted and queried

- **WHEN** a developer inserts a row into `categories` with `name = "Workshop"` and `slug = "workshop"`
- **THEN** the row is queryable via Drizzle, the `name` and `slug` are both unique, and the inferred TypeScript type matches the columns.

#### Scenario: A duplicate slug is rejected

- **WHEN** a developer attempts to insert two rows into `categories` with the same `slug`
- **THEN** Postgres rejects the second insert with a unique-constraint violation error.

### Requirement: `event_categories` join table enables M2M between events and categories

The Drizzle schema SHALL define an `event_categories` join table at `db/schema/event-categories.ts` with three columns: `eventId` (uuid, NOT NULL, foreign key to `events.id` with `ON DELETE CASCADE`), `categoryId` (uuid, NOT NULL, foreign key to `categories.id` with `ON DELETE CASCADE`), and a composite primary key on `(eventId, categoryId)`. The schema index SHALL re-export the `eventCategories` table from `db/schema/index.ts`. A new Drizzle migration SHALL create the table on `pnpm db:migrate`.

#### Scenario: An event is tagged with two categories

- **WHEN** a developer inserts two rows into `event_categories` for the same `eventId` with different `categoryId`s
- **THEN** both rows persist, the event's M2M categories list (joined via the `event_categories` and `categories` tables) contains both categories, and a query that filters by one of the `slug`s returns the event.

#### Scenario: Deleting an event cascades to its `event_categories` rows

- **WHEN** a developer deletes an event row
- **THEN** Postgres also deletes every `event_categories` row that referenced that event (via the `ON DELETE CASCADE` foreign key), and no orphan `event_categories` rows remain.

#### Scenario: Deleting a category cascades to its `event_categories` rows

- **WHEN** a developer deletes a category row
- **THEN** Postgres also deletes every `event_categories` row that referenced that category, and no orphan `event_categories` rows remain.

#### Scenario: A query joins events to categories through the join table

- **WHEN** the events service issues a Drizzle query that joins `events` → `eventCategories` → `categories`
- **THEN** the result set includes every (event, category) pair where the event is tagged with that category, and an event with N categories produces N rows in the join result.

### Requirement: `registrations` table exists with booking, ownership, status, and per-event attendee columns

The Drizzle schema SHALL define a `registrations` table at `db/schema/registrations.ts` with the following columns: `id` (uuid, primary key, default `gen_random_uuid()`), `userId` (uuid, NOT NULL, foreign key to `profiles.id` with `ON DELETE CASCADE`), `eventId` (uuid, NOT NULL, foreign key to `events.id` with `ON DELETE CASCADE`), `registrationNumber` (text, NOT NULL, UNIQUE — short human-readable id of the form `PKU-{year}-{nanoid(6)}`), `attendeeName` (text, NOT NULL — the per-event attendee name, separate from the user's profile name so the same user can register for different events under different names), `attendeePhone` (text, NOT NULL — the per-event attendee phone), `status` (text, NOT NULL, default `'confirmed'`, CHECK constraint in `'confirmed' | 'cancelled' | 'attended' | 'no_show'`), `createdAt` (timestamptz, NOT NULL, default now()), `updatedAt` (timestamptz, NOT NULL, default now()). A unique constraint SHALL be enforced on `(userId, eventId)`. The schema index SHALL re-export the `registrations` table from `db/schema/index.ts`. A new Drizzle migration SHALL create the table on `pnpm db:migrate`.

#### Scenario: A registration is inserted with the full shape

- **WHEN** a developer inserts a row into `registrations` with `userId`, `eventId`, `registrationNumber`, `attendeeName`, and `attendeePhone`
- **THEN** the insert succeeds; the unique constraint on `(userId, eventId)` is enforced; the `status` defaults to `'confirmed'`; the `createdAt` and `updatedAt` default to now.

#### Scenario: A duplicate `(userId, eventId)` is rejected

- **WHEN** a developer attempts to insert two `registrations` rows with the same `(userId, eventId)`
- **THEN** the second insert fails with a unique-constraint violation; only the first row persists.

#### Scenario: Deleting a user cascades to their registrations

- **WHEN** a developer deletes a `profiles` row
- **THEN** Postgres also deletes every `registrations` row that referenced that user (via the `ON DELETE CASCADE` foreign key), and no orphan `registrations` rows remain.

#### Scenario: Deleting an event cascades to its registrations

- **WHEN** a developer deletes an `events` row
- **THEN** Postgres also deletes every `registrations` row that referenced that event (via the `ON DELETE CASCADE` foreign key), and no orphan `registrations` rows remain.

### Requirement: `events` table gains `registrationClosesAt` column

The Drizzle schema SHALL add a `registrationClosesAt` column to the `events` table: type `timestamp with timezone`, NULL allowed, no default. The new column is added to the existing `events` table via a Drizzle migration (the migration is auto-generated and applied on `pnpm db:migrate`).

#### Scenario: An event is created without a registration deadline

- **WHEN** a developer inserts a row into `events` without specifying `registrationClosesAt`
- **THEN** the column is `NULL` in the database and the event is bookable up to its `startsAt`.

#### Scenario: An event is created with a registration deadline

- **WHEN** a developer inserts a row into `events` with `registrationClosesAt = "2026-10-20T23:59:00+07:00"`
- **THEN** the column is set to that value; the booking action rejects bookings with `registrationClosesAt` in the past.

### Requirement: App-owned `users` and `oauth_accounts` tables

The Drizzle schema SHALL define a `users` table at `db/schema/users.ts` with `id` (uuid, primary key, default `gen_random_uuid()`), `email` (text, NOT NULL), `email_verified` (boolean, NOT NULL, default false), and `created_at` (timestamptz, NOT NULL, default now()). Email uniqueness SHALL be **case-insensitive**: the app stores the normalized (trimmed, lower-cased) email, and the schema enforces uniqueness on that value — either a `UNIQUE` constraint on the normalized column or a unique index on `lower(email)`. Two sign-ins for the same mailbox in different casing MUST NOT be able to create two `users` rows. It SHALL define an `oauth_accounts` table at `db/schema/oauth-accounts.ts` with `provider` (text, NOT NULL), `provider_uid` (text, NOT NULL — the OIDC `sub`), `user_id` (uuid, NOT NULL, FK → `users.id`, `ON DELETE CASCADE`), and a UNIQUE constraint on `(provider, provider_uid)`. Both tables SHALL be re-exported from `db/schema/index.ts`. The former `db/auth-ref.ts` shim (`pgSchema("auth").table("users")`) SHALL be removed.

#### Scenario: A user and linked account are created on first sign-in

- **WHEN** the OIDC callback provisions a new identity with `sub = "abc"` and `email = "rina@example.com"`
- **THEN** a `users` row with that email and an `oauth_accounts` row `(provider, "abc", users.id)` exist, and the pair `(provider, provider_uid)` is unique

#### Scenario: A duplicate linked account is rejected

- **WHEN** an insert attempts a second `oauth_accounts` row with the same `(provider, provider_uid)`
- **THEN** Postgres rejects it with a unique-constraint violation

#### Scenario: Case-different emails cannot create two users

- **WHEN** a `users` row exists with normalized email `ayu@pku.dev` and an insert attempts `Ayu@Pku.dev`
- **THEN** the normalized value collides and the database rejects the second insert (case-insensitive uniqueness), so only one identity exists

#### Scenario: No `auth` schema reference remains

- **WHEN** the schema is inspected
- **THEN** no table references `auth.users` and `db/auth-ref.ts` does not exist

### Requirement: Migration history applies cleanly to an empty self-hosted Postgres

The migration history SHALL apply top-to-bottom against a fresh, empty, plain Postgres (`postgres:16`) with no Supabase objects. The current history is Supabase-coupled and cannot: `0000_init.sql` adds `profiles.id` as a foreign key to `auth.users`, and `0001` creates RLS policies / the `handle_new_user` trigger against the Supabase `auth` schema, `auth.uid()`, and the `authenticated` role — none of which exist on a plain Postgres, so `pnpm db:migrate` fails on `0000`/`0001` before any later repair migration is reached. A **later re-point/drop migration is therefore not sufficient**; the change SHALL instead **baseline the history** — squash/rewrite the Drizzle migrations into a clean baseline generated from the final self-hosted schema (`users`, `oauth_accounts`, `sessions`, `profiles` FK → `public.users`, no RLS, no `auth` references) — so a fresh `pnpm db:migrate` succeeds end-to-end. Because the migration is greenfield (no data to preserve), rewriting history is acceptable.

#### Scenario: Fresh migrate succeeds on empty Postgres

- **WHEN** `pnpm db:migrate` runs against an empty `postgres:16` database with no `auth` schema
- **THEN** every migration applies without error and the resulting schema contains `users`, `oauth_accounts`, `sessions`, and a `profiles` table whose `id` FK references `public.users`

#### Scenario: No migration references Supabase objects

- **WHEN** the migration SQL under `db/migrations/` is inspected after the baseline
- **THEN** no migration references `auth.users`, `auth.uid()`, the `authenticated` role, or a `handle_new_user` trigger

### Requirement: DB-backed `sessions` table

The Drizzle schema SHALL define a `sessions` table at `db/schema/sessions.ts` with `id` (text, primary key — the stored session identifier, a hash of the cookie token), `user_id` (uuid, NOT NULL, FK → `users.id`, `ON DELETE CASCADE`), `expires_at` (timestamptz, NOT NULL — set by the app to 6 hours after creation), and `created_at` (timestamptz, NOT NULL, default now()), with an index on `user_id`. The table SHALL be re-exported from `db/schema/index.ts`. The raw session token SHALL NOT be stored — only its hash — so a database read cannot reconstruct a live cookie. Expired rows SHALL be removed on encounter (a lookup that finds an expired row deletes it); a periodic sweep is optional.

#### Scenario: A session is created and looked up

- **WHEN** the callback creates a session and later `hooks.server.ts` looks it up by the hashed id from the cookie
- **THEN** the row is found, `expires_at` is in the future, and the associated `user_id` resolves the current user

#### Scenario: Deleting a user cascades to their sessions

- **WHEN** a `users` row is deleted
- **THEN** Postgres deletes every `sessions` row referencing that user, leaving no orphans

#### Scenario: The stored id is not the raw cookie token

- **WHEN** the `sessions` table is inspected
- **THEN** the stored `id` is a hash, not the plaintext token held by the browser cookie
