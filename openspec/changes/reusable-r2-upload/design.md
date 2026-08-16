## Context

Lihat proposal.md untuk motivasi. Project ini punya pola komponen yang sudah mapan:

- `src/lib/components/primitives/` — komponen Svelte 5 sederhana (button, input, badge, dll), pakai `tailwind-variants` + `cn`
- `src/lib/components/ui/` — komponen shadcn-svelte yang delegate ke `bits-ui` (termasuk `dialog`)
- Stack UI: Tailwind v4, tokens `@theme`, breakpoint `mobile:`/`tablet:`/`desktop:`, Plus Jakarta Sans

Upload ke R2 sudah didukung: `src/lib/server/storage/r2.ts` punya `r2PresignPut()`, dan `/admin/settings/presign` sudah jadi contoh endpoint presign (POST → `{ presignedUrl, publicUrl, key }`).

## Goals / Non-Goals

**Goals:**

- Komponen `FileUpload` reusable & generic (belum terikat form tertentu)
- Drag & drop + klik-pilih, validasi client-side, thumbnail/modal preview (image) atau icon + nama (non-image), tombol hapus
- Upload langsung ke R2 via presigned PUT (browser → R2, tanpa file lewat server)
- Konsisten dengan pola komponen yang ada (primitives + shadcn dialog)
- Mengikuti design system (tokens, breakpoint, font)

**Non-Goals:**

- Integrasi ke form event/article (di luar scope — komponen saja)
- Multiple file upload (single file saja untuk sekarang)
- Crop/rotate/edit image
- Progress bar upload persentase (cukup state loading)
- Perubahan pada storage layer / endpoint R2 yang sudah ada

## Decisions

### 1. Lokasi: `primitives/file-upload/` (folder komponen baru)

```
src/lib/components/primitives/file-upload/
  file-upload.svelte   ← markup + logic
  file-upload.style.ts ← tv() styles
  index.ts             ← barrel
```

**Rationale**: Meskipun drag-drop + modal adalah behavior agak kompleks, komponen ini tidak butuh headless behavior dari bits-ui selain dialog. Mengikuti pola primitives (Svelte 5 runes + `tv`). Dialog modal dipakai dari `$lib/components/ui/dialog` (yang sudah ada), bukan diimplement ulang.

**Alternatif ditolak**: Taruh di `ui/` (shadcn) — komponen ini bukan shadcn-managed dan lebih cocok di primitives.

### 2. Alur presigned upload via callback `getPresignedUrl`

Komponen menerima prop async callback:

```ts
getPresignedUrl?: (file: { filename: string; contentType: string }) =>
  Promise<{ presignedUrl: string; publicUrl: string }>
```

Alur di dalam komponen:

```
user pilih/drag file → validasi type+size → getPresignedUrl({filename, contentType})
  → fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": ... } })
  → success: onChange(publicUrl)  |  error: inline error
```

**Rationale**: Komponen generic tidak tahu endpoint mana yang dipakai. Callback membuat komponen reusable — pemakai bisa kasih endpoint `/admin/settings/presign` atau yang lain. Konsisten dengan alur presigned yang sudah dibangun di change `r2-storage-integration`.

**Alternatif ditolak**: Hardcode endpoint di komponen — kurang reusable.

### 3. Validasi client-side sebelum upload

Validasi MIME + size dilakukan di komponen (client), sehingga request presign/PUT tidak terbuang untuk file invalid. Default `accept = "image/png,image/jpeg,image/webp,image/gif,application/pdf"`, `maxBytes = 2 MiB`.

### 4. Preview: image vs non-image

Dibedakan dari ekstensi URL (`isImageUrl`). Image → thumbnail `<img>` + modal `Dialog`. Non-image → icon tipe file + nama file, tanpa modal. Ini membuat komponen support file umum (gambar + dokumen), bukan hanya image.

### 5. Modal preview via shadcn `Dialog`

Klik thumbnail image → `Dialog` menampilkan gambar ukuran penuh. Menggunakan komponen `$lib/components/ui/dialog` yang sudah ada, bukan buat baru.

### 6. Controlled component (`value`/`onChange`)

`value: string` (URL atau kosong) dan `onChange: (url: string) => void`. Komponen tidak menyimpan URL sendiri secara permanen — mengikuti pola controlled yang rapi untuk integrasi form nanti. State internal hanya untuk progress/error/pra-preview.

### 7. Error eksternal (`error` prop)

Komponen menerima `error?: string | null` untuk integrasi form (useForm/zod). `displayError = uploadError ?? error` — error internal mendahului eksternal. Drop zone jadi errored saat salah satu ada.

## Risks / Trade-offs

| Risk                                                       | Mitigation                                                                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| CORS bucket belum dikonfigurasi PUT → upload browser gagal | Dokumentasikan kebutuhan CORS (GET + PUT) di komponen/`.env.example`; error ditangkap & ditampilkan inline        |
| Presigned URL bisa disalahgunakan                          | Key di bawah prefix `test/` untuk sekarang; nanti saat integrasi form, prefix sesuai jenis konten; expire 5 menit |
| Drag & drop tidak jalan di mobile                          | Fallback klik-pilih tetap tersedia (drop zone klikable)                                                           |
| File besar memakan memori client                           | Batas `maxBytes` 2 MiB default; bisa di-set pemakai                                                               |

## Migration Plan

Tidak ada migrasi data — komponen baru, tidak mengubah storage layer atau DB.

1. Buat folder & style `file-upload.style.ts`
2. Implement `file-upload.svelte` (drag-drop, validasi, preview image/non-image, modal, upload presigned)
3. Export di `primitives/index.ts`
4. Tambah unit/component test
5. `pnpm check && pnpm test:unit && pnpm lint`
