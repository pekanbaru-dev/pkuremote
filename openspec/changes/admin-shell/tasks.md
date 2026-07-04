## 1. Feature slice scaffold

- [ ] 1.1 Create `src/lib/features/admin/` with `components/` and an `index.ts` barrel (follow the ARCHITECTURE.md feature recipe)
- [ ] 1.2 Define a single `NAV_ITEMS` list (label, href, lucide icon) with Dashboard (`/admin`) and Events (`/admin/events`)

## 2. Sidebar + active indicator

- [ ] 2.1 Build `admin-sidebar.svelte` rendering `NAV_ITEMS` as links with icon + label
- [ ] 2.2 Compute active state from `page.url.pathname` (equals target or startsWith target + `/`); apply the active treatment (accent-container/bold), quiet links otherwise
- [ ] 2.3 Ensure only semantic breakpoints (`mobile:`/`tablet:`/`desktop:`) are used in class strings

## 3. Shell layout (top bar + responsive)

- [ ] 3.1 Build `admin-shell.svelte` with a top bar (admin identity + sign-out) and a content region rendering `{@render children()}`
- [ ] 3.2 Persistent sidebar at `desktop:`; hidden below with a hamburger toggle
- [ ] 3.3 Wire the hamburger to open the shadcn `sheet` containing the same `NAV_ITEMS`; navigating closes the sheet
- [ ] 3.4 Render admin identity (display name/avatar) from the existing session/profile; wire sign-out to the existing sign-out form action
- [ ] 3.5 Export `AdminShell` (and any public sub-components) from the feature barrel

## 4. Route wiring

- [ ] 4.1 Create `src/routes/admin/+layout.svelte` importing `AdminShell` from `$lib/features/admin` and wrapping `{@render children()}`
- [ ] 4.2 Confirm the placeholder `/admin/+page.svelte` now renders inside the shell

## 5. Verify

- [ ] 5.1 Active indicator correct on `/admin` and `/admin/events` (including a nested child path)
- [ ] 5.2 Desktop shows persistent sidebar; mobile shows hamburger → sheet that closes on navigate
- [ ] 5.3 Sign-out from the top bar clears the session and redirects to `/`
- [ ] 5.4 Run `pnpm check` → `pnpm lint` → `pnpm test`
