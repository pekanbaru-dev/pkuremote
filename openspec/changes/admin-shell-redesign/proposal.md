## Why

Admin shell saat ini (desktop) selalu menampilkan sidebar lebar (`w-64`) dengan label + icon, tanpa cara untuk mempersempitnya. Ini memakan ruang horizontal, terutama di layar yang tidak terlalu lebar. User ingin layout admin yang lebih clean & profesional: sidebar bisa di-collapse ke mode icon-only via burger menu, memberi lebih banyak ruang untuk konten.

## What Changes

- **Tambah toggle burger menu di desktop** — tombol di top bar yang me-toggle sidebar antara **full** (label + icon) dan **icon-only** (hanya icon, sidebar sempit).
- **Sidebar collapse state** — `AdminShell` menyimpan state `collapsed: boolean`; saat collapsed, sidebar desktop menyempit (mis. `w-16`) dan hanya menampilkan icon; saat expanded, kembali `w-64` dengan label.
- **State dipertahankan antar navigasi** — collapse state disimpan (mis. `localStorage` atau state in-memory) agar konsisten antar halaman admin.
- **Tooltip pada icon-only** — saat collapsed, nav item menampilkan tooltip label saat hover.
- **Mobile tetap sheet** — di bawah breakpoint `desktop:`, sidebar tetap tersembunyi dan burger membuka sheet (perilaku yang sudah ada, tidak berubah).
- **Flat menu, tidak ada submenu** — struktur `nav.ts` tetap flat.

## Capabilities

### New Capabilities

Tidak ada — change ini memodifikasi shell admin yang sudah ada, tidak menambah capability baru.

### Modified Capabilities

- `admin-shell`: Sidebar desktop kini dapat di-collapse ke mode icon-only via burger menu di top bar, dengan state persisten dan tooltip; perilaku mobile sheet tidak berubah.

## Impact

- **Code**: `src/lib/features/admin/components/admin-shell.svelte`, `admin-sidebar.svelte`, `nav.ts` (mungkin tambah type/helper), `+layout.svelte` (jika perlu)
- **Dependencies**: tidak ada dependency baru (reuse `@lucide/svelte` icon, `Button`)
- **Tests**: unit test untuk logic collapse state (jika ada) & `isNavItemActive` (jika berubah)
- **Tidak mengubah**: halaman admin lain, routes, backend, storage
