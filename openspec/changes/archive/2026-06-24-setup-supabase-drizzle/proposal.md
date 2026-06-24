# Change: Setup: Project infrastructure (Supabase, Drizzle)

Closes https://github.com/pekanbaru-dev/pkuremote/issues/11

## Why

The site currently ships only the landing page. To build the events, announcements, and posts features (and the admin surface behind them), the FE needs a typed database layer and a working Supabase project that runs the same way on a laptop and in production. Without this, every later change re-invents the connection string, the migration command, and the seed script.

## What Changes

- Add a `.env.example` documenting the Supabase project URL, anon key, service role key, and the two Postgres URLs the FE and Drizzle need.
- Add Drizzle ORM as the FE's typed DB layer: `drizzle.config.ts`, a `db/schema/` folder, `db/migrations/`, a `db/seed.ts`, and npm scripts (`db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`).
- Add a small initial schema (`profiles`, `events`, `announcements`, `posts`, plus the Supabase-managed `auth.users` linkage) so migrations and seed have a real target.
- Document the one-time Supabase Cloud project creation in the README, plus the local `pnpm db:migrate && pnpm db:seed` flow.

**Architecture: FE + Supabase only.** No separate backend service, no local Docker stack, no custom auth server, no Redis, no queues. The SvelteKit FE talks to Supabase directly via `@supabase/supabase-js`; Drizzle is used for typed DB access from the FE only. Dev and prod use the same APIs (Supabase Cloud), so the code is identical — only the URL and keys change.

## Capabilities

### New Capabilities

- `drizzle-integration`: Drizzle ORM setup for the SvelteKit FE — `drizzle.config.ts`, an initial schema (`profiles`, `events`, `announcements`, `posts`), generated migrations under `db/migrations/`, a `db/seed.ts` for dev data, a `db:studio` script for local DB inspection, the `.env.example` with the Supabase URL and keys, and the npm scripts that bind them together.

### Modified Capabilities

None. `landing-page` and `shadcn-components` are unaffected; this change only adds a typed data layer and its dev-time configuration.

## Impact

- **New deps** (devDependencies): `drizzle-orm`, `drizzle-kit`, `postgres` (or `pg`), `tsx` (for the seed script and drizzle-kit). `@supabase/supabase-js` is added as a runtime dependency for the FE.
- **New files**:
  - `.env.example`
  - `drizzle.config.ts`
  - `src/lib/server/db/client.ts` (Drizzle client)
  - `db/schema/{profiles,events,announcements,posts}.ts`
  - `db/schema/index.ts` (re-exports)
  - `db/seed.ts`
  - `db/migrations/0000_init.sql` (generated)
- **Modified files**: `package.json` (new scripts and deps), `README.md` (setup section).
- **External services**: Supabase Cloud (free tier) — each contributor creates a project once. No local Docker, no self-hosted services.
- **Build / CI**: `pnpm check` and `pnpm lint` remain green; no new test wiring in this change (Drizzle queries are exercised by feature changes that follow).
