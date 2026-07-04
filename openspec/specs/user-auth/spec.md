# user-auth Specification

## Purpose

TBD - created by archiving change add-supabase-google-auth. Update Purpose after archive.
## Requirements
### Requirement: Sign-in is a single Google OAuth action

The system SHALL expose sign-in as a single "Continue with Google" action on `/login`. The action SHALL be implemented as a SvelteKit form `action` that calls Supabase Auth's `signInWithOAuth({ provider: 'google', options: { redirectTo } })` server-side. The `redirectTo` SHALL be the absolute URL of `/auth/callback?next=<safe-target>`, where `<safe-target>` is the post-sign-in destination (defaults to `/myprofile`, or a user-supplied `?redirect=` query parameter validated to be a same-origin path starting with `/`).

The system MUST NOT present a separate registration form, password field, confirm-password field, or email field on `/login`. The same action SHALL register new Google identities and sign in existing ones — Supabase Auth's OAuth callback returns an authenticated session in both cases.

#### Scenario: A new visitor clicks "Continue with Google" for the first time

- **WHEN** a user who has never signed in visits `/login` and submits the form
- **THEN** the server returns a redirect to Google's OAuth consent screen, and after consent the user is redirected to `/auth/callback?code=…&next=/myprofile`, the callback exchanges the code for a session, and the browser lands on `/myprofile` with an active session

#### Scenario: A returning visitor clicks "Continue with Google"

- **WHEN** a user who has signed in before visits `/login` and submits the form
- **THEN** the server returns a redirect to Google's consent screen and after consent the user is redirected to `/myprofile` with an active session

#### Scenario: A visitor is bounced from a guarded page

- **WHEN** an unauthenticated user requests `/myprofile`
- **THEN** the response is a 302 redirect to `/login?redirect=/myprofile` and after sign-in the user is redirected to `/myprofile`

#### Scenario: The redirect parameter is constrained to same-origin paths

- **WHEN** the `?redirect=` query parameter is present on `/login`
- **THEN** the server only honors it if it begins with a single `/` and does not begin with `//` (which would be a protocol-relative URL pointing at another origin); otherwise the server falls back to `/myprofile`

### Requirement: `/auth/callback` exchanges the OAuth code and redirects to `next`

The `/auth/callback` route SHALL be a `+server.ts` GET handler that:

1. Reads `code`, `error`, and `next` from the query string.
2. If `error` is set, redirects to `/login?error=<error>` without calling `exchangeCodeForSession`.
3. If `code` is set, calls `supabase.auth.exchangeCodeForSession(code)`. The session cookie is written to the response by the `setAll` cookie callback in the SSR client. On exchange failure, redirects to `/login?error=oauth_callback`.
4. Otherwise (no code, no error — e.g. user opened the URL directly), redirects to `next` (sanitized via `safeRedirectTarget`, defaulting to `/myprofile`).

The `/auth/callback` path SHALL NOT appear in `GUARDED_PREFIXES` in `hooks.server.ts` so the request reaches the handler even though no session is present yet.

#### Scenario: A new Google identity completes consent

- **WHEN** Supabase redirects the browser to `/auth/callback?code=<code>&next=/myprofile`
- **THEN** the handler calls `exchangeCodeForSession`, the session cookie is set, and the response is a 303 redirect to `/myprofile`

#### Scenario: The OAuth provider returns an error

- **WHEN** Google redirects the browser to `/auth/callback?error=access_denied`
- **THEN** the handler does not call `exchangeCodeForSession` and the response is a 303 redirect to `/login?error=access_denied`

#### Scenario: The code exchange fails (e.g. expired, replayed)

- **WHEN** the handler calls `exchangeCodeForSession` and the call returns an error
- **THEN** the response is a 303 redirect to `/login?error=oauth_callback` and the page renders a user-readable message

#### Scenario: `next` is constrained to same-origin paths

- **WHEN** the `?next=` query parameter is `//evil.com/pwn` or `https://evil.com/pwn`
- **THEN** the handler falls back to `/myprofile`

### Requirement: A `profiles` row is provisioned on first Google sign-in

A Postgres trigger SHALL fire on `insert` to `auth.users` and create a corresponding row in `public.profiles`. The trigger SHALL populate `display_name` from `NEW.raw_user_meta_data->>'full_name'`, falling back to the local part of `NEW.email` (the substring before `@`) when the Google identity does not provide a name. The trigger SHALL populate `avatar_url` from `NEW.raw_user_meta_data->>'avatar_url'` and SHALL set it to `NULL` if absent.

The trigger SHALL be `security definer`, SHALL use `on conflict (id) do nothing` so it is idempotent on re-runs, and SHALL run as the `postgres` role (which bypasses RLS).

#### Scenario: A new Google identity signs in for the first time

- **WHEN** Supabase Auth creates an `auth.users` row for a Google identity whose `raw_user_meta_data` includes `full_name = "Rina Aulia"` and `avatar_url = "https://…/photo.jpg"`
- **THEN** a `profiles` row exists with the same `id` as the `auth.users` row, `display_name = "Rina Aulia"`, and `avatar_url = "https://…/photo.jpg"`

#### Scenario: A Google identity has no `full_name`

- **WHEN** Supabase Auth creates an `auth.users` row for a Google identity with `email = "rina@example.com"` and no `full_name` in `raw_user_meta_data`
- **THEN** a `profiles` row exists with `display_name = "rina"` (the email's local part) and `avatar_url = NULL`

#### Scenario: The trigger is idempotent

- **WHEN** the trigger runs twice for the same `auth.users.id` (e.g., during a backfill or re-run of the migration)
- **THEN** the second run does not raise and the `profiles` row is unchanged

### Requirement: Session is validated on every request

`src/hooks.server.ts` SHALL run on every request and call Supabase Auth's `getUser()` (not `getSession()`) using a server Supabase client bound to the request's cookies. The validated session SHALL be stashed on `event.locals.user` and `event.locals.safeGetSession()` for the lifetime of the request. `event.locals.user` SHALL be typed as `User | null` and exposed via `src/app.d.ts`.

#### Scenario: A request with a valid session cookie

- **WHEN** a request arrives carrying a valid `sb-<project-ref>-auth-token` cookie
- **THEN** `hooks.server.ts` calls `getUser()` against the Supabase auth server, the call succeeds, and `event.locals.user` is populated with `{ id, email, … }` for downstream `load` functions and form actions

#### Scenario: A request with no cookie or a forged cookie

- **WHEN** a request arrives with no auth cookie, or with a cookie whose JWT signature is invalid
- **THEN** `getUser()` returns `null`, `event.locals.user` is `null`, and the request continues (or is redirected, per the guarded-routes requirement)

#### Scenario: `event.locals` is typed

- **WHEN** a developer writes a `+page.server.ts` `load` function and types `event.locals.user`
- **THEN** TypeScript narrows the type to `User | null` from `@supabase/supabase-js` (no `any`)

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

### Requirement: `/myprofile` displays the signed-in user's profile

The `/myprofile` route SHALL render the signed-in user's `display_name`, `email` (from the validated session), and `avatar_url` (from `profiles`, falling back to a neutral monogram if absent). The page SHALL also render a "Sign out" form whose submission invokes a SvelteKit form `action` that calls Supabase Auth's `signOut()` server-side.

The page SHALL be implemented as `src/routes/myprofile/+page.svelte` and `src/routes/myprofile/+page.server.ts`. The `load` function SHALL read the profile row by `event.locals.user.id` and SHALL return it to the page. If the `profiles` row is unexpectedly missing (e.g., a race with the trigger), the `load` function SHALL return a typed `null` and the page SHALL render a "Profile unavailable" notice rather than crash.

#### Scenario: An authenticated user opens `/myprofile`

- **WHEN** the `load` function runs and the `profiles` row exists for the current user
- **THEN** the page renders the display name, email, avatar, and a "Sign out" button

#### Scenario: A user signs out from `/myprofile`

- **WHEN** the user submits the "Sign out" form action
- **THEN** the server calls `supabase.auth.signOut()`, the session cookie is cleared, and the response is a 303 redirect to `/`

#### Scenario: The profile row is missing

- **WHEN** the `load` function runs but the `profiles` row does not exist for `event.locals.user.id`
- **THEN** the page renders a "Profile unavailable" notice (no stack trace) and the Sign out action still works

### Requirement: Session is shared between server and browser clients

The SvelteKit FE SHALL define two Supabase clients: a server client at `src/lib/server/supabase/client.ts` (uses the anon key, binds to the request's cookies, never reaches the browser bundle) and a browser client at `src/lib/supabase/client.ts` (uses the anon key, persists the session in cookies, is the only Supabase client reachable from `.svelte` files). Both clients SHALL share the same cookie names so the session round-trips correctly through `@supabase/ssr`'s `setAll` callback.

#### Scenario: Server `load` reads the same session as the browser

- **WHEN** a `+page.server.ts` `load` function calls `event.locals.supabase.auth.getUser()` and a sibling browser effect calls the same `auth.getUser()` on the browser client
- **THEN** both calls return the same `User` object

#### Scenario: The server client is never bundled into the browser

- **WHEN** `pnpm build` runs
- **THEN** the server client module does not appear in the client-side output of the SvelteKit build (it lives under `$lib/server/`)

### Requirement: Sign-in errors are surfaced as a page-level message

If `signInWithOAuth` returns an error (network failure, Supabase misconfiguration, the Google provider not being enabled), the `/login` form action SHALL return a typed `fail()` with a short, user-readable message in Indonesian (matching the rest of the site's copy) and the page SHALL render the message above the "Continue with Google" button. The system MUST NOT expose the raw Supabase error object to the browser.

#### Scenario: The Google provider is not enabled in the Supabase project

- **WHEN** the user submits `/login` and the server-side `signInWithOAuth` call returns an error
- **THEN** the page renders the message "Login dengan Google belum tersedia. Hubungi admin." and the raw error is logged server-side only

