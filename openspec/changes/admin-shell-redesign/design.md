## Context

Lihat proposal.md untuk motivasi. Shell admin saat ini (`src/lib/features/admin/`) terdiri dari:

- `admin-shell.svelte` — top bar (identity + sign-out) + sidebar desktop (`w-64`) + mobile sheet
- `admin-sidebar.svelte` — render `NAV_ITEMS` flat
- `nav.ts` — `NAV_ITEMS` (Dashboard, Events, Kategori, Artikel, Pengaturan) + `isNavItemActive`

Saat ini desktop sidebar **selalu full-width** (label + icon) dan tidak bisa di-collapse.

## Goals / Non-Goals

**Goals:**

- Sidebar desktop bisa di-toggle antara full dan icon-only via burger menu
- Icon-only mode: sidebar sempit, hanya icon, tooltip saat hover
- State collapsed persisten antar navigasi admin
- Mobile tetap pakai sheet (tidak berubah)
- Clean & profesional, konsisten design system (tokens, breakpoint, font)

**Non-Goals:**

- Menu bertingkat/submenu (tetap flat)
- Redesign halaman admin lain (scope hanya shell)
- Mengubah backend/routes
- Dark mode

## Decisions

### 1. State collapse: `collapsed` di `AdminShell` + persist `localStorage`

`AdminShell` menyimpan `collapsed = $state(false)`. Diinisialisasi dari `localStorage` (key mis. `admin-sidebar-collapsed`), dan ditulis kembali saat berubah. Ini membuat state konsisten antar navigasi & reload.

```ts
let collapsed = $state(false);
// inisialisasi dari localStorage (client-only)
// persist saat berubah via $effect
```

**Rationale**: `localStorage` paling sederhana & persisten lintas halaman. In-memory saja tidak persist antar navigasi penuh.

**Alternatif ditolak**: SvelteKit `$app/state` / store global — berlebihan untuk satu boolean; `localStorage` cukup.

### 2. Burger toggle dual-function

Tombol burger di top bar:

- **Desktop** (`desktop:` breakpoint) → toggle `collapsed` (collapse/expand sidebar)
- **Mobile** (< desktop) → buka `Sheet`

Menggunakan `desktop:hidden` untuk tombol sheet dan tombol collapse terpisah, ATAU satu tombol yang berubah perilaku via media query. Pendekatan: dua tombol (sheet di mobile, collapse di desktop), keduanya pakai `desktop:hidden` / `hidden desktop:inline-flex`. Ini paling jelas.

**Rationale**: memisahkan tombol sheet (mobile) dan tombol collapse (desktop) menghindari ambiguity event handling.

### 3. Sidebar lebar responsif

`<aside>` desktop:

- Expanded: `w-64`
- Collapsed: `w-16` (icon-only)

Transisi lebar via `transition-[width]` + `transition-all` agar smooth. Saat collapsed, label disembunyikan (`hidden` atau `opacity-0`), hanya `<Icon>` tampil.

### 4. Tooltip pada icon-only

Saat collapsed, setiap nav item membungkus icon dengan `title={item.label}` (tooltip native) atau komponen tooltip. Native `title` paling sederhana & tanpa dependency baru.

**Rationale**: `title` attribute cukup untuk icon-only hover hint, tanpa library tooltip tambahan.

### 5. `AdminSidebar` menerima prop `collapsed`

`admin-sidebar.svelte` menerima `collapsed: boolean` untuk mengatur rendering label/tooltip. Ini menjaga `nav.ts` tetap source of truth (tidak berubah strukturnya, hanya render).

## Risks / Trade-offs

| Risk                                 | Mitigation                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Icon-only sulit dikenali tanpa label | Tooltip via `title` saat hover; aktif state tetap jelas via accent fill                                             |
| localStorage tidak tersedia di SSR   | Inisialisasi collapsed hanya di client (`onMount`/$effect), default false saat SSR untuk hindari hydration mismatch |
| Transition width bisa janky          | Gunakan `transition-[width]` ringan + durasi singkat; tidak over-animate                                            |
| Burger duplikat di desktop & mobile  | Pisahkan tombol sheet (mobile) & collapse (desktop) dengan breakpoint classes                                       |

## Migration Plan

Tidak ada migrasi data. Perubahan UI murni pada komponen shell.

1. Update `nav.ts` jika perlu (helper, tidak wajib)
2. Update `admin-shell.svelte` — state collapsed, burger collapse toggle, sidebar responsive
3. Update `admin-sidebar.svelte` — terima `collapsed` prop, render icon-only + tooltip
4. `pnpm check && pnpm test:unit && pnpm lint`
5. Verifikasi manual di desktop (toggle) & mobile (sheet)
