## 1. Dependencies and environment

- [x] 1.1 Add `@supabase/ssr` to `package.json` (use the version pinned in the Supabase SvelteKit guide; check the current latest stable)
- [x] 1.2 Run `pnpm install` and confirm `pnpm check` stays green

## 2. Schema changes (Drizzle + Postgres)

- [x] 2.1 Add `avatarUrl: text('avatar_url')` (nullable) to `db/schema/profiles.ts` and export the updated `Profile` type
- [x] 2.2 Run `pnpm db:generate` to produce a new migration under `db/migrations/`
- [x] 2.3 Hand-edit the generated migration to (a) add the `avatar_url` column, (b) enable RLS on `profiles`, (c) create the `select` and `update` policies limited to `id = auth.uid()`, and (d) create the `handle_new_user` trigger function and the `on auth.users insert` trigger. Keep the generated Drizzle SQL; append the policy and trigger SQL.
- [x] 2.4 Apply the migration against the dev Supabase project and verify the new column, the RLS policies, and the trigger are present. Used `pnpm db:migrate` (not `db:push`) because Drizzle's sync mode doesn't know about RLS/triggers and would have tried to drop them; verified directly via psql.

## 3. Supabase clients

- [x] 3.1 Create `src/lib/supabase/client.ts` exporting a `createBrowserClient` factory that reads `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from `$env/static/public` and returns a `@supabase/ssr` browser client
- [x] 3.2 Create `src/lib/server/supabase/client.ts` exporting a `createServerClient(event)` factory that reads `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` and wires cookies via `event.cookies` using the `getAll`/`setAll` pattern from the Supabase SSR docs
- [x] 3.3 Update `src/app.d.ts` to declare `App.Locals` with `supabase: ReturnType<typeof createServerClient>` and `safeGetSession: () => Promise<{ session: Session | null; user: User | null }>` and `user: User | null`

## 4. Hooks and session validation

- [x] 4.1 Create `src/hooks.server.ts` that calls `createServerClient(event)`, exposes it as `event.locals.supabase`, runs `event.locals.safeGetSession()` to populate `event.locals.user`, and implements the guarded-prefix redirect for `/myprofile`
- [x] 4.2 Verify the hook runs without error on a local dev server (`pnpm dev`); the landing page should still render and `event.locals.user` should be `null` for an unauthenticated visitor

## 5. `/login` page

- [x] 5.1 Create `src/routes/login/+page.svelte` with a single form whose submit posts to the default action; the button label is "Continue with Google" and the page has a short "Sign in or register with Google" lead line
- [x] 5.2 Create `src/routes/login/+page.server.ts` exporting a default `actions.default` that validates the `?redirect=` query (same-origin path only, falling back to `/myprofile`), calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: /auth/callback?next=... } })`, returns a 303 to the returned `data.url` on success, and returns `fail()` with a user-readable message on error
- [x] 5.3 Add unit tests for `safeRedirectTarget` and `startGoogleSignIn` in `src/lib/server/auth/{redirect,google-oauth}.test.ts` covering: (a) a missing `?redirect=` defaults to `/myprofile`, (b) a `?redirect=//evil.com` falls back to `/myprofile`, (c) the constructed `redirectTo` is `/auth/callback?next=<encoded-target>`, (d) an error from `signInWithOAuth` returns `fail()`

## 5a. `/auth/callback` route (added during testing — closes the post-OAuth bounce loop)

- [x] 5a.1 Add `src/lib/server/auth/oauth-callback.ts` with `resolveOAuthCallback({ supabase, code, errorParam, next })` that returns a redirect location for the four cases (error, code success, code failure, neither)
- [x] 5a.2 Add `src/routes/auth/callback/+server.ts` GET handler that calls `resolveOAuthCallback` and `redirect(303, …)` — `/auth/callback` is intentionally NOT in `GUARDED_PREFIXES`
- [x] 5a.3 Update `startGoogleSignIn` so `redirectTo` is `${origin}/auth/callback?next=<encoded-target>` instead of the target itself
- [x] 5a.4 Update `/login` `load` to surface `?error=` from the callback as a user-readable message
- [x] 5a.5 Add unit tests for `resolveOAuthCallback` covering all four redirect branches

## 6. `/myprofile` page

- [x] 6.1 Create `src/routes/myprofile/+page.server.ts` exporting a `load` that reads `event.locals.user` and, if present, queries the `profiles` row by id via Drizzle; returns `{ user, profile: Profile | null }` (the load function is gated by the hook's redirect, so `event.locals.user` is non-null when the load runs)
- [x] 6.2 Export a `actions.signOut` form action that calls `supabase.auth.signOut()` and returns a 303 redirect to `/`
- [x] 6.3 Create `src/routes/myprofile/+page.svelte` that renders display name, email, and avatar (or a monogram fallback) and a "Sign out" form posting to the `?/signOut` action
- [x] 6.4 Add a unit test that asserts the `load` function returns `profile: null` when the Drizzle query returns no rows (without throwing)

## 7. Documentation and verification

- [x] 7.1 Update `README.md` with a one-time "Enable the Google provider" step (link to the Supabase dashboard, list the redirect URL `https://<project-ref>.supabase.co/auth/v1/callback`, and note that the OAuth client ID/secret come from the Google Cloud Console)
- [x] 7.2 Run `pnpm check` and `pnpm lint`; fix any new diagnostics
- [x] 7.3 Run `pnpm test:unit -- --run` and confirm all new unit tests pass
- [x] 7.4 Manual end-to-end smoke test: load `/` (anonymous, should render), click the nav "Sign in" link (should land on `/login`), click "Continue with Google" (should reach Google's consent), complete consent (should land on `/myprofile` with display name + email), click "Sign out" (should land on `/` with no session), repeat the bounce: visit `/myprofile` while signed out (should redirect to `/login?redirect=/myprofile`)
- [ ] 7.5 Close issues #5 and #6 on GitHub with a comment linking the merged PR and noting that the password-based acceptance criteria were replaced by Google OAuth
