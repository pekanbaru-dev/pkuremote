## ADDED Requirements

### Requirement: Administrators are identified by the `ADMIN_EMAILS` environment allow-list

The system SHALL identify administrators from an `ADMIN_EMAILS` environment variable containing a comma-separated list of email addresses. The value SHALL be parsed into a set of normalized entries — each entry trimmed of surrounding whitespace and lowercased — and empty entries SHALL be discarded. A user SHALL be considered an administrator if and only if the lowercased value of their validated `locals.user.email` is a member of that set. There SHALL be no `role` column, database migration, or admin-management UI in this capability; administrator status is derived solely from configuration.

#### Scenario: A single admin email is configured

- **WHEN** `ADMIN_EMAILS` is `"ayu@pku.dev"` and a request carries a validated session for the user `ayu@pku.dev`
- **THEN** that user is treated as an administrator

#### Scenario: Multiple admin emails are configured

- **WHEN** `ADMIN_EMAILS` is `"ayu@pku.dev, budi@pku.dev , citra@pku.dev"` and a request carries a validated session for `budi@pku.dev`
- **THEN** that user is treated as an administrator (surrounding whitespace around each entry is ignored)

#### Scenario: Email comparison is case-insensitive

- **WHEN** `ADMIN_EMAILS` is `"Ayu@PKU.dev"` and a request carries a validated session for `ayu@pku.dev`
- **THEN** that user is treated as an administrator (both sides are lowercased before comparison)

#### Scenario: A non-listed user is not an administrator

- **WHEN** `ADMIN_EMAILS` is `"ayu@pku.dev"` and a request carries a validated session for `dedi@pku.dev`
- **THEN** that user is NOT treated as an administrator

### Requirement: Missing or empty `ADMIN_EMAILS` fails closed

When `ADMIN_EMAILS` is unset, empty, or contains only whitespace/separators, the admin set SHALL be empty and NO user SHALL be treated as an administrator. Misconfiguration SHALL never grant access.

#### Scenario: `ADMIN_EMAILS` is unset

- **WHEN** the `ADMIN_EMAILS` environment variable is not defined
- **THEN** the admin set is empty and every authenticated user is treated as a non-administrator

#### Scenario: `ADMIN_EMAILS` is blank

- **WHEN** `ADMIN_EMAILS` is `" , , "` (only separators and whitespace)
- **THEN** the admin set is empty and no user is treated as an administrator

### Requirement: A single server-only helper is the sole source of admin status

The system SHALL expose the admin decision through a single server-only module at `src/lib/server/auth/admin.ts` exporting `isAdmin(locals)` (returns a boolean) and `requireAdmin(locals)` (asserts administrator status and throws a redirect otherwise). All admin gating across the application SHALL funnel through this helper so that a future DB-backed role model can replace only this module's internals without changing call sites. The helper SHALL live under `src/lib/server/` so it is never included in the client bundle, and admin status SHALL NOT be evaluated in `.svelte` files.

#### Scenario: `isAdmin` reports true for an administrator

- **WHEN** a server `load` or action calls `isAdmin(locals)` and `locals.user.email` is in the admin set
- **THEN** the function returns `true`

#### Scenario: `isAdmin` reports false for a non-administrator

- **WHEN** a server `load` or action calls `isAdmin(locals)` and `locals.user` is null or its email is not in the admin set
- **THEN** the function returns `false`

#### Scenario: The helper is not reachable from client code

- **WHEN** `pnpm build` runs
- **THEN** the `src/lib/server/auth/admin.ts` module does not appear in the client-side output of the SvelteKit build

### Requirement: The `/admin` route group authorizes administrators in a server layout

The `/admin` route group SHALL have a `src/routes/admin/+layout.server.ts` whose `load` calls `requireAdmin(locals)`. When the request carries a validated session whose user is NOT an administrator, `requireAdmin` SHALL redirect the browser to `/` with a 303 status. When the user IS an administrator, the `load` SHALL return normally and the request SHALL proceed to the admin route. This authorization layer SHALL assume authentication has already been enforced upstream (see the `user-auth` guarded-routes requirement), so it handles only the authenticated-but-not-authorized case.

#### Scenario: An authenticated administrator opens `/admin`

- **WHEN** an administrator with a valid session requests `/admin`
- **THEN** the layout `load` returns normally and the admin page renders

#### Scenario: An authenticated non-administrator opens `/admin`

- **WHEN** an authenticated user who is not an administrator requests `/admin`
- **THEN** the layout `load` responds with a 303 redirect to `/` and the admin page does not render

### Requirement: A placeholder admin landing route proves the gate

The system SHALL provide a placeholder admin page at `src/routes/admin/+page.svelte` that renders only for administrators (by virtue of the layout gate). The page SHALL display a minimal admin-only confirmation (e.g. a heading identifying the admin area). This page is a placeholder; the sidebar shell, dashboard, and management screens are delivered by separate follow-up changes.

#### Scenario: An administrator reaches the placeholder page

- **WHEN** an administrator navigates to `/admin`
- **THEN** the placeholder admin page renders its admin-only content

#### Scenario: A non-administrator never reaches the placeholder page

- **WHEN** a non-administrator (authenticated or not) navigates to `/admin`
- **THEN** the placeholder page content is never rendered — the request is redirected first (to `/login` when unauthenticated, to `/` when authenticated-but-not-admin)

### Requirement: `ADMIN_EMAILS` is documented in `.env.example`

The `.env.example` file SHALL document the `ADMIN_EMAILS` variable, describing its comma-separated format and that it lists the administrator email addresses.

#### Scenario: A developer sets up the project

- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** they find an `ADMIN_EMAILS` entry with a comment describing its comma-separated format
