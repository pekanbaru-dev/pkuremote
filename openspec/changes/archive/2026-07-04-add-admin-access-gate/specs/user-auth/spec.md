## MODIFIED Requirements

### Requirement: Guarded routes redirect to `/login` with a `redirect` parameter

`hooks.server.ts` SHALL maintain a list of guarded path prefixes (`["/myprofile", "/admin"]`). When an unauthenticated request matches a guarded prefix, `hooks.server.ts` SHALL respond with a 302 to `/login?redirect=<original-path-and-search>` instead of letting the request reach the SvelteKit router. This guard enforces **authentication only** — it does not evaluate whether the user is an administrator; authorization for `/admin/*` is handled downstream in the admin route group's `+layout.server.ts` (see the `admin-access` capability).

#### Scenario: An unauthenticated user visits `/myprofile`

- **WHEN** a request for `/myprofile` arrives with `event.locals.user === null`
- **THEN** the response status is 302 and the `Location` header is `/login?redirect=%2Fmyprofile`

#### Scenario: An unauthenticated user visits `/admin`

- **WHEN** a request for `/admin` (or any `/admin/*` path) arrives with `event.locals.user === null`
- **THEN** the response status is 302 and the `Location` header is `/login?redirect=%2Fadmin` (preserving the original path and search)

#### Scenario: An authenticated user visits `/myprofile`

- **WHEN** a request for `/myprofile` arrives with a valid session
- **THEN** the request continues to the route handler with no redirect

#### Scenario: An authenticated user visits `/admin`

- **WHEN** a request for `/admin` arrives with a valid session
- **THEN** the authentication guard does not redirect; the request proceeds to the admin route group, where the `+layout.server.ts` authorization check runs (admins continue, non-admins are redirected to `/`)

#### Scenario: An unauthenticated user visits a public page

- **WHEN** a request for `/` or any other non-guarded path arrives with no session
- **THEN** the request is not redirected; it reaches the route handler
