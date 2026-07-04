## Why

GitHub issue #20 asks for an administrator-only panel (dashboard, event management, config), but the app has no concept of an administrator — `profiles` has no role, and nothing distinguishes an admin from a regular member. Before any admin UI can be built, the app needs a way to answer one question on the server: "is this signed-in user an admin?" This change adds that gate. RBAC (a DB-backed role model) is deliberately deferred; a single, replaceable helper is introduced now so the whole panel can be built against a stable seam and upgraded to real roles later without touching call sites.

## What Changes

- Introduce an `ADMIN_EMAILS` environment variable: a comma-separated list of admin email addresses (an array, so multiple admins are supported). Values are trimmed and compared case-insensitively.
- Add a server-only helper `requireAdmin(locals)` (and a boolean companion `isAdmin(locals)`) that resolves whether `locals.user`'s email is in the admin set. This is the **single seam** all admin gating funnels through — the future RBAC change replaces only this helper's internals.
- Extend `hooks.server.ts` `GUARDED_PREFIXES` with `/admin`, so unauthenticated requests to `/admin/*` are redirected to `/login?redirect=<original-path>` using the existing guard pattern (auth-only check; role is not evaluated in hooks).
- Add an `/admin` route group with a `+layout.server.ts` that calls `requireAdmin` and redirects authenticated-but-non-admin users to `/` — the "logged in but not allowed" case, distinct from the "not logged in" redirect handled by hooks.
- Add a placeholder `/admin` landing page that renders only for admins, proving the gate end-to-end. The sidebar shell, dashboard, and CRUD are separate follow-up changes.
- Document `ADMIN_EMAILS` in `.env.example`.
- Enforcement is **server-only**: the admin check lives exclusively in server files (`hooks.server.ts`, `+layout.server.ts`, `$lib/server/`). The Drizzle client uses a direct Postgres connection that bypasses RLS and all data flows through server services, so `locals.user` / admin status is never trusted in `.svelte` files.

## Capabilities

### New Capabilities

- `admin-access`: How the app identifies an administrator (env-based allow-list), the `requireAdmin` / `isAdmin` server-only helper contract, the two-layer gate on the `/admin` route group (auth in hooks, role in the admin layout), and the placeholder admin landing route.

### Modified Capabilities

- `user-auth`: The "Guarded routes redirect to `/login`" requirement changes — `GUARDED_PREFIXES` gains `/admin`, so `/admin/*` joins `/myprofile` as an authentication-guarded prefix.

## Impact

- **New env var**: `ADMIN_EMAILS` (documented in `.env.example`; set in `.env` and deployment env). Absent/empty ⇒ no admins ⇒ `/admin` is inaccessible to everyone (fail-closed).
- **Modified code**: `src/hooks.server.ts` (`GUARDED_PREFIXES`), `src/app.d.ts` if a typed accessor is added.
- **New code**: `src/lib/server/auth/admin.ts` (the `requireAdmin` / `isAdmin` helper), `src/routes/admin/+layout.server.ts`, `src/routes/admin/+page.svelte` (placeholder).
- **No database change**: no migration, no `role` column — RBAC is out of scope here.
- **Unblocks**: `admin-shell`, `admin-dashboard`, `admin-event-management`, and all other admin-panel changes, which depend on `requireAdmin`.
