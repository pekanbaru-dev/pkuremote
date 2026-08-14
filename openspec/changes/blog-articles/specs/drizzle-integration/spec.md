## MODIFIED Requirements

### Requirement: Initial schema covers the landing page's content shapes

Skema di `db/schema/` SHALL mendefinisikan tabel-tabel berikut:

- `profiles` — satu row per row `users`, foreign key `id → users.id` (`ON DELETE CASCADE`, shared 1:1 primary key), kolom `display_name`, kolom nullable `avatar_url`, dan kolom `role` enum (`'user' | 'editor' | 'admin'`) NOT NULL default `'user'`. Row Level Security SHALL NOT diaktifkan pada `profiles`, dan SHALL tidak ada policy berbasis `auth.uid()` — access control ada di `$lib/server/` dan `hooks.server.ts`, bukan di database.
- `events` — `id`, `title`, `starts_at`, `location`, `excerpt`, `body`, `created_at`.
- `announcements` — `id`, `title`, `body`, `published_at`.
- `posts` — `id`, `title`, `slug` (unique), `author_id` (FK → `profiles.id`), `excerpt`, `body`, `cover_image_url` (nullable text), `status` enum (`'draft' | 'in_review' | 'published' | 'archived'`) NOT NULL default `'draft'`, `published_at` (nullable timestamp with timezone), `updated_at` (timestamp with timezone NOT NULL default now()), `reviewed_by` (nullable FK → `profiles.id`), `reviewed_at` (nullable timestamp with timezone), `review_note` (nullable text), `created_at`.
- `post_slug_redirects` — `id` (uuid PK), `old_slug` (text unique NOT NULL), `post_id` (FK → `posts.id` ON DELETE CASCADE), `created_at`.

Setiap tabel SHALL mendeklarasikan primary key (`id` sebagai `uuid` dengan default `gen_random_uuid()`, kecuali `profiles.id` yang sama dengan `users.id`).

#### Scenario: All tables exist after a fresh migrate

- **WHEN** contributor menjalankan `pnpm db:migrate` terhadap database Postgres kosong
- **THEN** tabel `profiles`, `events`, `announcements`, `posts`, dan `post_slug_redirects` ada dan Drizzle Studio menampilkan semuanya

#### Scenario: `profiles` has no RLS

- **WHEN** schema dan migrasi diterapkan
- **THEN** `profiles` memiliki Row Level Security disabled dan tidak ada policy `profiles_select_own`/`profiles_update_own`

#### Scenario: `profiles.id` references the app-owned `users` table

- **WHEN** row `profiles` di-insert
- **THEN** `id`-nya harus cocok dengan `users.id` yang ada (FK references `public.users`, bukan `auth.users`), dan menghapus row `users` cascade ke row `profiles`

#### Scenario: `profiles` memiliki kolom role dengan default user

- **WHEN** row `profiles` baru di-insert tanpa nilai `role`
- **THEN** `role` bernilai `'user'`

#### Scenario: `posts` memiliki kolom status dengan default draft

- **WHEN** row `posts` baru di-insert tanpa nilai `status`
- **THEN** `status` bernilai `'draft'` dan `published_at` bernilai NULL

#### Scenario: `post_slug_redirects` cascade delete saat post dihapus

- **WHEN** row `posts` dihapus
- **THEN** semua row `post_slug_redirects` dengan `post_id` yang sama ikut terhapus

#### Scenario: Seed menghasilkan dataset dev yang dapat digunakan

- **WHEN** contributor menjalankan `pnpm db:seed` terhadap database kosong
- **THEN** tabel `users`, `profiles`, `events`, `announcements`, `posts`, dan `post_slug_redirects` masing-masing berisi minimal satu row dan seed tidak memanggil Supabase API apapun

#### Scenario: Re-running seed aman

- **WHEN** contributor menjalankan `pnpm db:seed` dua kali berturut-turut
- **THEN** run kedua tidak error dan jumlah row tidak berubah
