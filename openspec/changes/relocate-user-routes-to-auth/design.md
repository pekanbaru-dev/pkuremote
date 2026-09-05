## Context

Lihat proposal.md untuk motivasi perubahan ini.

Route user-authenticated saat ini tersebar di root routes sejajar dengan halaman publik. Guard autentikasi diimplementasikan di dua tempat: `GUARDED_PREFIXES` di `hooks.server.ts` (untuk `/myprofile` dan `/my-articles`) dan guard manual di `+page.server.ts` (untuk `/myregistrations`). Default redirect post-login ditetapkan sebagai konstanta `DEFAULT_REDIRECT = "/myprofile"` di `src/lib/server/auth/redirect.ts` dan dipakai oleh `oidc-flow.ts` dan `auth/callback`.

File yang mengandung referensi URL lama:
- `src/hooks.server.ts` — `GUARDED_PREFIXES`
- `src/lib/server/auth/redirect.ts` — `DEFAULT_REDIRECT`
- `src/lib/components/site-header.svelte` — `accountHref`
- `src/routes/myprofile/+page.server.ts` — guard manual + redirect string
- `src/routes/myregistrations/+page.server.ts` — guard manual + redirect string
- `src/lib/features/articles/components/article-editor.svelte` dan `tiptap-editor.svelte` — link ke `/my-articles`
- `src/lib/features/landing/components/hero-section.svelte` — link ke halaman user
- `src/routes/events/[slug]/ticket/[number]/+page.svelte` — link ke `/myregistrations`

## Goals / Non-Goals

**Goals:**
- Semua route user-authenticated berada di bawah `/auth/`
- Single auth guard via `src/routes/auth/+layout.server.ts`
- `GUARDED_PREFIXES` disederhanakan menjadi `["/auth", "/admin"]`
- `/auth/callback` tetap dapat diakses tanpa sesi
- Semua internal link diupdate ke URL baru
- `DEFAULT_REDIRECT` diupdate ke `/auth/myprofile`

**Non-Goals:**
- Mengubah behavior autentikasi atau sesi
- Mengubah tampilan UI halaman-halaman tersebut
- Menambah redirect permanent (301) dari URL lama ke URL baru — ini bukan URL publik yang diindeks SEO
- Memindah `/login` — tetap di root

## Decisions

### 1. `/auth/callback` tidak diblokir guard

`GUARDED_PREFIXES` akan berisi `/auth` (bukan `/auth/myprofile` dll secara individual). Karena prefix matching, `/auth/callback` akan ikut dicocokkan — ini harus dikecualikan.

**Pilihan A**: Tambah `/auth/callback` ke daftar exclusion di `hooks.server.ts`.

**Pilihan B**: Biarkan guard di `hooks.server.ts` tetap hanya pakai `GUARDED_PREFIXES` tanpa exclusion, tapi pindahkan `/auth/callback` ke luar `/auth/` (misalnya `/auth-callback`).

**Pilihan C**: Buat `+layout.server.ts` di `/auth/` sebagai satu-satunya auth guard, tanpa menyentuh `GUARDED_PREFIXES` untuk prefix `/auth` — cukup tambahkan layout guard. Hapus `/myprofile` dan `/my-articles` dari `GUARDED_PREFIXES`, biarkan `/myregistrations` juga tidak di sana (karena sudah ditangani layout). Untuk `/admin`, biarkan tetap di `GUARDED_PREFIXES`.

**Keputusan: Pilihan C.**

Alasan: Pilihan C paling bersih. `hooks.server.ts` tidak perlu tahu tentang sub-path exclusion. `/auth/callback` otomatis tidak tersentuh karena ia tidak punya `+layout.server.ts` guard — layoutnya hanya berlaku pada route yang merender halaman, bukan server endpoint. `GUARDED_PREFIXES` di hooks cukup `["/admin"]` saja untuk kebutuhan hooks-level guard (admin butuh guard di hooks karena admin layout guard hanya mengecek otorisasi, bukan autentikasi). Route `/auth/*` dijaga oleh `+layout.server.ts`.

Dengan Pilihan C:
```
GUARDED_PREFIXES = ["/admin"]   ← hooks.server.ts hanya jaga admin
/auth/+layout.server.ts         ← jaga semua /auth/* kecuali /auth/callback
                                   (callback adalah +server.ts, bukan +page, 
                                    layout tidak berlaku padanya)
```

> Catatan: SvelteKit `+layout.server.ts` hanya dijalankan untuk route yang merender halaman (page routes). `+server.ts` endpoint tidak mewarisi layout server. Ini adalah perilaku bawaan SvelteKit — `/auth/callback/+server.ts` tidak akan menjalankan `/auth/+layout.server.ts`.

### 2. Guard manual dihapus dari page.server.ts

Setelah `/auth/+layout.server.ts` aktif, guard manual di `myprofile` dan `myregistrations` menjadi redundan. Keduanya dihapus agar tidak ada dua titik guard yang bisa drift.

### 3. DEFAULT_REDIRECT diupdate ke `/auth/myprofile`

Konstanta di `src/lib/server/auth/redirect.ts` diubah dari `/myprofile` ke `/auth/myprofile`. Semua consumer (`oidc-flow.ts`, `auth/callback/+server.ts`) otomatis mengikuti tanpa perubahan tambahan.

### 4. Tidak ada redirect 301 dari URL lama

URL lama (`/myprofile`, `/myregistrations`, `/my-articles`) bukan URL publik yang pernah dipublikasikan atau diindeks mesin pencari. Tidak perlu redirect permanent. URL lama cukup dibiarkan 404 setelah route dipindah.

## Risks / Trade-offs

- **Bookmark pengguna rusak** → Risiko rendah. URL ini tidak pernah dipromosikan secara publik. Pengguna akan login ulang dan diarahkan ke URL baru via default redirect.
- **SvelteKit layout behavior pada +server.ts** → Ini adalah behavior yang terdokumentasi dan stabil di SvelteKit. `/auth/callback/+server.ts` tidak menjalankan layout. Perlu diverifikasi dengan test setelah implementasi.
- **Test yang hardcode URL lama** → `redirect.test.ts` dan `oidc-flow.test.ts` mungkin mengandung assertion pada string `/myprofile`. Perlu diupdate bersamaan dengan implementasi.

## Migration Plan

Urutan implementasi yang aman (tidak ada downtime, dapat di-rollback per langkah):

1. Buat `src/routes/auth/+layout.server.ts` dengan auth guard
2. Pindah folder route (my-articles, myprofile, myregistrations) ke bawah `auth/`
3. Update `GUARDED_PREFIXES` di `hooks.server.ts` — hapus `/myprofile` dan `/my-articles`, biarkan `/admin`
4. Update `DEFAULT_REDIRECT` di `redirect.ts`
5. Update semua internal link di komponen dan svelte files
6. Update test yang mengandung URL lama
7. Jalankan `pnpm check` + `pnpm test`

Rollback: setiap langkah bersifat lokal dan dapat di-revert via git. Tidak ada perubahan database atau migrasi data.

## Open Questions

Tidak ada.
