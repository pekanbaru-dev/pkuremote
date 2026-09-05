## 1. Auth Layout Guard

- [ ] 1.1 Buat `src/routes/auth/+layout.server.ts` dengan auth guard yang memeriksa `locals.user` dan redirect ke `/login?redirect=<original-path>` jika null — verifikasi file ada dan `pnpm check` tidak error

## 2. Pindah Route Folders

- [ ] 2.1 Pindah `src/routes/my-articles/` → `src/routes/auth/my-articles/` (semua file: `+page.server.ts`, `+page.svelte`, `[id]/`, `new/`, `presign/`) — verifikasi struktur folder dengan `ls src/routes/auth/my-articles/`
- [ ] 2.2 Pindah `src/routes/myprofile/` → `src/routes/auth/myprofile/` (semua file: `+page.server.ts`, `+page.svelte`) — verifikasi struktur folder dengan `ls src/routes/auth/myprofile/`
- [ ] 2.3 Pindah `src/routes/myregistrations/` → `src/routes/auth/myregistrations/` (semua file: `+page.server.ts`, `+page.svelte`) — verifikasi struktur folder dengan `ls src/routes/auth/myregistrations/`

## 3. Hapus Guard Manual

- [ ] 3.1 Hapus blok `if (!locals.user) { redirect(...) }` dari `src/routes/auth/myprofile/+page.server.ts` — guard sudah ditangani layout
- [ ] 3.2 Hapus blok `if (!locals.user) { redirect(...) }` dari `src/routes/auth/myregistrations/+page.server.ts` — guard sudah ditangani layout

## 4. Update hooks.server.ts

- [ ] 4.1 Update `GUARDED_PREFIXES` di `src/hooks.server.ts` dari `["/myprofile", "/admin", "/my-articles"]` menjadi `["/admin"]` — verifikasi dengan `pnpm check`

## 5. Update DEFAULT_REDIRECT

- [ ] 5.1 Update `DEFAULT_REDIRECT` di `src/lib/server/auth/redirect.ts` dari `"/myprofile"` menjadi `"/auth/myprofile"` — verifikasi `pnpm check` tidak error

## 6. Update Internal Links

- [ ] 6.1 Update `accountHref` di `src/lib/components/site-header.svelte` dari `"/myprofile"` menjadi `"/auth/myprofile"`
- [ ] 6.2 Update semua href ke `/myregistrations` di `src/routes/events/[slug]/ticket/[number]/+page.svelte` menjadi `/auth/myregistrations`
- [ ] 6.3 Update semua href ke `/my-articles` di `src/lib/features/articles/components/article-editor.svelte` dan `tiptap-editor.svelte` menjadi `/auth/my-articles`
- [ ] 6.4 Update semua href ke `/myprofile`, `/myregistrations`, `/my-articles` di `src/lib/features/landing/components/hero-section.svelte` menjadi URL baru

## 7. Update Tests

- [ ] 7.1 Update `src/lib/server/auth/redirect.test.ts` — ganti assertion yang mengandung `/myprofile` menjadi `/auth/myprofile` dan verifikasi `pnpm test:unit -- --run` lulus
- [ ] 7.2 Update `src/lib/server/auth/oidc-flow.test.ts` — ganti assertion yang mengandung `/myprofile` menjadi `/auth/myprofile` dan verifikasi `pnpm test:unit -- --run` lulus

## 8. Verifikasi Final

- [ ] 8.1 Jalankan `pnpm check` — tidak ada type error atau Svelte diagnostics
- [ ] 8.2 Jalankan `pnpm test:unit -- --run` — semua unit test lulus
- [ ] 8.3 Jalankan dev server (`pnpm dev`) dan akses `/auth/myprofile`, `/auth/myregistrations`, `/auth/my-articles` — semua halaman load tanpa error
- [ ] 8.4 Verifikasi `/auth/callback` masih dapat diakses tanpa sesi (tidak diblokir guard layout)
- [ ] 8.5 Verifikasi unauthenticated user yang mengakses `/auth/myprofile` diredirect ke `/login?redirect=%2Fauth%2Fmyprofile`
