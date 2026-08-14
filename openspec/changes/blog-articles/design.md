## Context

SvelteKit app dengan Drizzle ORM + Postgres self-hosted. Auth via OIDC, session di DB, guard via `hooks.server.ts` `GUARDED_PREFIXES`. Admin sekarang pakai `ADMIN_EMAILS` env allow-list di `src/lib/server/auth/admin.ts` — kode sudah punya seam eksplisit untuk migrasi ke DB-backed RBAC. Markdown rendering sudah ada di `src/lib/server/markdown.ts` (marked + DOMPurify). File upload sudah ada di `src/lib/server/storage/` (local disk, UUID filename, `/uploads/[file]` serving route). Tabel `posts` sudah ada di schema tapi belum lengkap. Pattern feature slice sudah mapan lewat `src/lib/features/events/`.

## Goals / Non-Goals

**Goals:**

- Multi-author blog dengan editorial workflow (`draft → in_review → published`)
- Role system berbasis DB menggantikan env allow-list — satu source of truth
- Public reader SSR penuh dengan SEO + GEO signals (JSON-LD Article, OG, canonical, RSS)
- Slug otomatis dari judul, dedup dengan suffix angka, bisa edit manual, redirect 301 saat slug berubah post-publish
- Cover image opsional dengan placeholder fallback
- Area penulis (`/my-articles`) dan area editor+admin (`/admin/articles`)

**Non-Goals:**

- Real-time collaborative editing
- Comment / discussion pada artikel
- Notifikasi (email atau in-app) saat artikel disubmit atau di-review
- Rich text WYSIWYG editor — Markdown cukup
- Multi-tenant atau per-category permission

## Decisions

### 1. Role disimpan di `profiles.role`, bukan tabel terpisah

**Pilihan:** kolom `role enum` di `profiles` vs tabel `user_roles` many-to-many.

**Keputusan:** kolom di `profiles`.

**Alasan:** Komunitas lokal tidak butuh multi-role per user. Single query untuk auth check. Seam di `admin.ts` sudah mengantisipasi ini ("env allow-list → role lookup"). Tabel terpisah bisa ditambah nanti kalau muncul kebutuhan nyata.

**Migrasi ADMIN_EMAILS:** `isAdmin()` diubah menjadi query `profiles.role === 'admin'`. Env var `ADMIN_EMAILS` deprecated tapi dipertahankan sebagai fallback sementara di development agar tidak ada downtime — dihapus di change berikutnya setelah semua admin di-seed ke DB.

---

### 2. Status post sebagai enum kolom, bukan soft-delete `publishedAt` saja

**Pilihan:** gunakan `publishedAt IS NULL` sebagai proxy status vs kolom `status` eksplisit.

**Keputusan:** kolom `status: 'draft' | 'in_review' | 'published' | 'archived'`.

**Alasan:** `in_review` tidak bisa direpresentasikan lewat `publishedAt` saja. Status eksplisit membuat query lebih ekspresif dan filter di admin lebih mudah. `publishedAt` tetap ada tapi dijadikan nullable — diisi hanya saat status berubah ke `published`, dikosongkan saat di-unpublish.

---

### 3. Slug redirect di tabel `post_slug_redirects`, bukan middleware regex

**Pilihan:** tabel DB vs array redirect di config vs middleware pattern-match.

**Keputusan:** tabel `post_slug_redirects` dengan FK ke `posts`.

**Alasan:** Redirect berbasis DB bisa di-audit, bisa di-query, bisa di-expire. Jumlah redirect tidak terbatas tanpa perlu deploy ulang. Route `/blog/[slug]/+page.server.ts` cek tabel ini saat post tidak ditemukan → 301 ke slug baru. Kalau post dihapus, redirect cascade-delete ikut.

---

### 4. Server-only slug generation, bukan client-side

**Pilihan:** generate slug di browser saat user mengetik judul vs generate di server saat pertama save.

**Keputusan:** generate di server saat pertama save draft.

**Alasan:** Dedup check butuh akses DB — tidak bisa dilakukan client-side secara reliable. Slug preview di UI bisa dirender dari judul secara lokal (pure function tanpa DB call), tapi slug final dikunci server. Ini mencegah race condition dua user save judul yang sama secara bersamaan.

---

### 5. Cover image ikut pola `uploadEventBanner` yang sudah ada

**Pilihan:** reuse storage layer yang ada vs upload ke object storage eksternal.

**Keputusan:** reuse `src/lib/server/storage/` — tambah fungsi `uploadArticleCover()`.

**Alasan:** Infrastruktur sudah ada dan proven. Tidak ada kebutuhan CDN untuk komunitas lokal saat ini. Object storage bisa ditambah nanti dengan mengganti implementasi di satu tempat.

---

### 6. RSS feed di `/blog/rss.xml`

**Pilihan:** RSS 2.0 vs Atom vs JSON Feed.

**Keputusan:** RSS 2.0.

**Alasan:** RSS 2.0 paling luas didukung oleh AI crawlers (Perplexity, ChatGPT web browsing, dll) dan feed readers. Pola implementasi identik dengan `sitemap.xml` yang sudah ada — `+server.ts` yang return `Response` dengan `Content-Type: application/rss+xml`.

---

### 7. Feature slice di `src/lib/features/articles/`

Mengikuti pola `events` yang sudah mapan: `components/`, `services/`, `types.ts`, `index.ts` barrel. Server-only queries di `src/lib/server/articles/`. Route files tetap tipis — hanya orchestrate load + action, tidak ada domain logic.

## Risks / Trade-offs

**[Risk] Migrasi `ADMIN_EMAILS` → DB role membutuhkan seed admin pertama** → Mitigasi: skrip seed diperluas untuk insert admin row; dokumentasi di `.env.example` diupdate; env var dipertahankan sebagai fallback di dev mode.

**[Risk] `publishedAt` dari `notNull()` ke nullable adalah breaking schema change** → Mitigasi: Drizzle migration dijalankan sebelum deploy; existing data: semua row existing sudah punya `publishedAt` terisi, jadi nullable tidak merusak data lama. Status di-backfill ke `'published'` untuk semua row existing.

**[Risk] Slug redirect tabel tumbuh tanpa batas** → Mitigasi: redirect di-cascade delete saat post dihapus. Tidak perlu pruning untuk skala komunitas lokal.

**[Risk] Markdown body bisa sangat panjang** → Mitigasi: tidak ada limit di DB (text column). UI bisa tambah karakter counter sebagai UX hint tapi tidak enforce limit di server — konten editorial tidak boleh dipotong paksa.

**[Risk] Cover image disk storage** → Mitigasi: sama dengan event banner — batas 2MB per file, format PNG/JPEG/WebP. Monitoring disk adalah ops concern di luar scope ini.

## Migration Plan

1. Jalankan Drizzle migration baru: tambah `profiles.role`, ubah `posts` schema, buat `post_slug_redirects`
2. Backfill data: `UPDATE profiles SET role = 'user'` untuk semua row; `UPDATE posts SET status = 'published'` untuk semua row existing (semua post lama langsung published)
3. Seed minimal satu admin: update profil admin lewat `pnpm db:seed` atau query manual
4. Deploy kode baru — `isAdmin()` sekarang baca dari DB
5. Verifikasi `/admin` masih accessible untuk admin
6. Remove `ADMIN_EMAILS` env var dari `.env.example` di change berikutnya (tidak di change ini — bertahap)

**Rollback:** revert migration (Drizzle down migration), revert kode ke commit sebelumnya. `ADMIN_EMAILS` tetap berfungsi karena fallback dipertahankan.
