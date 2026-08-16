## 1. Shell & State Collapse

- [x] 1.1 Tambah state `collapsed` di `admin-shell.svelte` (Svelte 5 `$state`), inisialisasi dari `localStorage` (client-only), persist via `$effect`
- [x] 1.2 Tambah tombol burger collapse di top bar untuk desktop (toggle `collapsed`), pisah dari tombol sheet mobile dengan breakpoint classes

## 2. Sidebar Responsive & Icon-only

- [x] 2.1 Ubah `<aside>` desktop — lebar responsif `w-64` (expanded) / `w-16` (collapsed) dengan transisi width
- [x] 2.2 Update `admin-sidebar.svelte` — terima prop `collapsed: boolean`; saat collapsed sembunyikan label, tampilkan hanya icon + tooltip (`title`)
- [x] 2.3 Pastikan saat collapsed nav item tetap punya active state yang jelas (accent fill)

## 3. Verifikasi

- [x] 3.1 Jalankan `pnpm check` — tidak ada type error
- [x] 3.2 Jalankan `pnpm test:unit -- --run` — test pass (termasuk `nav.test.ts` jika ada)
- [x] 3.3 Jalankan `pnpm lint` — clean
- [ ] 3.4 Verifikasi manual: toggle burger di desktop (collapse/expand icon-only), mobile tetap sheet, state persist antar navigasi
