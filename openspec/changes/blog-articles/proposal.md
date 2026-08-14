## Why

Platform komunitas Pekanbaru belum memiliki kanal untuk berbagi pengetahuan dalam bentuk artikel panjang. Saat ini hanya ada events dan announcements — tidak ada ruang bagi anggota komunitas untuk menulis, berbagi ide, atau mendokumentasikan pengalaman. Fitur blog multi-author dengan editorial workflow memungkinkan komunitas memproduksi konten yang bisa ditemukan lewat mesin pencari (SEO) maupun mesin AI (GEO).

## What Changes

- **Fitur tulis artikel** — semua user yang login dapat membuat dan mengedit draft artikel
- **Editorial workflow** — artikel harus melalui review editor sebelum tayang di public (`draft → in_review → published`)
- **Role system berbasis DB** — menggantikan `ADMIN_EMAILS` env allow-list dengan kolom `role` di tabel `profiles` (`user` | `editor` | `admin`). **BREAKING**: `ADMIN_EMAILS` env var tidak lagi digunakan sebagai sumber kebenaran; admin pertama di-seed lewat migrasi atau skrip seed
- **Public blog** — halaman `/blog` dan `/blog/[slug]` di-render SSR, SEO-ready dengan meta tags, Open Graph, JSON-LD Article schema, dan canonical URL
- **Slug otomatis + dedup** — slug di-generate dari judul saat pertama save; duplikat mendapat suffix angka (`-2`, `-3`, dst); slug bisa diedit manual
- **Redirect slug** — saat slug artikel yang sudah published diubah, slug lama disimpan di `post_slug_redirects` dan di-redirect 301 ke slug baru agar backlink tidak mati
- **Cover image opsional** — penulis bisa upload cover image; kalau kosong, ditampilkan placeholder
- **Sitemap + RSS** — `/sitemap.xml` diperluas dengan URL artikel; ditambah `/blog/rss.xml` untuk crawlers AI (Perplexity, ChatGPT, dll)
- **Area penulis** — route `/my-articles` (auth-guarded) untuk mengelola artikel sendiri
- **Area editor/admin** — route `/admin/articles` untuk review queue dan manajemen semua artikel

## Capabilities

### New Capabilities

- `blog-articles`: Fitur artikel multi-author dengan editorial workflow (`draft → in_review → published`), public SSR reader, slug generation + dedup + redirect, cover image, SEO/GEO signals (JSON-LD Article, OG, RSS)
- `user-roles`: Role system berbasis DB di tabel `profiles` (`user` | `editor` | `admin`), menggantikan `ADMIN_EMAILS` env allow-list; fungsi `isAdmin()` dan `isEditor()` baca dari DB

### Modified Capabilities

- `drizzle-integration`: Skema `posts` diubah (tambah `status`, `cover_image_url`, `updated_at`, `reviewed_by`, `reviewed_at`, `review_note`; `published_at` menjadi nullable); tabel `post_slug_redirects` ditambah; kolom `role` ditambah ke `profiles`

## Impact

**Schema / DB**

- `db/schema/profiles.ts` — tambah kolom `role` enum
- `db/schema/posts.ts` — ubah `published_at` jadi nullable, tambah 5 kolom baru
- `db/schema/post-slug-redirects.ts` — tabel baru
- Migrasi Drizzle baru diperlukan

**Server**

- `src/lib/server/auth/admin.ts` — `isAdmin()` beralih dari env ke DB lookup; tambah `isEditor()` dan `requireEditor()`
- `src/lib/server/articles/` — service baru: CRUD artikel, slug gen + dedup, redirect insert
- `src/lib/server/storage/` — tambah `uploadArticleCover()` (analog `uploadEventBanner()`)

**Routes**

- `src/routes/blog/` — halaman public baru (SSR)
- `src/routes/my-articles/` — area penulis (auth-guarded)
- `src/routes/admin/articles/` — area editor + admin
- `src/routes/sitemap.xml/+server.ts` — extend dengan artikel
- `src/routes/blog/rss.xml/+server.ts` — feed baru

**Features**

- `src/lib/features/articles/` — feature slice baru (components, services, types, barrel)
- `src/lib/features/admin/nav.ts` — tambah entry "Artikel" ke `NAV_ITEMS`

**Auth guard**

- `src/hooks.server.ts` — tambah `/my-articles` ke `GUARDED_PREFIXES`
- `src/routes/admin/+layout.server.ts` — perluasan guard untuk role editor

**Dependencies**

- Tidak ada dependensi npm baru; `marked` + `isomorphic-dompurify` sudah ada untuk Markdown; `@lucide/svelte` sudah ada untuk ikon
