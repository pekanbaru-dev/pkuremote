## Why

The admin access gate (`add-admin-access-gate`) proves who may enter `/admin`, but there is no admin UI chrome — no navigation, no layout, no way to move between admin sections. Issue #20 requires a sidebar navigation shown on every admin page, an active-menu indicator, and support for both desktop and mobile. This change delivers that shell: the persistent frame that every future admin screen (dashboard, event management, …) renders inside.

## What Changes

- Add an admin feature slice at `src/lib/features/admin/` following the project's vertical-slice recipe: `components/` (shell + sidebar), `index.ts` barrel.
- Add `src/routes/admin/+layout.svelte` that renders the admin shell around all `/admin/*` routes: a persistent sidebar navigation (desktop) / slide-over sheet (mobile), a top bar with the signed-in admin identity and a sign-out action, and a content region for the routed page.
- Sidebar navigation lists the admin sections (initially **Dashboard** and **Events**, matching issue #20's scope) with an **active-menu indicator** derived from the current path.
- Responsive behavior: a persistent sidebar at `desktop:` width; below that, the sidebar collapses behind a hamburger toggle that opens the existing shadcn `sheet`.
- The admin identity + sign-out reuse the existing auth session and the existing sign-out form action pattern (no new auth surface).
- Purely presentational chrome — no dashboard metrics, no CRUD. Sections that don't yet exist are still listed in the nav (they become live as their changes land).

## Capabilities

### New Capabilities
- `admin-shell`: The admin layout chrome — sidebar navigation with an active-menu indicator, responsive desktop/mobile behavior, the admin top bar (identity + sign out), and the `src/lib/features/admin/` slice that houses it.

### Modified Capabilities
<!-- None. This change adds chrome around the /admin route group established by add-admin-access-gate; it does not alter that capability's requirements. -->

## Impact

- **Depends on**: `add-admin-access-gate` (the `/admin` route group and its `+layout.server.ts` authorization gate must exist).
- **New code**: `src/lib/features/admin/components/admin-shell.svelte`, `.../admin-sidebar.svelte`, `src/lib/features/admin/index.ts`, `src/routes/admin/+layout.svelte`.
- **Reuses**: existing primitives (`button`, `avatar`, `badge`), the shadcn `sheet` (already installed) for the mobile drawer, `@lucide/svelte` for nav icons, the existing sign-out form action.
- **Unblocks**: `admin-dashboard`, `admin-event-management`, and every other admin screen, which render inside this shell.
- **No database change.**
