## Why

Issues [#5 (User Registration)](https://github.com/pekanbaru-dev/pkuremote/issues/5) and [#6 (User Login)](https://github.com/pekanbaru-dev/pkuremote/issues/6) currently specify a classic email + password flow with self-managed forms. We already have a Supabase project wired up (auth provider + Postgres + Drizzle), and the site is editorial and low-friction by design (PRODUCT.md: "calm, minimal, focused"). A password flow forces us to build password reset, complexity rules, email verification UX, and an extra error surface — all of which fight that brand. Google OAuth (already a one-click flow in `@supabase/supabase-js`) is the shortest path that satisfies both user stories and gives us a verified email + display name for free.

## What Changes

- **Replace** the email/password register and login flow with a single "Continue with Google" action powered by Supabase's OAuth provider. The first sign-in creates the `auth.users` row; the first sign-in for a new OAuth identity also provisions a `profiles` row (display name from the Google identity, keyed on `auth.users.id`).
- **Add** a `/login` page with a single Google sign-in button (the action is register-or-login; both issues resolve to the same page).
- **Add** a `/myprofile` page that requires an active session, shows the signed-in user's display name and email, and exposes a Sign out action.
- **Add** a `hooks.server.ts` that validates the Supabase session cookie on every request via the documented SvelteKit + `@supabase/ssr` pattern, populates `event.locals.safeGetSession()` and `event.locals.user`, and redirects unauthenticated `/myprofile` visits to `/login?redirect=/myprofile`.
- **Add** Supabase clients in `$lib/supabase/client.ts` (browser) and `$lib/server/supabase/client.ts` (server, uses the anon key + cookies for per-request session validation) so server `load` functions and form actions can read the current user without round-tripping through the browser.
- **Add** a server `actions` handler on `/login` that calls `signInWithOAuth({ provider: 'google', options: { redirectTo } })`; a `signOut` server action lives next to it for `/myprofile`.
- **Add** a database trigger (or first-load upsert) that creates a `profiles` row the first time a Google user is seen, populated with `display_name` = `identity.identity_data->>'full_name'` falling back to the email's local part.
- **Add** RLS policies on `profiles` so a user can only `select` and `update` the row where `id = auth.uid()`. Service-role writes remain permitted for the seed/migration scripts.
- **Update** the `drizzle-integration` env example to document the two new public vars the FE already needs (already in `.env.example`/`README.md` from the Supabase-Drizzle change) and add a one-time Google OAuth provider setup note in the README.

**BREAKING**: Issue #5 and #6 acceptance criteria that mention "password", "confirm password", and "Email harus unik / Password minimal 8 karakter" are no longer applicable — Google owns those concerns. The user stories (booking-gated sign-in) are still satisfied; only the form fields change.

## Capabilities

### New Capabilities

- `user-auth`: Single capability covering sign-in (Google OAuth), session validation in `hooks.server.ts`, automatic `profiles` row creation on first sign-in, the `/login` page, the `/myprofile` page, the sign-out action, and the RLS policies that make a user see and edit only their own row. Both issues #5 and #6 are closed by this single capability.

### Modified Capabilities

- `drizzle-integration`: Adds an automatic `profiles` row provisioning step tied to first OAuth sign-in (currently `profiles` is created by `db/seed.ts` only; the live path now creates rows lazily on sign-in). New RLS policies on `profiles`. README gains a one-time Google provider setup step.

## Impact

- **New files**:
  - `src/hooks.server.ts` — session validation + redirect to `/login` for guarded routes.
  - `src/lib/supabase/client.ts` — browser Supabase client.
  - `src/lib/server/supabase/client.ts` — server Supabase client (anon key, per-request cookie binding).
  - `src/lib/server/supabase/profiles.ts` — `getOrCreateProfile(event)` helper (server-only).
  - `src/routes/login/+page.svelte`, `src/routes/login/+page.server.ts` — sign-in CTA + OAuth action.
  - `src/routes/myprofile/+page.svelte`, `src/routes/myprofile/+page.server.ts` — gated page + sign-out action.
  - `db/migrations/<n>_profiles_rls_and_google_identity.sql` (or generated via `drizzle-kit`) — RLS policies + the `handle_new_oauth_user` trigger that creates a `profiles` row on first `auth.users` insert where the provider is `google`.
  - `supabase/config.toml` snippet (documented in README) — Google provider config in the Supabase project.
- **New dependency**: `@supabase/ssr` (the SSR helper that replaces the deprecated `auth-helpers` package; recommended in the current Supabase SvelteKit guide).
- **Modified files**: `package.json` (add `@supabase/ssr`), `README.md` (Google provider setup step), `db/schema/profiles.ts` (add optional `avatar_url` and `email` columns populated from the Google identity so `/myprofile` can render them without a second auth lookup).
- **External**: One-time manual step in the Supabase Cloud dashboard — enable the Google provider, paste the OAuth client ID/secret from Google Cloud Console, set the redirect URL to `https://<project-ref>.supabase.co/auth/v1/callback`. Documented in README; no app code depends on the specific Google project.
- **Build/CI**: `pnpm check` and `pnpm lint` stay green. No E2E test is added in this change (Google's OAuth popup is not testable in Playwright without a real Google account and pre-consented cookies; a future change can add a Vitest unit test for the `getOrCreateProfile` helper using a mocked Supabase client).
