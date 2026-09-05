## Purpose

Mendefinisikan pengelompokan semua route user-authenticated di bawah prefix `/auth/` dengan single layout-level guard, sehingga batas antara area publik dan area terautentikasi jelas secara struktural dan konsisten.

## ADDED Requirements

### Requirement: Route user-authenticated dikelompokkan di bawah `/auth/`

Semua route yang memerlukan autentikasi pengguna (bukan admin) SHALL berada di bawah prefix `/auth/`. Route-route tersebut adalah:

- `/auth/myprofile` — profil pengguna
- `/auth/myregistrations` — daftar registrasi event pengguna
- `/auth/my-articles` — artikel milik pengguna

URL publik lama (`/myprofile`, `/myregistrations`, `/my-articles`) SHALL tidak lagi tersedia sebagai route aktif.

#### Scenario: Pengguna mengakses /auth/myprofile

- **WHEN** pengguna terautentikasi mengakses `/auth/myprofile`
- **THEN** halaman profil ditampilkan dengan data pengguna yang sedang login

#### Scenario: Pengguna mengakses /auth/myregistrations

- **WHEN** pengguna terautentikasi mengakses `/auth/myregistrations`
- **THEN** halaman daftar registrasi event ditampilkan

#### Scenario: Pengguna mengakses /auth/my-articles

- **WHEN** pengguna terautentikasi mengakses `/auth/my-articles`
- **THEN** halaman daftar artikel milik pengguna ditampilkan

### Requirement: Single layout-level auth guard di `/auth/`

`src/routes/auth/+layout.server.ts` SHALL menjadi satu-satunya titik pemeriksaan autentikasi untuk semua route di bawah `/auth/` (kecuali `/auth/callback` yang dikecualikan via `GUARDED_PREFIXES`). Route individual di bawah `/auth/` MUST NOT mengimplementasikan guard redirect manual ke `/login`.

#### Scenario: Pengguna tidak terautentikasi mengakses route di bawah /auth/

- **WHEN** pengguna tanpa sesi valid mengakses `/auth/myprofile`, `/auth/myregistrations`, atau `/auth/my-articles`
- **THEN** layout server redirect ke `/login?redirect=<original-path>` dengan status 302

#### Scenario: Pengguna terautentikasi mengakses route di bawah /auth/

- **WHEN** pengguna dengan sesi valid mengakses route di bawah `/auth/`
- **THEN** request diteruskan ke route handler tanpa redirect

### Requirement: `/auth/callback` dikecualikan dari auth guard

`/auth/callback` SHALL tetap dapat diakses tanpa sesi aktif karena merupakan endpoint penerima redirect dari OIDC provider. `GUARDED_PREFIXES` di `hooks.server.ts` SHALL menggunakan prefix `/auth` tetapi implementasinya MUST NOT memblokir `/auth/callback`.

#### Scenario: OIDC callback tiba tanpa sesi

- **WHEN** OIDC provider melakukan redirect ke `/auth/callback?code=...&state=...` tanpa session cookie
- **THEN** request mencapai callback handler tanpa diblokir oleh auth guard
