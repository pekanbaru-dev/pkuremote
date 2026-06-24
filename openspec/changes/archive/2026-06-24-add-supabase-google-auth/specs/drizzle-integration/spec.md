## MODIFIED Requirements

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
