## Context

The app authenticates users via Supabase Google OAuth. `src/hooks.server.ts` validates the session on every request (`getUser()`), stashes the user on `event.locals.user`, and redirects unauthenticated requests that match `GUARDED_PREFIXES` (currently `["/myprofile"]`) to `/login?redirect=<path>`. There is no authorization layer: `profiles` has no `role`, and nothing marks a user as an administrator.

Data access is server-only. The Drizzle client (`src/lib/server/db/client.ts`) connects over a direct Postgres connection (`DATABASE_URL`) that **bypasses RLS**, and all reads/writes go through `$lib/server/` services invoked from `+page.server.ts` / `+server.ts`. RLS is therefore not the enforcement mechanism for app data; server-layer checks are.

Issue #20 needs an administrator-only panel. This change delivers only the authorization primitive it stands on, deliberately deferring a full role model.

## Goals / Non-Goals

**Goals:**
- A single server-only source of truth for "is this user an admin?" — `requireAdmin(locals)` / `isAdmin(locals)`.
- Support one or more admins via configuration, with no code change to add/remove an admin.
- Gate the `/admin` route group at two layers: authentication (hooks) and authorization (admin layout).
- Fail closed: misconfiguration results in no admins, not open access.
- Establish the seam that a future DB-backed RBAC change replaces without touching call sites.

**Non-Goals:**
- No `role` column, no migration, no RBAC (roles, permissions, promote/demote UI) — a separate future change.
- No admin UI beyond a placeholder route proving the gate. Sidebar shell, dashboard, and CRUD are separate changes.
- No RLS policies (server-only gating is the chosen posture; the Drizzle connection bypasses RLS regardless).
- No change to the sign-in flow itself.

## Decisions

### Admins are an env-based allow-list (`ADMIN_EMAILS`), not a DB role
`ADMIN_EMAILS` is a comma-separated list of emails, parsed once into a `Set<string>` of trimmed, lowercased values. A user is an admin iff their validated `locals.user.email` (lowercased) is in the set.

- **Why:** Issue #20 needs "admin vs not" for a tiny, known set of people. An env list delivers that with zero schema work and zero bootstrap chicken-and-egg (no "who promotes the first admin?"). Adding an admin is an env edit + redeploy.
- **Alternatives considered:** (a) `role` column on `profiles` + migration + admin management UI — full RBAC, rejected as premature for one/few admins; deferred to a later change. (b) Hardcoded email list in source — rejected: bakes people into version control and needs a code change to edit.
- **Trade-off:** Every listed email has identical, full admin power (no granularity, no per-admin audit). Acceptable at this scale; the seam below contains the upgrade cost.

### One helper, `requireAdmin(locals)` / `isAdmin(locals)`, in `src/lib/server/auth/admin.ts`
`isAdmin(locals)` returns a boolean; `requireAdmin(locals)` throws a SvelteKit `redirect(303, "/")` when the user is authenticated but not an admin (and is only ever called after the auth layer has ensured a user exists). Email parsing/normalization lives here.

- **Why:** A single seam means the future RBAC change rewrites only this file's internals (env lookup → DB `role` lookup); `+layout.server.ts` and every future admin `load`/`action` call site stays unchanged.
- **Alternatives considered:** Inlining the email check in the layout — rejected, because it scatters the auth decision and makes the RBAC upgrade a repo-wide edit.

### Two-layer gate: authentication in hooks, authorization in the admin layout
`hooks.server.ts` adds `/admin` to `GUARDED_PREFIXES`: an unauthenticated request to `/admin/*` is redirected to `/login?redirect=<path>` — identical to `/myprofile` today, and hooks does **not** evaluate admin status. `src/routes/admin/+layout.server.ts` then calls `requireAdmin(locals)`; an authenticated non-admin is redirected to `/`.

- **Why:** The two rejection cases are semantically different and want different destinations — "not logged in" → `/login` (so they can sign in and come back via `?redirect`), "logged in but not allowed" → `/` (signing in again wouldn't help). Reusing the existing `GUARDED_PREFIXES` mechanism for the auth half keeps hooks uniform; putting the role half in the layout keeps hooks free of route-specific role logic.
- **Alternatives considered:** Doing both checks in hooks — rejected: hooks would need per-prefix role knowledge, and the redirect target logic gets tangled. Doing both in the layout — rejected: the layout can't run for an unauthenticated user without first duplicating the hooks redirect, and centralizing the auth guard in hooks is the established pattern.

### Server-only enforcement; `.svelte` never decides access
The admin check exists only in `hooks.server.ts`, `+layout.server.ts`, and `$lib/server/`. Client components may *read* admin-derived data passed down from a server `load`, but never gate on `locals`/user themselves.

- **Why:** Consistent with the existing architecture (all data behind server services; Drizzle bypasses RLS). A client-side check is not a security boundary.

## Risks / Trade-offs

- **Misconfigured or unset `ADMIN_EMAILS` locks everyone out of `/admin`.** → This is intended (fail-closed). `.env.example` documents the variable; the placeholder `/admin` route gives an immediate, obvious signal in dev when the value is wrong.
- **Email-based identity assumes the admin's Google email is stable.** → True for the intended operators; if an admin's email changes it's an env update + redeploy. Documented as a known limitation of the descoped model.
- **Case / whitespace mismatches between env and the Google email.** → Mitigated by trimming and lowercasing both sides at parse time and at comparison.
- **Someone later exposes tables via Supabase's anon REST API, expecting RLS to protect them.** → Out of scope here, but noted: the current posture is server-only; RLS would need to be added deliberately if that access path is ever opened.
- **The env allow-list gives no per-admin audit trail.** → Accepted at this scale; the future RBAC change (DB roles) is the place to add auditing.

## Migration Plan

- Set `ADMIN_EMAILS` in `.env` (local) and in the deployment environment before/at deploy. Absent value = no admins (safe default).
- No database migration. No data backfill.
- **Rollback:** revert the code change; `ADMIN_EMAILS` becomes an unused env var with no effect. No schema to unwind.

## Open Questions

- None blocking. (Future RBAC change will decide the `role` column shape and admin-management UI; explicitly out of scope here.)
