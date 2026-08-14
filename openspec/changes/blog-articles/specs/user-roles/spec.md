## Purpose

Role system berbasis database untuk mengontrol akses fitur editorial: setiap profil user memiliki satu role (`user`, `editor`, atau `admin`) yang disimpan di tabel `profiles`. Role ini menggantikan `ADMIN_EMAILS` env allow-list sebagai sumber kebenaran untuk otorisasi.

## ADDED Requirements

### Requirement: Setiap profil memiliki role yang tersimpan di database

Tabel `profiles` SHALL memiliki kolom `role` dengan nilai enum `'user' | 'editor' | 'admin'`. Default value SHALL `'user'`. Kolom ini NOT NULL. Semua profil yang sudah ada SHALL di-backfill ke `'user'` kecuali yang secara eksplisit di-seed sebagai `'admin'`.

#### Scenario: Profil baru dibuat tanpa role eksplisit

- **WHEN** OIDC callback memprovision profil baru
- **THEN** profil tersebut memiliki `role = 'user'`

#### Scenario: Backfill profil existing

- **WHEN** migrasi Drizzle yang menambah kolom `role` dijalankan
- **THEN** semua profil existing memiliki `role = 'user'` (default constraint)

---

### Requirement: `isAdmin()` dan `isEditor()` membaca role dari database

Fungsi `isAdmin(locals)` SHALL mengembalikan `true` jika `locals.user` memiliki `profiles.role === 'admin'`. Fungsi `isEditor(locals)` SHALL mengembalikan `true` jika `profiles.role` adalah `'editor'` atau `'admin'`. Kedua fungsi SHALL menggunakan data yang sudah di-load ke `locals` — tidak melakukan query DB tambahan per request.

#### Scenario: Admin mengakses halaman admin

- **WHEN** user dengan `profiles.role = 'admin'` mengakses `/admin`
- **THEN** akses diberikan

#### Scenario: Editor mengakses halaman admin/articles

- **WHEN** user dengan `profiles.role = 'editor'` mengakses `/admin/articles`
- **THEN** akses diberikan

#### Scenario: User biasa tidak dapat mengakses halaman admin

- **WHEN** user dengan `profiles.role = 'user'` mengakses `/admin`
- **THEN** server mengembalikan redirect 303 ke `/`

---

### Requirement: Admin dapat mengubah role user lain

Admin SHALL dapat mengubah role profil user lain melalui `/admin` interface. Perubahan SHALL langsung efektif pada request berikutnya dari user yang bersangkutan (session di-reload dari DB). Admin tidak dapat menurunkan role dirinya sendiri.

#### Scenario: Admin mengubah user menjadi editor

- **WHEN** admin mengubah role user menjadi `'editor'` lewat admin interface
- **THEN** `profiles.role` terupdate dan user tersebut mendapat akses editor pada login berikutnya

#### Scenario: Admin tidak dapat mengubah role dirinya sendiri

- **WHEN** admin mencoba mengubah role profil miliknya sendiri
- **THEN** server mengembalikan error dan role tidak berubah

---

### Requirement: Role di-load ke session locals setiap request

`hooks.server.ts` SHALL men-load `role` dari `profiles` bersamaan dengan data session user sehingga tersedia di `locals.user.role` tanpa query tambahan per route. Jika session valid tapi profil tidak ditemukan, `locals.user` SHALL `null`.

#### Scenario: Role tersedia di locals setiap request terautentikasi

- **WHEN** request masuk dengan session cookie yang valid
- **THEN** `locals.user.role` berisi role terkini dari DB, bukan nilai cache lama
