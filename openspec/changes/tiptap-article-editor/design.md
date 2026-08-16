## Context

Lihat proposal.md untuk motivasi. Saat ini:

- `article-editor.svelte` memakai Textarea Markdown untuk body; body disimpan sebagai string markdown
- Blog render body via `bodyHtml` (DOMPurify-sanitized dari markdown) di `src/routes/blog/[slug]/+page.server.ts`
- R2 infra sudah ada: `r2PresignPut()` di `src/lib/server/storage/r2.ts`, endpoint presign pattern di `/admin/settings/presign`, dan `FileUpload` komponen

## Goals / Non-Goals

**Goals:**

- Body editor rich text ala Medium via TipTap
- Output body sebagai HTML (TipTap serialization)
- Drag-drop image → upload R2 via presigned PUT → sisip ke body
- Blog render body sebagai HTML (DOMPurify-safe)
- UX clean & fokus menulis, konsisten design system

**Non-Goals:**

- Migrasi artikel lama markdown → HTML (keputusan: semua HTML, artikel lama tampil polos)
- Multi-language/i18n editor
- Autosave (belum)
- AI-assisted writing

## Decisions

### 1. Body disimpan sebagai HTML (TipTap native)

TipTap `getHTML()` menghasilkan HTML. Body form di-submit sebagai HTML string. Blog render `{@html bodyHtml}` (DOMPurify-sanitize). Konsekuensi: artikel markdown lama tampil sebagai HTML polos — keputusan "Semua HTML".

**Rationale**: TipTap native = HTML; paling sederhana, tidak perlu konversi markdown⇄HTML.

**Alternatif ditolak**: Ekstensi markdown TipTap (masih muda, output tidak konsisten) / dual format (kompleks).

### 2. TipTap packages

```
@tiptap/core
@tiptap/svelte
@tiptap/starter-kit
@tiptap/extension-image
@tiptap/extension-link
@tiptap/extension-placeholder
```

`starter-kit` menyediakan bold/italic/heading/list/quote/link dll. `extension-image` untuk node `<img>`. `extension-placeholder` untuk placeholder "Tulis cerita Anda...". `@tiptap/svelte` untuk integrasi Svelte 5 (`useEditor`, `EditorContent`).

**Rationale**: Starter-kit + minimal extensions memenuhi kebutuhan toolbar tanpa bloat.

### 3. Drag-drop image upload via presigned PUT

```
user drag image → editor → komponen tangkap file
  → POST endpoint presign (server) → { presignedUrl, publicUrl }
  → fetch(PUT presignedUrl, body: file) → sukses
  → editor.chain().setImage({ src: publicUrl }).run()
```

Prefix key: `articles/{uuid}.{ext}` (bukan `test/`). Reuse pola presign yang sudah ada; bisa pakai endpoint baru `/my-articles/presign` atau generik `/api/r2/presign` (admin-gated/authenticated).

**Rationale**: presigned PUT = upload langsung browser→R2 tanpa lewat server (konsisten dengan R2 work sebelumnya).

### 4. Rendering blog diubah dari markdown → HTML

`blog/[slug]/+page.server.ts` berhenti parse markdown; cukup sanitize HTML (DOMPurify sudah ada via `isomorphic-dompurify`) dan render. Ini satu perubahan kecil tapi penting agar body HTML baru tampil benar.

### 5. Reuse `FileUpload`?

`FileUpload` adalah komponen upload file utuh. Untuk editor, kita butuh image inline (bukan card preview). Jadi kita **tidak** reuse `FileUpload` langsung; kita pakai `r2PresignPut` + fetch pattern, dengan penanganan drag-drop di dalam TipTap extension/event. `FileUpload` tetap dipakai untuk cover image (di atas editor).

## Risks / Trade-offs

| Risk                                                | Mitigation                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Body jadi HTML → artikel markdown lama tampil polos | Keputusan sadar (Semua HTML). Opsional: konversi satu arah markdown→HTML saat dibaca       |
| TipTap SSR/hydration mismatch                       | Gunakan `useEditor` dengan `immediatelyRender: false` utk SSR-safe; inisialisasi di client |
| XSS dari body HTML                                  | Tetap DOMPurify-sanitize sebelum render di blog                                            |
| Presigned upload bisa disalahgunakan                | Key prefix `articles/`, expire pendek, validasi MIME image di server presign               |

## Migration Plan

Tidak ada migrasi data (body tetap string, hanya format berubah). Artikel lama dibiarkan sebagai markdown (render polos).

1. Install TipTap packages
2. Buat komponen `TipTapEditor` (atau integrasi ke `article-editor.svelte`)
3. Tambah endpoint presign untuk image artikel
4. Implement drag-drop image → R2 → insert
5. Ubah `article-editor.svelte` body → TipTap
6. Ubah rendering blog → HTML
7. `pnpm check && pnpm test:unit && pnpm lint`
