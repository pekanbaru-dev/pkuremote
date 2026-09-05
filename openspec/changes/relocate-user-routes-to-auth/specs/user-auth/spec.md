## MODIFIED Requirements

### Requirement: Guarded routes redirect to `/login` with a `redirect` parameter

`hooks.server.ts` SHALL maintain a list of guarded path prefixes (`["/auth", "/admin"]`). When an unauthenticated request matches a guarded prefix, `hooks.server.ts` SHALL respond with a 302 to `/login?redirect=<original-path-and-search>` instead of letting the request reach the SvelteKit router. This guard enforces **authentication only** — it does not evaluate whether the user is an administrator; authorization for `/admin/*` is handled downstream in the admin route group's `+layout.server.ts` (see the `admin-access` capability).

The `/auth/callback` path SHALL NOT be blocked by this guard — matching is prefix-based and `/auth/callback` starts with `/auth`, so the implementation MUST use an exact-or-subpath check that excludes `/auth/callback` (e.g. by keeping `/auth/callback` out of `GUARDED_PREFIXES` and using a more specific prefix `/auth/my` and `/auth/myprofile` — or by checking that the callback path is not matched). The recommended approach is to keep `/auth/callback` accessible by ensuring `GUARDED_PREFIXES` does not inadvertently block it; see design for the chosen approach.

#### Scenario: An unauthenticated user visits `/auth/myprofile`

- **WHEN** a request for `/auth/myprofile` arrives with `event.locals.user === null`
- **THEN** the response status is 302 and the `Location` header is `/login?redirect=%2Fauth%2Fmyprofile`

#### Scenario: An unauthenticated user visits `/auth/myregistrations`

- **WHEN** a request for `/auth/myregistrations` arrives with `event.locals.user === null`
- **THEN** the response status is 302 and the `Location` header is `/login?redirect=%2Fauth%2Fmyregistrations`

#### Scenario: An unauthenticated user visits `/admin`

- **WHEN** a request for `/admin` (or any `/admin/*` path) arrives with `event.locals.user === null`
- **THEN** the response status is 302 and the `Location` header is `/login?redirect=%2Fadmin` (preserving the original path and search)

#### Scenario: An authenticated user visits `/auth/myprofile`

- **WHEN** a request for `/auth/myprofile` arrives with a valid session
- **THEN** the request continues to the route handler with no redirect

#### Scenario: An unauthenticated user visits a public page

- **WHEN** a request for `/` or any other non-guarded path arrives with no session
- **THEN** the request is not redirected; it reaches the route handler

#### Scenario: OIDC callback is not blocked by the auth guard

- **WHEN** a request for `/auth/callback` arrives with no session cookie
- **THEN** the request is not redirected and reaches the callback handler

### Requirement: Sign-in is a single Google OAuth action

The system SHALL expose sign-in as a single "Continue with Google" action on `/login`. The action SHALL be implemented as a SvelteKit form `action` that, server-side, starts an **OIDC authorization-code flow via Arctic** against the configured issuer (`OIDC_ISSUER`): it generates a `state`, a PKCE `code_verifier`, and a `nonce`, and stores them — together with the sanitized post-login target (from the `?redirect=` parameter, defaulting to `/auth/myprofile`) — in short-lived httpOnly cookies. It SHALL build the authorization URL carrying `scope=openid email profile`, the `state` parameter, the `nonce` parameter, and the PKCE `code_challenge` (method `S256`), with `redirect_uri` = the absolute URL of `/auth/callback`, and issue a redirect to it. Sending `state`/`nonce`/`code_challenge` as authorization parameters is REQUIRED — a provider only echoes a `nonce` it received, so the callback's nonce check would otherwise always fail. The issuer is Dex in development and Google (`https://accounts.google.com`) in production; the code path is identical and provider-agnostic — only `OIDC_ISSUER` differs.

The system MUST NOT present a separate registration form, password field, confirm-password field, or email field on `/login`. The same action SHALL register new identities and sign in existing ones — the OIDC callback provisions the user on first sign-in and looks them up on subsequent sign-ins.

#### Scenario: A new visitor clicks "Continue with Google" for the first time

- **WHEN** a user who has never signed in visits `/login` and submits the form
- **THEN** the server sets `state`/`code_verifier`/`nonce` cookies and returns a redirect to the issuer's authorization endpoint, and after consent the browser is redirected to `/auth/callback?code=…&state=…`, the callback verifies the response and provisions the user, and the browser lands on the post-sign-in target with an active session

#### Scenario: A returning visitor clicks "Continue with Google"

- **WHEN** a user who has signed in before visits `/login` and submits the form
- **THEN** the server redirects to the issuer's authorization endpoint and after consent the user is redirected to the post-sign-in target with an active session bound to their existing `users` row

#### Scenario: A visitor is bounced from a guarded page

- **WHEN** an unauthenticated user requests `/auth/myprofile`
- **THEN** the response is a 302 redirect to `/login?redirect=/auth/myprofile` and after sign-in the user is redirected to `/auth/myprofile`

#### Scenario: The redirect parameter is constrained to same-origin paths

- **WHEN** the `?redirect=` query parameter is present on `/login`
- **THEN** the server (via `safeRedirectTarget`) only honors it if it begins with a single `/` and does not begin with `//` **or `/\`** (both of which browsers may normalize into a protocol-relative URL pointing at another origin); otherwise the server falls back to `/auth/myprofile`. The existing backslash rejection MUST be preserved by the OIDC rewrite.

### Requirement: `/auth/callback` completes the OIDC flow and redirects to `next`

The `/auth/callback` route SHALL be a `+server.ts` GET handler. On successful verification, it creates a session and redirects to the recovered post-login target (sanitized via `safeRedirectTarget`, defaulting to `/auth/myprofile`).

#### Scenario: Successful callback redirects to default target

- **WHEN** no custom redirect target was stored and the callback succeeds
- **THEN** the browser is redirected to `/auth/myprofile`

#### Scenario: A guarded-route target survives the OIDC round-trip

- **WHEN** an unauthenticated user is bounced from `/auth/my-articles` to `/login?redirect=%2Fauth%2Fmy-articles`, signs in, and the sign-in action stored `/auth/my-articles` as the post-login target
- **THEN** after a successful callback the user lands on `/auth/my-articles`
