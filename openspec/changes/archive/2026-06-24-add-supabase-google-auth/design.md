## Context

The repo is a SvelteKit + Tailwind v4 + shadcn-svelte site for the Pekanbaru Dev community. The previous `setup-supabase-drizzle` change (archived 2026-06-24) wired up `@supabase/supabase-js`, Drizzle ORM, an initial `profiles`/`events`/`announcements`/`posts` schema, and a `db/seed.ts` that seeds profiles against a hand-picked `auth.users.id` — but no app code actually authenticates anyone yet. The landing page (issue #4) shipped with a "Sign in" link in the nav that has no destination.

Issues #5 and #6 are the first user-facing capabilities that need a real session. Instead of building an email/password flow (which would force us to own password reset, complexity rules, and verification UX) we delegate identity to Google through Supabase's OAuth provider. The "Quiet Bulletin" design system in DESIGN.md calls for minimal surfaces and a single ochre accent — a one-button sign-in matches that. Auth state is needed for `/myprofile` and will be needed for booking (a future change).

## Goals / Non-Goals

**Goals**

- One click signs a user in (existing Google account) or registers them (first time). No password is ever stored or entered in the app.
- `hooks.server.ts` validates the session on every request and exposes `event.locals.user` (typed) plus `event.locals.safeGetSession()` (the SSR helper).
- `/myprofile` is reachable only by an authenticated user; `/login` is the entry point and the post-OAuth destination is `/myprofile` (or a `?redirect=` query string if the user was bounced there).
- A `profiles` row is provisioned automatically the first time a Google identity signs in. `display_name` comes from Google's `full_name`; `avatar_url` from `picture`.
- RLS on `profiles` lets a user see and edit only their own row.

**Non-Goals**

- Email/password auth, magic links, phone OTP, Apple/Facebook/GitHub providers. (Google is the single provider for v1; adding another provider later is a config-only change in the Supabase dashboard.)
- Password reset, email change, account deletion UI. (Supabase's hosted UI can cover these later if needed; out of scope for this change.)
- Multi-factor authentication.
- Roles / admin claims. (Future change; the `profiles` table is the right place to add a `role` column when needed.)
- E2E tests for the OAuth popup itself. (Playwright cannot drive a Google consent screen against a real account without a pre-consented fixture; we add a unit test for the `getOrCreateProfile` helper instead.)

## Decisions

### D1. Use `@supabase/ssr`, not the deprecated `auth-helpers`

The Supabase team's current SvelteKit guide uses `@supabase/ssr`'s `createServerClient` + cookie wiring. `auth-helpers-sveltekit` is deprecated and points users to migrate. `@supabase/ssr` is also the package that ships the `safeGetSession()` pattern we want in `hooks.server.ts` — it distinguishes a cookie-present-but-unvalidated session from a fully server-validated one, which is what prevents spoofed user payloads from leaking into `event.locals`. The existing `@supabase/supabase-js` stays for the browser client and the typed DB call sites.

Alternatives considered: rolling our own cookie → JWT validation, using SvelteKit's `auth.js` adapter. Both are larger and either re-implement something Supabase already does, or replace it. `@supabase/ssr` is the path the maintainers publish, and it lines up with the rest of the project's Supabase story.

### D2. Profile provisioning runs in a Postgres trigger, not in app code

`on auth.users insert` → trigger function `handle_new_user()` reads `NEW.raw_user_meta_data->>'full_name'` and `->>'avatar_url'` (these are populated by Supabase Auth from Google's identity claims) and inserts a `profiles` row. The trigger is the right place because:

- It's atomic with the user insert; no race between the auth callback and the page load.
- The service role owns the write, so we don't need to teach the browser client (or any future server action) to upsert.
- It works for any future OAuth provider without code changes.

The trigger uses `on conflict do nothing` on `profiles.id` so re-running it (e.g., a manual `auth.users` insert during a backfill) is idempotent.

The RLS policy is `using (auth.uid() = id)` for `select` and `update`; `insert` and `delete` are blocked for the `authenticated` role. The service role bypasses RLS, which is what lets the trigger run.

Alternatives considered: server-side upsert in the `/login` callback. Rejected because it leaks "the app has to know to create the row" into a hot path and races with the user's first page render.

### D3. One `/login` route, not separate `/register` and `/login`

With a single OAuth provider, register and login are the same click. A user who doesn't have an account and clicks "Continue with Google" gets an account; a user who does, signs in. Two routes would have identical content. We keep one route, document this in the page, and close both issues. If a second provider is added later, the route can branch on a `?provider=` query string.

### D4. `hooks.server.ts` runs `auth.getUser()` per request, not just on guarded routes

`auth.getSession()` reads the cookie; `auth.getUser()` validates it with the Supabase auth server. The Supabase team's guidance is unambiguous: trust `getUser()` for server-side auth decisions, because `getSession()`'s return value can be spoofed by a client. The cost is a network round-trip per request — small (Supabase's auth server is colocated) and worth the security guarantee. We cache the result by stashing it in `event.locals` for the duration of the request so downstream `load` functions don't re-call it.

The hook is also where we enforce the "guarded route" rule: any URL under `/myprofile` (and, in the future, anything else marked auth-required) bounces to `/login?redirect=<original>`. We use a small list of path prefixes rather than a layout-level `+layout.server.ts` so the rule is grep-able.

### D5. Schema gains `avatar_url`; no `email` column

`auth.users` already has the email. `hooks.server.ts` calls `getUser()` anyway, so `event.locals.user.email` is free. We add `avatar_url text` to `profiles` for the `/myprofile` avatar (and any future site-wide avatar). We do not denormalize email into `profiles` — it's available from the auth server and adding it would create a second source of truth.

### D6. Session storage: cookies only, no localStorage

`@supabase/ssr` writes the session to a cookie pair (`sb-<project-ref>-auth-token` and its `-code-verifier` chunk). No localStorage, no client-side persistence beyond what the browser does for cookies. The browser client and the server client both read these cookies; this is what lets `hooks.server.ts` see the same session the browser does, which is what makes server-side `load` functions work without a client round-trip.

## Risks / Trade-offs

- **Google outage → app is unreachable for new sign-ins.** Existing sessions are unaffected (they're JWTs). Mitigation: a future change can add a second provider (e.g., GitHub) by toggling Supabase config and adding a second button to `/login`. Out of scope here.
- **`@supabase/ssr` is a thin wrapper around `@supabase/supabase-js`; breaking changes upstream affect us.** Mitigation: pin to a specific minor version in `package.json` and update deliberately. Same posture as the rest of the project.
- **Playwright cannot test the Google consent screen.** Mitigation: cover `getOrCreateProfile` (the only piece of this change that has non-trivial logic) with a Vitest unit test using a mocked Supabase client. Cover the hooks/redirect logic with a `pnpm test:e2e` smoke test that mocks the session cookie.
- **A user with multiple Google accounts can sign in with any of them.** This is the intended behavior; we don't expose account picker UX in v1 because Google's consent screen already does. If we add a "switch account" affordance later it lives on `/myprofile`.
- **The `profiles` row is created with no email-verification step because Google's identity is already verified.** This is a feature, not a bug. If we ever add a provider without verification (e.g., a custom email provider) we'll need to revisit.

## Migration Plan

This is a green-field auth change — there are no existing users to migrate.

1. **Apply in dev first.** `pnpm db:push` applies the new RLS policies and trigger locally; manually enable the Google provider in the dev Supabase project's Auth settings (one-time).
2. **Apply in prod.** Same `db:push` against the prod database (or a generated migration checked into `db/migrations/`); enable the Google provider in the prod Supabase project; verify the redirect URL is `https://<project-ref>.supabase.co/auth/v1/callback` plus any custom domain in the future.
3. **Rollback.** Disable the Google provider in the Supabase dashboard; the trigger and RLS policies can stay (they're inert without sign-ins). The new routes can be deleted with no other code referencing them. No data is deleted by the rollback.
4. **Feature flag.** None. The two routes are added; the nav link to "Sign in" (in the landing page) starts working as soon as the change deploys. If we want a staged rollout, gate the nav link on a feature flag — but for a site with zero users, we ship the link and the page together.

## Open Questions

- Should the nav "Sign in" link in `src/routes/+page.svelte` (landing page) get a sign-out variant when the user is signed in? It does not today; this change adds the underlying pages but not the nav reactivity. Decision: out of scope for this change — `/myprofile` is reachable directly, and a future change can wire the nav to `event.locals.user` via a `+layout.server.ts`.
- Do we need a "Sign in with Google" button on the landing page, or is the "Sign in" text link enough? Current plan: keep the existing text link (the link already exists in the landing page nav; we just give it a destination). Change scope: confirmed — no landing-page edits in this change.
