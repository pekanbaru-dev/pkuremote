## MODIFIED Requirements

### Requirement: Sign-in is a single Google OAuth action

The system SHALL expose sign-in as a single "Continue with Google" action on `/login`. The action SHALL be implemented as a SvelteKit form `action` that, server-side, starts an **OIDC authorization-code flow via Arctic** against the configured issuer (`OIDC_ISSUER`): it generates a `state` and a PKCE `code_verifier` (and a `nonce`), stores them in short-lived httpOnly cookies, builds the authorization URL (scopes `openid email profile`) with `redirect_uri` = the absolute URL of `/auth/callback`, and issues a redirect to it. The issuer is Dex in development and Google (`https://accounts.google.com`) in production; the code path is identical and provider-agnostic — only `OIDC_ISSUER` differs.

The system MUST NOT present a separate registration form, password field, confirm-password field, or email field on `/login`. The same action SHALL register new identities and sign in existing ones — the OIDC callback provisions the user on first sign-in and looks them up on subsequent sign-ins.

#### Scenario: A new visitor clicks "Continue with Google" for the first time

- **WHEN** a user who has never signed in visits `/login` and submits the form
- **THEN** the server sets `state`/`code_verifier`/`nonce` cookies and returns a redirect to the issuer's authorization endpoint, and after consent the browser is redirected to `/auth/callback?code=…&state=…`, the callback verifies the response and provisions the user, and the browser lands on the post-sign-in target with an active session

#### Scenario: A returning visitor clicks "Continue with Google"

- **WHEN** a user who has signed in before visits `/login` and submits the form
- **THEN** the server redirects to the issuer's authorization endpoint and after consent the user is redirected to the post-sign-in target with an active session bound to their existing `users` row

#### Scenario: A visitor is bounced from a guarded page

- **WHEN** an unauthenticated user requests `/myprofile`
- **THEN** the response is a 302 redirect to `/login?redirect=/myprofile` and after sign-in the user is redirected to `/myprofile`

#### Scenario: The redirect parameter is constrained to same-origin paths

- **WHEN** the `?redirect=` query parameter is present on `/login`
- **THEN** the server only honors it if it begins with a single `/` and does not begin with `//`; otherwise the server falls back to `/myprofile`

### Requirement: `/auth/callback` completes the OIDC flow and redirects to `next`

The `/auth/callback` route SHALL be a `+server.ts` GET handler that:

1. Reads `code`, `state`, and `error` from the query string and `state`/`code_verifier`/`nonce` from the request cookies.
2. If `error` is set, redirects to `/login?error=<error>` without exchanging the code.
3. Validates that the returned `state` matches the stored `state`; on mismatch, redirects to `/login?error=oauth_callback`.
4. Exchanges `code` for tokens via Arctic (`validateAuthorizationCode`) using the stored PKCE `code_verifier`, then verifies the returned `id_token` with **jose** against the issuer's JWKS, asserting `iss` matches `OIDC_ISSUER`, `aud` matches `OIDC_CLIENT_ID`, `nonce` matches the stored nonce, and the token is unexpired. On any failure, redirects to `/login?error=oauth_callback`.
5. Requires `email_verified === true` in the verified claims (uniformly, in every environment). If the claim is absent or false, the handler creates no session and redirects to `/login?error=oauth_callback`.
6. Provisions/looks up the user (see the provisioning requirement), creates a DB-backed session with a fixed absolute **6-hour** expiry (`expires_at = now + 6h`), sets the session cookie (httpOnly, Secure, SameSite=Lax), clears the transient `state`/`code_verifier`/`nonce` cookies, and redirects to `next` (sanitized via `safeRedirectTarget`, defaulting to `/myprofile`).

The `/auth/callback` path SHALL NOT appear in `GUARDED_PREFIXES` in `hooks.server.ts` so the request reaches the handler even though no session is present yet.

#### Scenario: A new identity completes consent

- **WHEN** the issuer redirects the browser to `/auth/callback?code=<code>&state=<state>` with a matching `state` cookie
- **THEN** the handler exchanges the code, verifies the `id_token`, provisions the user, sets the session cookie, and returns a 303 redirect to `/myprofile`

#### Scenario: The OAuth provider returns an error

- **WHEN** the issuer redirects the browser to `/auth/callback?error=access_denied`
- **THEN** the handler does not exchange the code and the response is a 303 redirect to `/login?error=access_denied`

#### Scenario: The state does not match (CSRF / stale flow)

- **WHEN** the `state` query parameter does not match the `state` cookie (or the cookie is absent)
- **THEN** the handler does not exchange the code and the response is a 303 redirect to `/login?error=oauth_callback`

#### Scenario: The id_token fails verification

- **WHEN** token exchange succeeds but `id_token` verification fails (bad signature, wrong `iss`/`aud`, mismatched `nonce`, or expired)
- **THEN** no session is created and the response is a 303 redirect to `/login?error=oauth_callback`

#### Scenario: The email is not verified

- **WHEN** the `id_token` verifies but `email_verified` is absent or `false`
- **THEN** no user is provisioned, no session is created, and the response is a 303 redirect to `/login?error=oauth_callback`

#### Scenario: The session is created with a 6-hour expiry

- **WHEN** the callback creates a session for a verified identity
- **THEN** the `sessions` row's `expires_at` is 6 hours after creation and the session cookie is httpOnly, Secure, and SameSite=Lax

#### Scenario: `next` is constrained to same-origin paths

- **WHEN** the `?next=` query parameter is `//evil.com/pwn` or `https://evil.com/pwn`
- **THEN** the handler falls back to `/myprofile`

### Requirement: A `users`/`profiles` record is provisioned on first sign-in

On a verified OIDC callback the system SHALL, in a single transaction, resolve or create the identity in application code (replacing the former `handle_new_user` database trigger), using this match precedence:

1. If an `oauth_accounts` row matches `(provider, provider_uid = id_token.sub)`, use its `user_id`.
2. Otherwise, if a `users` row matches the `email` claim, link a new `oauth_accounts` row `(provider, sub, user_id)` to it.
3. Otherwise, create a `users` row (with `email_verified` from the claim), the `oauth_accounts` row, and a `profiles` row.

The `profiles` row (created in case 3, and back-filled in case 2 if absent) SHALL have `id = users.id`, `display_name` from the `name` claim falling back to the local part of `email` (the substring before `@`, or `"Pengguna"` when empty), and `avatar_url` from the `picture` claim (NULL when absent).

The upsert SHALL be idempotent: a returning user's second sign-in creates no duplicate `users`, `oauth_accounts`, or `profiles` rows.

#### Scenario: A new identity signs in for the first time

- **WHEN** the callback verifies an `id_token` with `email = "rina@example.com"`, `name = "Rina Aulia"`, `picture = "https://…/photo.jpg"`, and a new `sub`
- **THEN** a `users` row, an `oauth_accounts` row for that `sub`, and a `profiles` row with `display_name = "Rina Aulia"` and `avatar_url = "https://…/photo.jpg"` all exist, sharing the same id

#### Scenario: An identity has no `name` claim

- **WHEN** the callback verifies an `id_token` with `email = "rina@example.com"` and no `name`
- **THEN** the `profiles` row has `display_name = "rina"` (the email local part) and `avatar_url = NULL`

#### Scenario: Provisioning is idempotent

- **WHEN** the same identity (same `sub`/`email`) signs in a second time
- **THEN** no new `users`, `oauth_accounts`, or `profiles` rows are created and the existing rows are reused

### Requirement: Session is validated on every request

`src/hooks.server.ts` SHALL run on every request and validate the session **against the `sessions` table**, not a remote auth server. It SHALL read the opaque session id from the session cookie, look up the (hashed) id in `sessions`, and treat the session as valid only if the row exists and `expires_at` is in the future. The resolved user SHALL be stashed on `event.locals.user` for the lifetime of the request, typed as an application user type (`{ id, email, … } | null`) exposed via `src/app.d.ts` — no `@supabase/supabase-js` types. Expired or unknown sessions SHALL yield `event.locals.user = null` (and MAY clear the stale cookie).

#### Scenario: A request with a valid session cookie

- **WHEN** a request arrives carrying a session cookie whose id maps to a `sessions` row with `expires_at` in the future
- **THEN** `hooks.server.ts` populates `event.locals.user` with `{ id, email, … }` for downstream `load` functions and form actions

#### Scenario: A request with no cookie, an unknown id, or an expired session

- **WHEN** a request arrives with no session cookie, an id absent from `sessions`, or a row whose `expires_at` is in the past
- **THEN** `event.locals.user` is `null` and the request continues (or is redirected, per the guarded-routes requirement); an encountered expired row is deleted (delete-on-encounter) and the stale cookie MAY be cleared

#### Scenario: `event.locals` is typed without Supabase

- **WHEN** a developer types `event.locals.user` in a `+page.server.ts` `load`
- **THEN** TypeScript narrows it to the application user type declared in `src/app.d.ts` (no `@supabase/supabase-js` import, no `any`)

### Requirement: `/myprofile` displays the signed-in user's profile

The `/myprofile` route SHALL render the signed-in user's `display_name`, `email`, and `avatar_url` (from `profiles`, falling back to a neutral monogram if absent). The page SHALL render a "Sign out" form whose submission invokes a SvelteKit form `action` that **deletes the current session row and clears the session cookie** (replacing the former `supabase.auth.signOut()`), then redirects to `/`.

The `load` function SHALL read the profile by `event.locals.user.id` and return it; if the `profiles` row is unexpectedly missing it SHALL return a typed `null` and the page SHALL render a "Profile unavailable" notice rather than crash.

#### Scenario: An authenticated user opens `/myprofile`

- **WHEN** the `load` function runs and the `profiles` row exists for the current user
- **THEN** the page renders the display name, email, avatar, and a "Sign out" button

#### Scenario: A user signs out from `/myprofile`

- **WHEN** the user submits the "Sign out" form action
- **THEN** the server deletes the session row, clears the session cookie, and returns a 303 redirect to `/`; a subsequent request is unauthenticated

#### Scenario: The profile row is missing

- **WHEN** the `load` function runs but no `profiles` row exists for `event.locals.user.id`
- **THEN** the page renders a "Profile unavailable" notice (no stack trace) and the Sign out action still works

### Requirement: Sign-in errors are surfaced as a page-level message

If starting the OIDC flow fails (issuer discovery failure, misconfiguration, network error), the `/login` form action SHALL return a typed `fail()` with a short, user-readable message in Indonesian and the page SHALL render it above the "Continue with Google" button. The system MUST NOT expose the raw error object to the browser; the raw error is logged server-side only.

#### Scenario: The issuer is unreachable or misconfigured

- **WHEN** the user submits `/login` and starting the OIDC flow throws (e.g. discovery of `OIDC_ISSUER` fails)
- **THEN** the page renders "Login dengan Google belum tersedia. Hubungi admin." and the raw error is logged server-side only

## REMOVED Requirements

### Requirement: Session is shared between server and browser clients

**Reason**: The two-Supabase-client model (`src/lib/server/supabase/client.ts` + `src/lib/supabase/client.ts`) is removed with `@supabase/ssr`. Sessions are now DB-backed and server-managed: the browser never runs an auth client, and there is no session to "share" client-side — only an opaque, httpOnly session cookie the browser cannot read.

**Migration**: Delete both Supabase client modules. Server code reads `event.locals.user` (populated from the `sessions` lookup in `hooks.server.ts`); client code that needs the current user receives it through `load` data, not a browser auth client.
