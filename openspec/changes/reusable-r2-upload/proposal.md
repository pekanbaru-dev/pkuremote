## Why

Upload media (event banner, article cover) saat ini dilakukan via fungsi server-side yang tidak punya komponen UI reusable. User ingin komponen upload file yang modern, clean, dan reusable — dengan drag & drop, preview dalam modal, dan upload langsung ke R2 via presigned URL. Saat ini belum ada komponen upload yang bisa dipakai konsisten di berbagai form.

## What Changes

- Tambah komponen reusable `FileUpload` (di `src/lib/components/primitives/file-upload/`) untuk upload file:
  - Drag & drop area + klik untuk memilih file
  - Validasi tipe (default: gambar PNG/JPEG/WebP/GIF + PDF) dan ukuran (2 MiB)
  - Preview: thumbnail image (klik → modal ukuran penuh) untuk file gambar, icon + nama file untuk file non-image
  - Tombol hapus untuk menghapus file terpilih
  - Upload langsung ke R2 via presigned PUT URL (browser → R2, tidak lewat server)
  - Props: value (URL awal), onChange (dipanggil dengan URL hasil), error eksternal (untuk integrasi useForm/zod), accept/maxBytes
- Komponen bersifat **generic** — tidak terkait form event/artikel tertentu (belum diintegrasikan; akan dipakai oleh fitur lain kemudian)
- Tidak mengubah endpoint R2 yang sudah ada (`/admin/settings/presign` dapat dipakai ulang, atau komponen menerima `getPresignedUrl` callback)

## Capabilities

### New Capabilities

- `component-library/file-upload`: Komponen reusable upload file (gambar & dokumen) dengan drag & drop, preview thumbnail/icon + modal, validasi, error eksternal, dan upload presigned ke R2.

### Modified Capabilities

Tidak ada — change ini menambah komponen baru, tidak mengubah requirement capability yang sudah ada.

## Impact

- **Code**: `src/lib/components/primitives/file-upload/` (baru: komponen + style + index), export di `src/lib/components/primitives/index.ts`
- **Dependencies**: tidak ada dependency baru (reuse `@aws-sdk/s3-request-presigner` yang sudah ada; komponen memanggil endpoint presign)
- **Tests**: tambah unit/component test untuk `FileUpload` (validasi, drag-drop, preview, non-image)
- **Tidak mengubah**: route server, storage layer, env vars, database
