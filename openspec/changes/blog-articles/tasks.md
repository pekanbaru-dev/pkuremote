## 1. Database Schema & Migration

- [x] 1.1 Tambah kolom `role` enum (`'user' | 'editor' | 'admin'`) NOT NULL default `'user'` ke `db/schema/profiles.ts`
- [x] 1.2 Ubah `posts.published_at` dari `notNull().defaultNow()` menjadi nullable di `db/schema/posts.ts`
- [x] 1.3 Tambah kolom `cover_image_url` (nullable text), `status` enum (`'draft'|'in_review'|'published'|'archived'`) NOT NULL default `'draft'`, `updated_at` (timestamp NOT NULL defaultNow()), `reviewed_by` (nullable FK → `profiles.id`), `reviewed_at` (nullable timestamp), `review_note` (nullable text) ke `db/schema/posts.ts`
- [x] 1.4 Buat `db/schema/post-slug-redirects.ts` — tabel `post_slug_redirects` dengan `id` uuid PK, `old_slug` text unique NOT NULL, `post_id` FK → `posts.id` ON DELETE CASCADE, `created_at`
- [x] 1.5 Export tabel baru dari `db/schema/index.ts`
- [x] 1.6 Tambah relasi baru ke `db/schema/relations.ts` (`posts → post_slug_redirects`, `posts → profiles` via `reviewed_by`)
- [x] 1.7 Jalankan `pnpm db:generate` untuk generate file migrasi Drizzle
- [x] 1.8 Review file migrasi — pastikan backfill `status = 'published'` untuk posts existing dan `role = 'user'` untuk profiles existing (default constraint sudah cukup untuk kolom baru)
- [x] 1.9 Jalankan `pnpm db:migrate` dan verifikasi semua tabel terbentuk

## 2. Role System & Auth

- [x] 2.1 Update `App.Locals` di `src/app.d.ts` — tambah `role: 'user' | 'editor' | 'admin'` ke tipe user
- [x] 2.2 Update `src/lib/server/auth/session.ts` — load `profiles.role` bersamaan dengan resolve session user sehingga tersedia di `locals.user.role`
- [x] 2.3 Update `src/lib/server/auth/admin.ts` — `isAdmin()` baca `locals.user?.role === 'admin'` dari locals (bukan env); tambah `isEditor(locals)` yang return true untuk `'editor' | 'admin'`; tambah `requireEditor(locals)` analog `requireAdmin()`
- [x] 2.4 Update `src/routes/admin/+layout.server.ts` — ganti `requireAdmin()` dengan guard yang izinkan editor untuk mengakses sub-route artikel, admin untuk semua
- [x] 2.5 Update `src/hooks.server.ts` — tambah `/my-articles` ke `GUARDED_PREFIXES`
- [x] 2.6 Update `db/seed.ts` — pastikan seed user mendapat `role = 'admin'` di profil
- [x] 2.7 Tulis unit tests untuk `isAdmin()`, `isEditor()`, `requireEditor()` di `src/lib/server/auth/admin.test.ts`

## 3. Server Layer — Articles Service

- [x] 3.1 Buat `src/lib/server/articles/` folder dengan `index.ts`, `db-articles.ts`, `slug.ts`
- [x] 3.2 Implementasi `slug.ts` — fungsi `generateSlug(title)` (slugify: lowercase, spasi→dash, strip non-alphanumeric) dan `generateUniqueSlug(title, db, excludeId?)` yang cek DB dan tambah suffix angka jika duplikat
- [x] 3.3 Implementasi `db-articles.ts` — fungsi: `createArticle()`, `updateArticle()`, `getArticleById()`, `getArticleBySlug()`, `getPublishedArticles()` (dengan pagination), `getArticlesByAuthor()`, `submitForReview()`, `approveArticle()`, `rejectArticle()`, `archiveArticle()`, `updateSlugWithRedirect()` (update slug + insert ke `post_slug_redirects`), `findRedirectForSlug()`
- [x] 3.4 Export semua fungsi publik dari `src/lib/server/articles/index.ts`
- [x] 3.5 Tambah `uploadArticleCover()` dan `deleteArticleCover()` ke `src/lib/server/storage/index.ts` (analog `uploadEventBanner`)
- [x] 3.6 Tulis unit tests untuk `generateSlug()` dan `generateUniqueSlug()` di `src/lib/server/articles/slug.test.ts`

## 4. Feature Slice — `src/lib/features/articles/`

- [x] 4.1 Buat struktur folder: `components/`, `services/`, `types.ts`, `index.ts`
- [x] 4.2 Definisikan types di `types.ts` — `Article`, `ArticleStatus`, `ArticleWithAuthor`, `ArticleCardData`
- [x] 4.3 Buat `services/json-ld.ts` — fungsi `articleJsonLd(article, siteUrl)` return JSON-LD Article schema, `breadcrumbJsonLd(post, siteUrl)` return JSON-LD BreadcrumbList, `articleListJsonLd(articles, siteUrl)` return JSON-LD ItemList
- [x] 4.4 Buat `components/article-card.svelte` — card untuk listing (cover image/placeholder, judul, excerpt, author, tanggal)
- [x] 4.5 Buat `components/article-editor.svelte` — form tulis/edit artikel (judul, slug, excerpt, body textarea Markdown, cover image upload, tombol simpan draft / submit review)
- [x] 4.6 Buat `components/article-status-badge.svelte` — badge visual untuk `draft | in_review | published | archived`
- [x] 4.7 Buat `components/article-review-form.svelte` — form approve/reject untuk editor (textarea catatan review, dua tombol aksi)
- [x] 4.8 Export public surface dari `index.ts` dengan docstring barrel contract

## 5. Routes — Area Penulis `/my-articles`

- [x] 5.1 Buat `src/routes/my-articles/+page.server.ts` — load daftar artikel milik `locals.user` (semua status), urutkan `created_at` desc
- [x] 5.2 Buat `src/routes/my-articles/+page.svelte` — listing artikel milik user dengan status badge dan tombol aksi (edit, submit review)
- [x] 5.3 Buat `src/routes/my-articles/new/+page.server.ts` — action `create` untuk membuat artikel baru (generate slug, simpan draft)
- [x] 5.4 Buat `src/routes/my-articles/new/+page.svelte` — render `ArticleEditor` untuk artikel baru
- [x] 5.5 Buat `src/routes/my-articles/[id]/+page.server.ts` — load artikel by ID (cek ownership, 403 jika bukan milik user), actions: `update`, `submitReview`, `uploadCover`
- [x] 5.6 Buat `src/routes/my-articles/[id]/+page.svelte` — render `ArticleEditor` dengan data existing + `ArticleStatusBadge` + catatan review jika ada

## 6. Routes — Area Editor & Admin `/admin/articles`

- [x] 6.1 Buat `src/routes/admin/articles/+page.server.ts` — load semua artikel dengan filter status (default: `in_review`), guard `requireEditor(locals)`
- [x] 6.2 Buat `src/routes/admin/articles/+page.svelte` — tabel artikel dengan filter status, kolom: judul, author, status, tanggal, aksi
- [x] 6.3 Buat `src/routes/admin/articles/[id]/+page.server.ts` — load artikel by ID, actions: `approve`, `reject`, `archive` (archive hanya admin), `updateSlug`
- [x] 6.4 Buat `src/routes/admin/articles/[id]/+page.svelte` — tampilkan artikel (preview body HTML), `ArticleReviewForm`, info metadata
- [x] 6.5 Update `src/lib/features/admin/nav.ts` — tambah `{ label: "Artikel", href: "/admin/articles", icon: FileText }` ke `NAV_ITEMS`

## 7. Routes — Public Blog `/blog`

- [x] 7.1 Buat `src/routes/blog/+page.server.ts` — load `getPublishedArticles()` dengan pagination (page query param), return articles + total + page info
- [x] 7.2 Buat `src/routes/blog/+page.svelte` — listing artikel dengan `ArticleCard`, pagination, JSON-LD ItemList di `<svelte:head>`
- [x] 7.3 Buat `src/routes/blog/[slug]/+page.server.ts` — load artikel by slug; jika tidak ditemukan cek `post_slug_redirects` → redirect 301; jika artikel bukan `published` → 404; return article + `bodyHtml` (renderMarkdown) + JSON-LD
- [x] 7.4 Buat `src/routes/blog/[slug]/+page.svelte` — tampilkan artikel: cover image/placeholder, judul, author, tanggal, body HTML, meta tags SEO lengkap di `<svelte:head>` (title, description, canonical, OG tags, JSON-LD Article + Breadcrumb)

## 8. RSS Feed & Sitemap

- [x] 8.1 Buat `src/routes/blog/rss.xml/+server.ts` — GET handler return RSS 2.0 feed dengan 20 artikel published terbaru, `Content-Type: application/rss+xml`, `Cache-Control: max-age=3600`
- [x] 8.2 Update `src/routes/sitemap.xml/+server.ts` — tambah URL artikel published ke array `urls` dengan `lastmod` dari `updated_at`
- [x] 8.3 Update `src/routes/robots.txt/+server.ts` — pastikan `/blog/` dan `/blog/rss.xml` ter-allow (sudah `Allow: /` tapi verifikasi)

## 9. Verifikasi & Polish

- [x] 9.1 Jalankan `pnpm check` — pastikan tidak ada type errors di semua file baru
- [x] 9.2 Jalankan `pnpm lint` — pastikan tidak ada ESLint violations
- [x] 9.3 Jalankan `pnpm test:unit` — semua unit tests pass (slug gen, auth, storage)
- [x] 9.4 Verifikasi manual: buat artikel baru sebagai user → submit → approve sebagai editor → cek `/blog/[slug]` tampil dengan meta tags lengkap
- [x] 9.5 Verifikasi redirect: ubah slug artikel published → akses slug lama → pastikan 301 redirect bekerja
- [x] 9.6 Verifikasi RSS: akses `/blog/rss.xml` → valid XML dengan artikel published
- [x] 9.7 Verifikasi sitemap: akses `/sitemap.xml` → mengandung URL artikel
- [x] 9.8 Verifikasi placeholder: artikel tanpa cover image → placeholder tampil di card dan detail page
