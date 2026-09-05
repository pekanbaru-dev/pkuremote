## Why

Route-level struktur saat ini menempatkan `/myprofile`, `/my-articles`, dan `/myregistrations` di root routes, sejajar dengan halaman publik seperti `/blog` dan `/events`. Ini membuat batas antara area publik dan area terautentikasi tidak jelas secara struktural. Selain itu, `/myregistrations` tidak tercantum di `GUARDED_PREFIXES` di `hooks.server.ts` sehingga guard-nya bergantung pada guard manual di `+page.server.ts` — inkonsistensi yang rawan terlewat.

## What Changes

- Pindah `src/routes/myprofile/` → `src/routes/auth/myprofile/`
- Pindah `src/routes/myregistrations/` → `src/routes/auth/myregistrations/`
- Pindah `src/routes/my-articles/` → `src/routes/auth/my-articles/`
- Tambah `src/routes/auth/+layout.server.ts` sebagai single auth guard untuk semua route di bawah `/auth/`
- Update `GUARDED_PREFIXES` di `hooks.server.ts`: ganti `["/myprofile", "/admin", "/my-articles"]` dengan `["/auth", "/admin"]`
- Hapus guard manual (`if (!locals.user) redirect(...)`) dari `myprofile/+page.server.ts` dan `myregistrations/+page.server.ts` — keduanya sudah ditangani layout
- Update semua internal link/href yang mengarah ke `/myprofile`, `/myregistrations`, `/my-articles`
- Update redirect default di `auth/callback` dari `/myprofile` → `/auth/myprofile`
- `/login` tetap di `src/routes/login/` (tidak dipindah)
- `src/routes/auth/callback/` tetap di posisi sekarang

Struktur module utama setelah perubahan:

```
/:slug       ← halaman publik
/auth        ← area user terautentikasi
/admin       ← area admin
```

## Capabilities

### New Capabilities

- `auth-routing`: Pengelompokan route user-authenticated di bawah prefix `/auth/` dengan single layout-level guard, menggantikan guard individual per halaman.

### Modified Capabilities

- `user-auth`: Requirement guarded routes berubah — `GUARDED_PREFIXES` sekarang menggunakan `/auth` (bukan `/myprofile` dan `/my-articles`), dan `/myregistrations` yang sebelumnya tidak terdaftar kini ikut terlindungi secara otomatis. Redirect default post-login dari `/myprofile` → `/auth/myprofile`.

## Impact

- `src/hooks.server.ts` — update `GUARDED_PREFIXES`
- `src/routes/auth/+layout.server.ts` — file baru (single auth guard)
- `src/routes/myprofile/` → `src/routes/auth/myprofile/` (pindah semua file)
- `src/routes/myregistrations/` → `src/routes/auth/myregistrations/` (pindah semua file)
- `src/routes/my-articles/` → `src/routes/auth/my-articles/` (pindah semua file)
- Semua komponen/svelte yang menggunakan `href="/myprofile"`, `href="/myregistrations"`, `href="/my-articles"`
- `src/lib/server/auth/redirect.ts` atau titik mana pun yang menetapkan default redirect `/myprofile`
- `src/routes/auth/callback/+server.ts` — default redirect target
- Tidak ada perubahan database, tidak ada perubahan API publik, tidak ada breaking change bagi pengguna akhir
