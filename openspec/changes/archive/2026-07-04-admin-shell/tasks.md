## 1. Feature slice scaffold

- [x] 1.1 Create `src/lib/features/admin/` with `components/` and an `index.ts` barrel (follow the ARCHITECTURE.md feature recipe)
- [x] 1.2 Define a single `NAV_ITEMS` list (label, href, lucide icon) with Dashboard (`/admin`) and Events (`/admin/events`)

## 2. Sidebar + active indicator

- [x] 2.1 Build `admin-sidebar.svelte` rendering `NAV_ITEMS` as links with icon + label
- [x] 2.2 Compute active state from `page.url.pathname` (equals target or startsWith target + `/`; root `/admin` matches exactly); apply the active treatment (accent-container/bold), quiet links otherwise
- [x] 2.3 Ensure only semantic breakpoints (`mobile:`/`tablet:`/`desktop:`) are used in class strings

## 3. Shell layout (top bar + responsive)

- [x] 3.1 Build `admin-shell.svelte` with a top bar (admin identity + sign-out) and a content region rendering `{@render children()}`
- [x] 3.2 Persistent sidebar at `desktop:`; hidden below with a hamburger toggle
- [x] 3.3 Wire the hamburger to open the shadcn `sheet` containing the same `NAV_ITEMS`; navigating closes the sheet
- [x] 3.4 Render admin identity (display name/avatar) from the existing session; wire sign-out to the existing `/myprofile?/signOut` form action
- [x] 3.5 Export `AdminShell` (and any public sub-components) from the feature barrel

## 4. Route wiring

- [x] 4.1 Create `src/routes/admin/+layout.svelte` importing `AdminShell` from `$lib/features/admin` and wrapping `{@render children()}`
- [x] 4.2 Confirm the placeholder `/admin/+page.svelte` now renders inside the shell

## 5. Verify

- [x] 5.1 Active indicator correct on `/admin` and `/admin/events` (incl. nested child) — covered by `nav.test.ts`
- [x] 5.2 Desktop shows persistent sidebar; mobile shows hamburger → sheet that closes on navigate
- [x] 5.3 Sign-out from the top bar clears the session and redirects to `/`
- [x] 5.4 Run `pnpm check` (0 errors) → `pnpm lint` (clean) → `pnpm test` (96 passed); build + `/admin` gate re-verified on dev
