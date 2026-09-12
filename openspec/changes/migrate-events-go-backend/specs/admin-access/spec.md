## MODIFIED Requirements

### Requirement: Administrators are identified by the `ADMIN_EMAILS` environment allow-list

The system SHALL identify administrators from an `ADMIN_EMAILS` environment variable containing a comma-separated list of email addresses, configured on the **Go api service** (not the web app). The value SHALL be parsed into a set of normalized entries — each entry trimmed of surrounding whitespace and lowercased — and empty entries SHALL be discarded. A user SHALL be considered an administrator if and only if the lowercased email of the identity resolved from the trusted `X-User-Id` header is a member of that set. There SHALL be no `role` column, database migration, or admin-management UI in this capability; administrator status is derived solely from configuration. The web app SHALL NOT read `ADMIN_EMAILS`.

#### Scenario: A single admin email is configured

- **WHEN** the api service has `ADMIN_EMAILS` = `"ayu@pku.dev"` and a request carries the identity of the user `ayu@pku.dev`
- **THEN** that user is treated as an administrator

#### Scenario: Multiple admin emails are configured

- **WHEN** `ADMIN_EMAILS` is `"ayu@pku.dev, budi@pku.dev , citra@pku.dev"` and the request identity is `budi@pku.dev`
- **THEN** that user is treated as an administrator (surrounding whitespace around each entry is ignored)

#### Scenario: Email comparison is case-insensitive

- **WHEN** `ADMIN_EMAILS` is `"Ayu@PKU.dev"` and the request identity is `ayu@pku.dev`
- **THEN** that user is treated as an administrator (both sides are lowercased before comparison)

#### Scenario: A non-listed user is not an administrator

- **WHEN** `ADMIN_EMAILS` is `"ayu@pku.dev"` and the request identity is `dedi@pku.dev`
- **THEN** that user is NOT treated as an administrator

#### Scenario: The web app holds no admin policy

- **WHEN** the web app's source and runtime environment are inspected
- **THEN** `ADMIN_EMAILS` is neither read nor required by the web app — admin status comes only from the api's `GetMe` response

### Requirement: Missing or empty `ADMIN_EMAILS` fails closed

When the api service's `ADMIN_EMAILS` is unset, empty, or contains only whitespace/separators, the admin set SHALL be empty: no identity SHALL be treated as an administrator, every admin RPC SHALL be denied, and `GetMe` SHALL report `is_admin = false` for every user. Misconfiguration SHALL never grant access.

#### Scenario: `ADMIN_EMAILS` is unset

- **WHEN** the api service starts without `ADMIN_EMAILS` defined
- **THEN** every admin RPC is denied and `GetMe` returns `is_admin = false` for all users

#### Scenario: `ADMIN_EMAILS` is blank

- **WHEN** `ADMIN_EMAILS` is `" , , "` (only separators and whitespace)
- **THEN** the admin set is empty and no user is treated as an administrator

### Requirement: A single server-only helper is the sole source of admin status

The admin decision SHALL have exactly one authority: the Go api service's authorization middleware backed by `ADMIN_EMAILS`. Admin RPCs SHALL be denied server-side for non-admin identities regardless of the caller. On the web side, admin status SHALL be obtained exclusively by calling `AuthService.GetMe` from server-only code (the `/admin` layout load); no module in `web/` SHALL compute admin status from configuration, and admin status SHALL NOT be evaluated in `.svelte` files. A future DB-backed role model SHALL replace only the api middleware's internals without changing RPC call sites.

#### Scenario: The api reports admin status to the BFF

- **WHEN** the `/admin` layout load calls `GetMe` for an administrator
- **THEN** the response carries `is_admin = true` and the layout admits the request

#### Scenario: A forged BFF cannot elevate privileges

- **WHEN** any caller invokes an admin RPC with a non-admin `X-User-Id`, regardless of what the caller claims
- **THEN** the api's middleware denies the RPC — the web app holds no bypass

#### Scenario: No admin policy is reachable from client code

- **WHEN** `pnpm build` runs in `web/`
- **THEN** no admin-policy evaluation appears in the client-side output; admin gating happens in server loads via `GetMe`

### Requirement: The `/admin` route group authorizes administrators in a server layout

The `/admin` route group SHALL have a `web/src/routes/admin/+layout.server.ts` whose `load` obtains the current user's admin status by calling `AuthService.GetMe` on the api. When the request carries a validated session whose user is NOT an administrator, the layout SHALL redirect the browser to `/` with a 303 status. When the user IS an administrator, the `load` SHALL return normally and the request SHALL proceed to the admin route. This authorization layer SHALL assume authentication has already been enforced upstream (see the `user-auth` guarded-routes requirement), so it handles only the authenticated-but-not-authorized case. Individual admin operations remain protected by the api's own middleware even if the layout gate were bypassed.

#### Scenario: An authenticated administrator opens `/admin`

- **WHEN** an administrator with a valid session requests `/admin`
- **THEN** the layout `load` calls `GetMe`, receives `is_admin = true`, and the admin page renders

#### Scenario: An authenticated non-administrator opens `/admin`

- **WHEN** an authenticated user who is not an administrator requests `/admin`
- **THEN** the layout `load` receives `is_admin = false` and responds with a 303 redirect to `/`

### Requirement: `ADMIN_EMAILS` is documented in `.env.example`

The `.env.example` file SHALL document the `ADMIN_EMAILS` variable, describing its comma-separated format, that it lists the administrator email addresses, and that it is consumed by the **api service** (the web app does not read it).

#### Scenario: A developer sets up the project

- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** they find an `ADMIN_EMAILS` entry with a comment describing its comma-separated format and that the api service consumes it
