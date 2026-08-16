## 1. Struktur Komponen

- [x] 1.1 Buat folder `src/lib/components/primitives/file-upload/` dan `file-upload.style.ts` (tv() dengan varians dasar)
- [x] 1.2 Export komponen dari `src/lib/components/primitives/index.ts`

## 2. Implementasi Inti

- [x] 2.1 Implement `file-upload.svelte` — drop zone drag & drop + klik-pilih (single file), state `file`, `preview`, `uploading`, `error` (Svelte 5 runes)
- [x] 2.2 Validasi client-side — cek MIME terhadap `accept` dan size terhadap `maxBytes`, tampilkan error inline tanpa upload
- [x] 2.3 Upload presigned — panggil `getPresignedUrl({filename, contentType})` lalu `fetch(presignedUrl, { method: "PUT", body: file })`; success → `onChange(publicUrl)`, error → inline
- [x] 2.4 Preview — image tampil sebagai thumbnail + modal (klik), non-image tampil icon tipe + nama file (tanpa modal)
- [x] 2.5 Modal preview — klik thumbnail image → buka `Dialog` dari `$lib/components/ui/dialog` menampilkan gambar ukuran penuh + tombol tutup
- [x] 2.6 Tombol hapus — clear `value` dan kembali ke state drop zone kosong
- [x] 2.7 Tambah prop `error?: string | null` — error eksternal (misal dari `useForm`/`zodSchema`) ditampilkan inline, drop zone jadi errored; error internal mendahului eksternal
- [x] 2.8 Support file non-image (PDF) — default `accept` mencakup `application/pdf`, preview icon + nama

## 3. Tests

- [x] 3.1 Component test untuk validasi (reject tipe/size salah) di `file-upload.svelte.spec.ts`
- [x] 3.2 Test alur presigned upload (mock `getPresignedUrl` + fetch) — success memanggil onChange, failure menampilkan error
- [x] 3.3 Test prop `error` eksternal — ditampilkan tanpa upload
- [x] 3.4 Test preview file non-image — icon + nama file, tanpa modal image

## 4. Verifikasi

- [x] 4.1 Jalankan `pnpm check` — tidak ada type error
- [x] 4.2 Jalankan `pnpm test:unit -- --run` — semua test pass
- [x] 4.3 Jalankan `pnpm lint` — clean
