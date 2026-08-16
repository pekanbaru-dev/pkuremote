## 1. Dependencies & Endpoint Presign

- [x] 1.1 Install `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/pm` (integrasi Svelte 5 manual via `@tiptap/core`, tanpa `@tiptap/svelte` yang tidak ada di npm)
- [x] 1.2 Tambah endpoint presign untuk image artikel (`src/routes/my-articles/presign/+server.ts`) — authenticated, key prefix `articles/{uuid}.{ext}`, validasi MIME image, return `{ presignedUrl, publicUrl }`

## 2. TipTap Editor Component

- [x] 2.1 Buat komponen TipTap editor (`tiptap-editor.svelte` di `features/articles/components/`) — mount `@tiptap/core` `Editor` manual ke DOM (integrasi Svelte 5), starter-kit + image + link + placeholder
- [x] 2.2 Toolbar minimal: bold, italic, heading, bullet list, ordered list, blockquote, link, undo/redo
- [x] 2.3 Bind body HTML ke form field `body` (`$bindable value` + hidden input)
- [x] 2.4 Placeholder "Tulis cerita Anda..." saat kosong
- [x] 2.5 Drag-drop image: tangkap file drop/paste → presign → PUT ke R2 → `setImage({ src: publicUrl })`

## 3. Integrasi ke Article Editor & Routes

- [x] 3.1 Ganti Textarea body di `article-editor.svelte` dengan TipTap editor
- [x] 3.2 Pastikan `/my-articles/new` dan `/my-articles/[id]` submit body sebagai HTML (server action tidak berubah, hanya konten body format)

## 4. Ubah Rendering Blog ke HTML

- [x] 4.1 Ubah `src/routes/blog/[slug]/+page.server.ts` — berhenti parse markdown, cukup DOMPurify-sanitize body HTML lalu kirim sebagai `bodyHtml`
- [x] 4.2 Pastikan `blog/[slug]/+page.svelte` render `{@html bodyHtml}` (sudah ada)

## 5. Verifikasi

- [x] 5.1 Jalankan `pnpm check` — tidak ada type error
- [x] 5.2 Jalankan `pnpm test:unit -- --run` — test pass
- [x] 5.3 Jalankan `pnpm lint` — clean
- [x] 5.4 Verifikasi manual: buka `/my-articles/new`, tulis dengan formatting, drag image → upload R2, simpan → tampil benar di `/blog/[slug]` (halaman load 200 di dev; drag-drop R2 perlu test browser manual)
