## Context

Lihat proposal.md untuk motivasi. Storage layer saat ini (`src/lib/server/storage/index.ts`) menggunakan Node.js `fs` API secara langsung — semua fungsi bersifat filesystem-specific dan tidak ada abstraksi di antara business logic dan transport layer. Callers (4 route server files) mengimport fungsi-fungsi ini secara langsung dan tidak perlu diubah selama signature publik tetap sama.

Cloudflare R2 menyediakan S3-compatible API. SDK `@aws-sdk/client-s3` dapat digunakan as-is dengan custom `endpoint` dan `region: "auto"`.

## Goals / Non-Goals

**Goals:**

- Ganti backend storage dari local filesystem ke Cloudflare R2
- Pertahankan signature publik dari `src/lib/server/storage/index.ts` agar callers tidak perlu diubah
- Tambah primitif R2 reusable yang dapat dipakai oleh fitur lain di masa depan
- Key-path convention yang konsisten di R2: `banners/events/{uuid}.{ext}`, `banners/articles/{uuid}.{ext}`
- File langsung publik via CDN URL — tidak ada proxy SvelteKit
- Semua R2 env vars terdokumentasi di `.env.example`
- Tambah dukungan presigned PUT URL agar browser dapat upload langsung ke R2 tanpa lewat server
- Tambah halaman admin `/admin/settings` untuk memverifikasi konfigurasi R2 dan test alur upload/list/preview/delete

**Non-Goals:**

- Multipart upload untuk file besar (banner/cover max 2 MiB, tidak perlu)
- Versioning atau lifecycle rules di R2 (di luar scope)
- Backward compat untuk URL `/uploads/` lama di DB
- Local filesystem fallback / emulasi R2 untuk dev
- Konfigurasi R2 yang dapat diubah via UI — konfigurasi tetap read-only dari env vars, tidak disimpan ke DB

## Decisions

### 1. Dua layer: `r2-client.ts` + `r2.ts` di bawah `storage/`

```
src/lib/server/storage/
  r2-client.ts   ← createR2Client() singleton, baca env vars
  r2.ts          ← r2Put() / r2Delete() / r2PublicUrl() — pure transport
  index.ts       ← public API, orchestrate r2.ts + validation
```

**Rationale**: `r2-client.ts` mengisolasi konfigurasi SDK dan env vars. `r2.ts` berisi primitif murni yang tidak tahu soal "banner" atau "article" — reusable untuk fitur lain. `index.ts` tetap menjadi satu-satunya public surface yang diimport callers.

**Alternatif ditolak**: Langsung embed `S3Client` di `index.ts` — membuat primitif tidak reusable dan sulit di-test.

### 2. Singleton S3Client via module-level lazy init

```ts
// r2-client.ts
let _client: S3Client | null = null;
export function getR2Client(): S3Client {
	if (!_client) _client = createR2Client();
	return _client;
}
```

**Rationale**: SvelteKit server-side module state persist selama proses hidup. Singleton menghindari membuat client baru per-request. Lazy init memastikan env vars sudah terbaca sebelum client dibuat.

**Alternatif ditolak**: Top-level `export const client = new S3Client(...)` — akan throw saat module di-load di test environment tanpa env vars.

### 3. Key-path convention dengan prefix per content type

```
banners/events/{uuid}.{ext}
banners/articles/{uuid}.{ext}
```

**Rationale**: Prefix memudahkan future CORS/lifecycle policy per folder, audit trail, dan debugging di R2 dashboard.

### 4. `R2_PUBLIC_URL` sebagai base URL CDN

Public URL dikonfigurasi via env var, bukan di-hardcode. Ini mendukung:

- R2 public subdomain: `https://pub-xxx.r2.dev`
- Custom CDN domain: `https://cdn.pkubersua.com`

`r2PublicUrl(key)` = `${R2_PUBLIC_URL}/${key}` — simple string concat.

### 5. Wajib R2 di semua environment — tidak ada filesystem fallback

`createR2Client()` throw `Error` deskriptif jika env vars tidak di-set. Ini fail-fast yang jelas daripada diam-diam menulis ke disk lokal di production.

### 6. Route `/uploads/[file]` dihapus total

File disajikan langsung dari R2 public URL. Tidak ada proxy. Ini mengurangi latency (tidak ada round-trip SvelteKit) dan menghilangkan attack surface path-traversal di serving route.

### 7. Presigned PUT upload langsung dari browser

Untuk halaman admin settings, upload file dilakukan **langsung dari browser ke R2** menggunakan presigned PUT URL — bukan mengirim file ke server. Alur:

```
┌──────────┐  POST /admin/settings/presign   ┌──────────┐
│ Browser  │ ────────(filename, type)──────▶ │  Server  │
└──────────┘                                 └────┬─────┘
     │                                            │ getR2Client()
     │                                            │ S3RequestPresigner
     │                                            ▼
     │                                   ┌──────────────────┐
     │  PUT presigned-URL + file bytes    │    Presigned     │
     │ ◀──────────────────────────────    │   PUT URL (5min) │
     └────────────────────────────────────▶    └──────────────┘
                                                   │
                                                   ▼
                                              Cloudflare R2
```

- Server endpoint `/admin/settings/presign` (admin-gated) membuat presigned PUT URL untuk key tertentu via `getSignedUrl` dari `@aws-sdk/s3-request-presigner`.
- Browser kemudian `fetch(presignedUrl, { method: "PUT", body: file })` untuk upload langsung ke R2.
- Presigned URL berlaku singkat (misal 300 detik / 5 menit) dan dibatasi pada satu key + Content-Type.
- Karena object key sudah diketahui (uuid-based), setelah upload browser dapat langsung membangun public URL via `r2PublicUrl(key)` — tidak perlu server round-trip tambahan.

**Alternatif ditolak**: Upload ke server lalu server push ke R2 — melewati benefit presigned (bandwidth server, latency).

### 8. Halaman admin `/admin/settings` — read-only config + test area

Halaman `/admin/settings` memuat:

- **Status konfigurasi** (read-only dari env): apakah `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` ter-set, plus endpoint yang dipakai.
- **Test upload**: form pilih file → server beri presigned PUT URL → browser upload langsung → tampilkan public CDN URL hasil.
- **List & preview**: daftar object yang terupload (dari prefix test tertentu), masing-masing dengan preview (untuk image) dan tombol hapus.
- **Hapus file**: tombol hapus memanggil `r2Delete(key)`.

Semua aksi di belakang `requireAdmin(locals)`. Konfigurasi tidak dapat diubah di UI — hanya dibaca dari env vars (keputusan dari eksplorasi; mencegah mengubah runtime config yang bertentangan dengan arsitektur env-var `getR2Client()`).

Key untuk file test diletakkan di prefix khusus agar tidak mengotori data nyata: `test/{uuid}.{ext}`.

## Risks / Trade-offs

| Risk                                                          | Mitigation                                                                                                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL lama `/uploads/...` di DB menjadi broken                  | Keputusan sadar (one-shot). Jalankan DB query untuk null/clear semua `bannerUrl` dan `coverUrl` sebelum atau segera setelah deploy                       |
| R2 credentials bocor ke client bundle                         | `r2-client.ts` dan `r2.ts` ada di `src/lib/server/` — SvelteKit memblokir import dari client secara default                                              |
| Test suites yang mock `fs` akan break                         | `storage.test.ts` perlu direfactor — mock `@aws-sdk/client-s3` bukan `node:fs`                                                                           |
| Cold start S3Client di serverless                             | Tidak relevan — app ini adapter-node, bukan serverless                                                                                                   |
| R2 bucket tidak public → URL broken                           | Perlu pastikan bucket sudah di-set "Public Access" di Cloudflare dashboard sebelum deploy                                                                |
| Presigned URL bisa disalahgunakan untuk upload file berbahaya | Batasi key ke prefix `test/`, expire cepat (5 menit), batasi Content-Type di `signableHeaders`, dan pastikan bucket CORS mengizinkan PUT dari origin app |

## Migration Plan

1. Install dependencies: `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. Tambah `R2_*` env vars ke `.env` (lokal) dan production secrets
3. Set bucket R2 ke "Public" di Cloudflare dashboard, catat `R2_PUBLIC_URL`
4. Implementasi `r2-client.ts`, `r2.ts`, refactor `index.ts`
5. Hapus `src/routes/uploads/[file]/+server.ts`
6. Update `.env.example` — tambah R2 vars, annotasi UPLOAD_DIR sebagai deprecated
7. Update `storage.test.ts` — mock AWS SDK
8. `pnpm check && pnpm test:unit`
9. Deploy ke production
10. Jalankan DB cleanup: `UPDATE events SET banner_url = NULL WHERE banner_url LIKE '/uploads/%'` dan artikel equivalent-nya
11. Hapus Docker volume mount untuk uploads dari compose files (opsional, non-breaking)
