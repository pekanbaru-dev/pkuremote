# Design: Setup: Project infrastructure (Supabase, Drizzle)

## Context

The repo today is a SvelteKit 5 + Tailwind v4 FE that renders a single landing page. There is no DB, no auth, and no `.env.example`. The next features (events, announcements, posts, and an admin surface) all need a database and an auth provider, but the project's architecture decision is **FE + Supabase only** — no separate backend service.

This change stands up the data layer for that stack:

- **Supabase** is the single source of truth for the database, auth, storage, and realtime — both in development and in production. In dev we point at a free-tier Supabase Cloud project; in production we point at the same project (or a sibling). No separate backend process.
- **Drizzle ORM** is the FE's typed DB layer. It connects to the same Postgres database that Supabase manages and gives the SvelteKit routes and `+page.server.ts` loaders a typed query API.
- The FE talks to Supabase for auth and storage through `@supabase/supabase-js`. Drizzle is **not** used for auth — auth flows stay on the Supabase client because GoTrue handles sessions, refresh tokens, and RLS correctly.

## Goals / Non-Goals

**Goals:**

- A new contributor can create a free Supabase Cloud project, copy its URL and keys into `.env`, and run `pnpm db:migrate && pnpm db:seed` — no Docker, no local services.
- `pnpm db:migrate` applies the initial schema to the contributor's Supabase Postgres using Drizzle.
- `pnpm db:seed` populates one row in each content table so Drizzle Studio and the (future) FE have something to show.
- `pnpm db:studio` opens Drizzle Studio against the same Supabase Postgres for local DB inspection.
- A `.env.example` documents every variable the FE and the Drizzle scripts need.
- An initial schema (`profiles`, `events`, `announcements`, `posts`) so migrations, seed, and Drizzle Studio all have something real to point at.

**Non-Goals:**

- No local Docker stack. No `docker-compose.yml`. No Kong, GoTrue, PostgREST, Realtime, Storage, or Inbucket containers to manage.
- No backend service, BFF, or API gateway. The SvelteKit FE is the only Node process.
- No custom auth server, no NextAuth/Clerk/Lucia. Auth is Supabase Auth via `@supabase/supabase-js`.
- No Redis, no queues, no cron runner.
- No RLS policies authored here. The initial schema ships tables only; the first feature change that needs row-level security (e.g. an admin-only announcement write path) will add policies.

## Decisions

### D1. Supabase Cloud free tier for dev — not a local Docker stack.

- **Choice:** Each contributor creates a free-tier Supabase project (one-time, ~2 minutes at supabase.com), copies the project URL and the anon / service_role / database URL into `.env`, and runs `pnpm db:migrate && pnpm db:seed`. There is no `docker-compose.yml` in this repo.
- **Why:** The Supabase self-hosted stack is 10+ Docker services (Postgres, GoTrue, PostgREST, Realtime, Storage, Studio, Kong, Inbucket, Logflare, Supavisor, imgproxy, postgres-meta), several gigabytes of images, slow first start, and a moving target of version pins. Supabase Cloud free tier gives the same APIs as a paid project, with a real Postgres, real Auth, real Storage, and a hosted Studio — all for free, with zero local infra. The code in this repo is identical between dev and prod: same `@supabase/supabase-js` client, same Drizzle config, same `.env` shape. The only thing that changes between dev and prod is the URL and the keys.
- **Trade-off:** Contributors need a Supabase account and an internet connection to migrate and seed. For a community site where every contributor likely already has a Supabase account (or is happy to create one), this is a much lower-friction path than running a full local stack.
- **Alternative considered:** Local Docker stack with all 12+ services. Rejected: too much disk, too slow to start, too much version drift, and offers no benefit over Cloud free tier for a project this size.
- **Alternative considered:** Local Docker with only `supabase/postgres` (1 image) for the database, and Supabase Cloud for Auth/Storage/Realtime. Rejected: still requires Docker, and the "1 local + N cloud" mix is more confusing than "all cloud".

### D2. Use Drizzle ORM in the SvelteKit FE — not as a separate service.

- **Choice:** Drizzle lives in `src/lib/server/db/` (the `server` segment is required by SvelteKit so it never leaks into the client bundle). The Drizzle client is a module-singleton guarded by SvelteKit's server-only rules.
- **Why:** Gives `+page.server.ts` and form actions a typed query API (`db.select().from(events).where(eq(events.id, id))`) without an HTTP hop. Same database Supabase uses, so RLS still applies when queries run with the user's session JWT (using the `postgres` driver with the user's access token is a later-feature concern; this change only wires the service-role connection for migrations, seed, and admin queries).
- **Alternative considered:** Raw `@supabase/supabase-js` for everything. Rejected: loses compile-time column/typing guarantees, easy to ship a query that breaks at runtime. The Supabase JS client is still used for auth, storage, and any realtime subscription — Drizzle does not replace it.

### D3. Two database URLs: `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).

- **Choice:** `DATABASE_URL` points at the Supabase transaction pooler (Supavisor, port 6543) and is used at runtime. `DIRECT_URL` points at the project's direct Postgres connection (port 5432) and is used by `drizzle-kit` for migrations and by the seed script.
- **Why:** Pooled connections cannot run DDL (migrations). Keeping them separate avoids "prepared statement already exists" and lock errors during `pnpm db:migrate`.
- **Alternative considered:** Single URL. Rejected: migration errors when running against a pooler.

### D4. Drizzle migrations live in `db/migrations/`, schema in `db/schema/`, seed in `db/seed.ts`.

- **Choice:** Keep Drizzle artifacts at the repo root under `db/` so they are easy to find and not nested inside `src/`. The Drizzle _client_ (the runtime query API used by the FE) lives at `src/lib/server/db/client.ts` — that one is server-only.
- **Why:** Migrations and schema are build-time / dev-time artifacts; the client is runtime. Splitting them mirrors this and lets the FE import `$lib/server/db` cleanly while the rest of the repo touches `db/` only from scripts.

### D5. Initial schema is intentionally small.

- **Choice:** Ship `profiles` (linked 1:1 to `auth.users`), `events` (title, starts_at, location, excerpt, body), `announcements` (title, body, published_at), `posts` (title, slug, author_id → profiles, excerpt, body, published_at). No tags, no categories, no comments, no media tables.
- **Why:** The landing page in `src/routes/+page.svelte` currently renders dummy data for exactly these four content shapes. The first feature change will replace the dummy data with real queries; we want the tables to match what the page already shows so that change is a small, focused diff.
- **Alternative considered:** Starting with one table (e.g. `events`) and adding the rest later. Rejected: the first feature change will want to query all four, and re-running migrations across the team right after merge is friction.

### D6. No RLS policies in this change.

- **Choice:** Tables are created with RLS **disabled** for now. The service role key is used by the seed script and by any Drizzle query that runs in `+page.server.ts` until the first auth-gated feature lands.
- **Why:** Adding policies without a real auth flow to test them against produces untested SQL. The first feature that needs per-user access (e.g. "members can RSVP to an event") will add the matching policy in the same change that adds the feature.
- **Trade-off:** Anyone with the `SUPABASE_SERVICE_ROLE_KEY` can read/write every row. Acceptable for local dev against a free-tier project; will be locked down before any production deploy.

### D7. Seed idempotency uses TRUNCATE for tables without a natural unique key, `onConflictDoNothing` for tables that have one.

- **Choice:** `db/seed.ts` uses two strategies:
  - `posts` (unique `slug`) and `profiles` (PK) → `onConflictDoNothing()` on insert.
  - `events` and `announcements` (no natural unique key) → `TRUNCATE` before insert.
- **Why:** The spec says the seed is idempotent and uses `onConflictDoNothing` or equivalent. `onConflictDoNothing` requires a unique constraint or PK to match against; `events` and `announcements` have neither, so without `TRUNCATE` re-running the seed produced duplicate rows. `TRUNCATE-then-insert` is the equivalent for tables that lack a deterministic key, and it's the right semantic for a dev seed (the table should hold exactly the canonical dev rows, no more).
- **Trade-off:** The seed is destructive for `events` and `announcements`. Acceptable for dev; never run against a real dataset. The first feature change that adds real event/announcement CRUD will either add a unique key (e.g. `slug`) and switch to `onConflictDoNothing`, or remove the seed entry for that table.

## Risks / Trade-offs

- **Free-tier Supabase project pauses after 7 days of inactivity.** → The contributor's project is paused (not deleted); unpausing is one click in the dashboard. Documented in the README.
- **Drizzle + Supabase Auth RLS interaction is unverified in this change.** → The first auth-gated feature will explicitly write and test an RLS policy; until then, do not use Drizzle for queries that depend on `auth.uid()`.
- **Service role key in `.env` is a footgun if committed.** → `.gitignore` already excludes `.env` and `.env.*` except `.env.example` and `.env.test`. README reiterates this.
- **No Drizzle `postgres` vs `pg` driver debate here.** → Default to `postgres` (the same driver Supabase's docs recommend for Drizzle). Switch only if a feature change has a concrete reason.
- **Schema changes require either re-running migrations or generating a new one.** → The README documents `pnpm db:generate` (creates a new migration file) and `pnpm db:push` (prototype-only shortcut, does not create a migration).

## Migration Plan

This change is greenfield infrastructure — nothing to migrate from. The "migration" here is the contributor onboarding path:

1. Clone the repo, run `pnpm install`.
2. Create a free-tier Supabase project at supabase.com.
3. Copy the project URL, anon key, service role key, and database URLs from the project's API Settings / Database Settings into `.env` (the `.env.example` documents each variable).
4. `pnpm db:migrate` — applies `db/migrations/`.
5. `pnpm db:seed` — populates dev data.
6. `pnpm dev` — SvelteKit on :5173. Supabase Studio is at the project's dashboard URL; Drizzle Studio via `pnpm db:studio`.

Rollback: drop the schema in Supabase Studio, or create a new Supabase project.

## Open Questions

- None blocking. The first auth-gated feature change will decide the RLS policy pattern (per-user, per-role, etc.) — not relevant yet.
