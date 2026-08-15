## Why

Penyimpanan file saat ini menggunakan local filesystem (`UPLOAD_DIR`) yang tidak dapat di-CDN, tidak scalable di lingkungan multi-instance, dan membutuhkan Docker volume terpisah untuk persistensi. Cloudflare R2 memberikan object storage S3-compatible dengan CDN global tanpa egress fee, cocok untuk media publik seperti event banner dan article cover.

## What Changes

- **BREAKING**: `uploadEventBanner()` dan `uploadArticleCover()` kini mengembalikan URL publik R2/CDN (`https://...`) bukan path lokal (`/uploads/{uuid}.ext`). Semua nilai `bannerUrl` dan `coverUrl` yang tersimpan di DB dengan format lama tidak akan dipertahankan.
- **BREAKING**: Route `src/routes/uploads/[file]/+server.ts` dihapus — file disajikan langsung dari R2 public URL, tidak lagi diproxy oleh SvelteKit.
- **BREAKING**: `readUpload()` dihapus — tidak ada konsumen selain route yang dihapus.
- **BREAKING**: `resolveUploadDir()` dan `UPLOADS_URL_PREFIX` dihapus — tidak relevan di R2.
- **BREAKING**: `UPLOAD_DIR` env var tidak lagi dipakai; diganti dengan `R2_*` env vars.
- Tambah `src/lib/server/storage/r2-client.ts` — singleton `S3Client` configured untuk Cloudflare R2.
- Tambah `src/lib/server/storage/r2.ts` — fungsi reusable: `r2Put()`, `r2Delete()`, `r2PublicUrl()`.
- Refactor `src/lib/server/storage/index.ts` — swap implementasi fs → R2, pertahankan signature publik (`uploadEventBanner`, `deleteEventBanner`, `uploadArticleCover`, `deleteArticleCover`, `validateBannerFile`, `safeBasename`, `contentTypeFor`, `MediaUploadError`).
- Tambah `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` ke `.env.example`.
- Install `@aws-sdk/client-s3` dan `@aws-sdk/s3-request-presigner` sebagai dependencies.

## Capabilities

### New Capabilities

- `storage/r2`: Reusable R2 object storage primitives (`r2Put`, `r2Delete`, `r2PublicUrl`, `createR2Client`) dengan key-path convention `banners/events/{uuid}.{ext}` dan `banners/articles/{uuid}.{ext}`.

### Modified Capabilities

- `admin-media-upload`: Requirement storage backend berubah dari local filesystem ke Cloudflare R2. URL yang dikembalikan kini absolute CDN URL bukan `/uploads/` path. Serving route dihapus. `UPLOAD_DIR` env var diganti dengan `R2_*` vars. Docker volume untuk uploads tidak lagi diperlukan.

## Impact

- **Code**: `src/lib/server/storage/` (refactor total), `src/routes/uploads/[file]/+server.ts` (hapus)
- **Dependencies**: tambah `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Env vars**: hapus `UPLOAD_DIR`, tambah `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
- **Database**: nilai `bannerUrl` dan `coverUrl` lama di DB perlu di-clear atau diabaikan (one-shot migration — tidak ada backward compat)
- **Docker**: volume mount untuk `/data/uploads` di `docker-compose.yml` dan `docker-compose.prod.yml` dapat dihapus
- **Tests**: `storage.test.ts` perlu diupdate — mock R2 bukan fs
