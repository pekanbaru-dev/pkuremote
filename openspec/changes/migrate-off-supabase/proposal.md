## Why

The app currently depends on Supabase Cloud for three things — Postgres, Google OAuth (GoTrue), and session cookies — while using none of Supabase's other services (Storage, Realtime, PostgREST). RLS policies exist but enforce nothing, because Drizzle connects with a direct role that bypasses them. This couples a small, self-hostable app to a managed vendor for capabilities it can run itself, and blocks moving the database into the same Docker stack as the rest of the deployment. Owning the auth flow (via Arctic) and the Postgres instance removes the vendor dependency, collapses the connection model, and makes the whole system deployable on a modest VPS with no external identity service beyond Google.

## What Changes

- **BREAKING** Remove `@supabase/supabase-js` and `@supabase/ssr`. Auth is reimplemented with **Arctic** (OAuth2/OIDC client) + **jose** (id_token verification), talking to a generic OIDC issuer.
- **BREAKING** Replace Supabase-managed sessions with **DB-backed sessions**: a `sessions` table, an opaque session id in an httpOnly cookie, server-side validation on every request. No more `getSession()`/`getUser()` against a remote auth server.
- **BREAKING** Stop depending on the Supabase-managed `auth.users` table. Introduce app-owned `users` and `oauth_accounts` tables. `profiles.id` FKs to `users.id` (shared PK, 1:1) — the **same shape** as today's `profiles.id → auth.users.id`, so `registrations`/`posts` FKs are untouched.
- **BREAKING** Delete the `handle_new_user()` `SECURITY DEFINER` trigger. Profile provisioning (derive `display_name` from the `name` claim, fall back to the email local-part; set nullable `avatar_url` from `picture`) moves into the OIDC callback as readable, testable app code.
- **BREAKING** Drop the `profiles` RLS policies and `auth.uid()` usage — dead weight given the direct-connection access model; authorization stays in `hooks.server.ts` + `requireAdmin`.
- Provider is **environment-swappable via a single `OIDC_ISSUER`**: a local **Dex** IdP in development, Google (`https://accounts.google.com`) in production. One provider-agnostic code path so dev faithfully rehearses prod.
- Collapse the connection model: drop `DIRECT_URL` and the pooler; a single `DATABASE_URL` points at the Docker Postgres. Migrations and seed use the same URL.
- Rewrite `db/seed.ts` and `db/seed-dev-admin.ts` to insert `users`/`profiles` rows directly (no `supabase.auth.admin.createUser`).
- Add a **dev-only** Dex service to the local Docker stack (static password users, offline, never shipped to production). The existing `DEV_ADMIN_EMAIL` bypass is retained.
- **No data migration** — this is greenfield: fresh schema + reseed. Existing Supabase data is not carried over.

## Capabilities

### New Capabilities

- `local-oidc-dev`: A development-only, self-hosted OIDC provider (Dex) run via Docker Compose, providing offline static-password login for local development and a faithful stand-in for the production OIDC issuer, so the auth code path is exercised locally without Google credentials.

### Modified Capabilities

- `user-auth`: Sign-in, `/auth/callback`, per-request session validation, the guarded-route redirect, `/myprofile`, and sign-out are all re-expressed provider-agnostically over Arctic + OIDC + DB-backed sessions. Supabase Auth, the two-Supabase-client model, and the `handle_new_user` trigger are removed; profile provisioning moves into the callback.
- `drizzle-integration`: `.env.example` and the db scripts drop all Supabase variables and `DIRECT_URL` in favor of a single `DATABASE_URL`; the schema adds app-owned `users`, `oauth_accounts`, and `sessions` tables, re-points `profiles.id` at `users.id`, removes the `profiles` RLS policies, and the seed provisions users without the Supabase admin API.

## Impact

- **Dependencies:** remove `@supabase/supabase-js`, `@supabase/ssr`; add `arctic`, `jose`. `drizzle-orm`, `postgres`, `drizzle-kit` unchanged.
- **Code:** `src/hooks.server.ts`, `src/lib/server/supabase/client.ts` + `src/lib/supabase/client.ts` (removed), `src/lib/server/auth/*` (google-oauth, oauth-callback, dev-user, myprofile-load), `src/routes/{login,auth/callback,myprofile}/*`, `src/app.d.ts` (drop Supabase types; `locals.user` becomes an app type). `requireAdmin`, the events/registrations services, and the dev-login bypass keep working unchanged.
- **Schema/DB:** new `users`, `oauth_accounts`, `sessions` tables; `db/auth-ref.ts` (the `auth.users` shim) removed; `profiles` FK re-pointed; RLS migration reversed; `handle_new_user` trigger dropped. New Drizzle migrations; greenfield (no data migration).
- **Infra/config:** `docker-compose.yml` (dev) gains a Dex service + `dex-config.yaml`; `docker-compose.prod.yml`/`deploy.yml` drop Supabase env and gain `OIDC_*`. `.env.example`, `DEPLOY.md`, and `LOCAL_DEV_ADMIN.md` updated. Google Cloud Console OAuth client re-registered with the app's own callback (prod) — no Supabase redirect URL.
- **Docs:** a human-facing decision record under `docs/` captures the exploration and the chosen architecture for teammates.
