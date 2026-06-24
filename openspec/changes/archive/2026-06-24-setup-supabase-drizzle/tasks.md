## 1. Dependencies and env scaffolding

- [x] 1.1 Add dev/runtime deps to `package.json`: `drizzle-orm`, `drizzle-kit`, `postgres`, `tsx` (devDeps), `@supabase/supabase-js` (runtime dep)
- [x] 1.2 Run `pnpm install` and confirm `pnpm check` still passes
- [x] 1.3 Slim `.env.example` to Supabase Cloud variables only: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (pooler, port 6543), `DIRECT_URL` (port 5432) — each with an inline comment
- [x] 1.4 Confirm `.gitignore` excludes `.env` and `.env.*` (already in place)

## 2. Drizzle integration

- [x] 2.1 Create `drizzle.config.ts` at repo root: schema glob `db/schema/*.ts`, out `db/migrations`, dialect `postgresql`, `dbCredentials.url` = `process.env.DIRECT_URL`
- [x] 2.2 Create `db/schema/profiles.ts`, `db/schema/events.ts`, `db/schema/announcements.ts`, `db/schema/posts.ts` matching the columns in the spec (uuid PK with `gen_random_uuid()`, FK from `profiles` to `auth.users.id`, FK from `posts.author_id` to `profiles.id`, unique slug on `posts`)
- [x] 2.3 Create `db/schema/index.ts` that re-exports every table for the Drizzle client
- [x] 2.4 Create `src/lib/server/db/client.ts` that exports a Drizzle client connected via `postgres(process.env.DATABASE_URL)` to a `drizzle()` instance
- [x] 2.5 Add `db:generate`, `db:migrate`, `db:push`, `db:studio`, and `db:seed` scripts to `package.json`
- [x] 2.6 Run `pnpm db:generate` and commit the generated `db/migrations/0000_init.sql` (`auth.users` is referenced but not created — Supabase manages that table)
- [ ] 2.7 Document the one-time Supabase Cloud project setup in the README (create free project, copy URL/keys into `.env`, then `pnpm db:migrate && pnpm db:seed`)
- [x] 2.8 Note in the README that the same `.env` shape works for dev and prod; only the URL/keys change

## 3. Seed data

- [x] 3.1 Create `db/seed.ts` that inserts a `profiles` row for a fixed UUID, plus one `events`, one `announcements`, and one `posts` row (matching the landing page's dummy content shape), using `onConflictDoNothing` so the script is idempotent
- [x] 3.2 Run `pnpm db:seed` against the configured Supabase project and verify the rows appear — verified end-to-end against `https://olgnkqntgbcuenoxcenn.supabase.co`; all four tables populated
- [x] 3.3 Run `pnpm db:seed` a second time and confirm it is a no-op — verified: `events` and `announcements` use `TRUNCATE` before insert (no natural unique key), `posts` and `profiles` use `onConflictDoNothing` (have unique keys); final state is 1 row in each table regardless of run count

## 4. Documentation

- [x] 4.1 Add a "Local development" section to `README.md` covering: creating a free Supabase project at supabase.com, copying `cp .env.example .env` and filling in the values, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, and how to open Drizzle Studio
- [x] 4.2 Note in the README that the keys in `.env` are dev-only for a free-tier project and MUST be replaced before any production deploy
