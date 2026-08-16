## 1. Dependencies & Environment

- [x] 1.1 Install `@aws-sdk/client-s3` dan `@aws-sdk/s3-request-presigner` via `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- [x] 1.2 Tambah `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` ke `.env.example` dengan komentar panduan lengkap
- [x] 1.3 Tambah `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` ke `.env` lokal dengan nilai aktual dari Cloudflare dashboard

## 2. R2 Client Singleton

- [x] 2.1 Buat `src/lib/server/storage/r2-client.ts` — ekspor `getR2Client()` yang lazy-init singleton `S3Client` dengan endpoint `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, `region: "auto"`, dan credentials dari env vars
- [x] 2.2 Pastikan `getR2Client()` throw `Error` deskriptif jika salah satu dari `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, atau `R2_BUCKET` tidak di-set

## 3. R2 Primitives

- [x] 3.1 Buat `src/lib/server/storage/r2.ts` — ekspor `r2Put(key, body, contentType)` menggunakan `PutObjectCommand`
- [x] 3.2 Tambah `r2Delete(key)` ke `r2.ts` — menggunakan `DeleteObjectCommand`, swallow error dengan `console.error`
- [x] 3.3 Tambah `r2PublicUrl(key)` ke `r2.ts` — concat `R2_PUBLIC_URL` + key, throw jika env var tidak di-set, normalize trailing slash

## 4. Refactor Storage Index

- [x] 4.1 Refactor `uploadEventBanner()` di `index.ts` — ganti `writeFile` + `mkdir` dengan `r2Put()` + `r2PublicUrl()`, gunakan key `banners/events/{uuid}.{ext}`
- [x] 4.2 Refactor `uploadArticleCover()` di `index.ts` — sama seperti 4.1, gunakan key `banners/articles/{uuid}.{ext}`
- [x] 4.3 Refactor `deleteEventBanner()` di `index.ts` — ganti `unlink()` dengan `r2Delete()`, ekstrak key dari CDN URL (strip `R2_PUBLIC_URL` prefix)
- [x] 4.4 Refactor `deleteArticleCover()` di `index.ts` — sama seperti 4.3
- [x] 4.5 Hapus `resolveUploadDir()`, `UPLOADS_URL_PREFIX`, dan semua import `node:fs/promises` + `node:path` dari `index.ts`
- [x] 4.6 Hapus `readUpload()` dari `index.ts`

## 5. Hapus Serving Route

- [x] 5.1 Hapus `src/routes/uploads/[file]/+server.ts`

## 6. Update Tests

- [x] 6.1 Refactor `src/lib/server/storage/storage.test.ts` — hapus mock `node:fs/promises`, tambah mock `@aws-sdk/client-s3` (`vi.mock`)
- [x] 6.2 Tambah test untuk `uploadEventBanner` yang memverifikasi R2 key prefix `banners/events/` dan return value berupa CDN URL
- [x] 6.3 Tambah test untuk `uploadArticleCover` yang memverifikasi R2 key prefix `banners/articles/`
- [x] 6.4 Tambah test untuk `deleteEventBanner` yang memverifikasi key diekstrak dengan benar dari CDN URL
- [x] 6.5 Pastikan test lama (`validateBannerFile`, `safeBasename`, `contentTypeFor`) tetap pass — fungsi-fungsi ini tidak berubah

## 7. Verifikasi & Cleanup

- [x] 7.1 Jalankan `pnpm check` — pastikan tidak ada type error
- [x] 7.2 Jalankan `pnpm test:unit -- --run` — pastikan semua unit test pass
- [x] 7.3 Annotasi `UPLOAD_DIR` di `.env.example` sebagai deprecated/tidak lagi dipakai
- [x] 7.4 Jalankan DB cleanup query: `UPDATE events SET banner_url = NULL WHERE banner_url LIKE '/uploads/%'` dan equivalent untuk artikel cover
- [x] 7.5 (Opsional) Hapus volume mount `/data/uploads` dari `docker-compose.yml` dan `docker-compose.prod.yml`

## 8. Presigned Upload Primitif

- [x] 8.1 Tambah `r2PresignPut(key, contentType, expiresIn?)` di `r2.ts` menggunakan `getSignedUrl` + `PutObjectCommand` dari `@aws-sdk/s3-request-presigner`, default TTL 300 detik, `signableHeaders` mengunci Content-Type
- [x] 8.2 Tambah `r2ListKeys(prefix)` di `r2.ts` menggunakan `ListObjectsV2Command` untuk mendaftar object di bawah prefix (dipakai oleh admin settings)
- [x] 8.3 Tambah unit test untuk `r2PresignPut` (mock `getSignedUrl`) di `storage.test.ts`

## 9. Admin Storage Settings

- [x] 9.1 Tambah primitive server `getR2ConfigStatus()` (atau sejenis) yang mengembalikan status set/tidak-set setiap env var R2 + endpoint yang dipakai (tanpa membocorkan secret value)
- [x] 9.2 Buat route `src/routes/admin/settings/+page.server.ts` — `requireAdmin(locals)`, load status konfigurasi + list `test/*` objects, action `presign` (buat presigned PUT URL untuk key `test/{uuid}.{ext}`) dan action `delete` (hapus object via `r2Delete`)
- [x] 9.3 Buat endpoint server `src/routes/admin/settings/presign/+server.ts` (atau pakai form action) yang mengembalikan presigned PUT URL + public URL yang sesuai
- [x] 9.4 Buat `src/routes/admin/settings/+page.svelte` — tampilkan status konfigurasi read-only, form pilih file → upload via presigned PUT ke R2 → tampilkan public URL, list object `test/*` dengan preview image, dan tombol hapus per object
- [x] 9.5 Tambah item menu "Settings" (icon `Settings` dari `@lucide/svelte`) ke `NAV_ITEMS` di `src/lib/features/admin/nav.ts`
- [x] 9.6 Pastikan bucket CORS mengizinkan PUT dari origin app (dokumentasikan di `.env.example`/README jika perlu) agar presigned upload dari browser berfungsi
