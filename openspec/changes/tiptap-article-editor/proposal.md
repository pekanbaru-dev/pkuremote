## Why

Editor artikel saat ini (`article-editor.svelte`) menggunakan Textarea Markdown untuk body — kurang intuitif & tidak "medium-like" untuk menulis artikel. User ingin editor rich text ala Medium yang simple & mudah, dengan kemampuan attach image via drag-drop ke R2 (infrastruktur R2 sudah dikerjakan di change `r2-storage-integration`).

## What Changes

- **Ganti body editor dari Textarea Markdown ke TipTap rich text editor** — tampilan & UX ala Medium (clean, fokus menulis, toolbar minimal).
- **Body artikel disimpan sebagai HTML** (output TipTap), bukan markdown.
- **Drag-drop image ke editor** → upload via presigned PUT ke R2 → sisipkan URL image ke body HTML.
- **Rendering blog diubah**: body artikel dirender sebagai HTML (bukan markdown). Artikel lama yang tersimpan sebagai markdown akan dirender sebagai HTML polos (konsekuensi: markup markdown lama tampil mentah — keputusan "Semua HTML").
- Dipakai di `/my-articles/new` dan `/my-articles/[id]` (edit).

## Capabilities

### New Capabilities

- `articles/tiptap-editor`: Komponen TipTap rich text editor untuk menulis artikel, dengan toolbar (bold/italic/heading/list/quote/link), drag-drop image upload ke R2, dan output HTML.

### Modified Capabilities

Tidak ada spec eksisting yang diubah (blog-articles belum di-archive ke spec). Namun ada perubahan behavior: `body` artikel berubah dari markdown ke HTML, dan rendering blog ikut berubah.

## Impact

- **Dependencies**: tambah `@tiptap/core`, `@tiptap/svelte`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, dan extension pendukung (placeholder, dll)
- **Code**: `src/lib/features/articles/components/article-editor.svelte` (ganti body → TipTap), `src/routes/my-articles/new/+page.server.ts` & `[id]` (body jadi HTML), `src/routes/blog/[slug]/+page.server.ts` (render body HTML bukan markdown)
- **R2**: pakai endpoint `r2PresignPut` + pattern yang sudah ada (image di bawah prefix `articles/` atau `images/`)
- **Konsekuensi**: artikel lama (markdown) tampil sebagai HTML polos di blog
