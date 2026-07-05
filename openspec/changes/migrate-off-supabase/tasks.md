## 1. Dependencies & schema

- [ ] 1.1 Add `arctic` and `jose`; remove `@supabase/supabase-js` and `@supabase/ssr` from `package.json` (keep them installed until step 6 so the app compiles mid-migration)
- [ ] 1.2 Add `db/schema/users.ts` (`users`: id, email UNIQUE, email_verified, created_at) and re-export from `db/schema/index.ts`
- [ ] 1.3 Add `db/schema/oauth-accounts.ts` (`oauth_accounts`: provider, provider_uid, user_id FK→users, UNIQUE `(provider, provider_uid)`) and re-export
- [ ] 1.4 Add `db/schema/sessions.ts` (`sessions`: id hash PK, user_id FK→users cascade, expires_at, created_at, index on user_id) and re-export
- [ ] 1.5 Re-point `db/schema/profiles.ts` FK `id → users.id` (shared PK); delete `db/auth-ref.ts`
- [ ] 1.6 Ensure `users.email` uniqueness is case-insensitive (store normalized lower-cased email + `UNIQUE`, or a unique index on `lower(email)`)
- [ ] 1.7 **Baseline the migration history** — the existing `0000`/`0001` reference `auth.users`/`auth.uid()`/the `authenticated` role and will fail on plain Postgres before any repair migration runs. Squash/regenerate `db/migrations/` from the final self-hosted schema (no `auth` refs, no RLS, `profiles.id` → `public.users`); confirm `pnpm db:migrate` applies top-to-bottom on an empty `postgres:16`

## 2. OIDC integration (Arctic + jose)

- [ ] 2.1 Add an OIDC config/discovery helper (read `OIDC_ISSUER`/`OIDC_CLIENT_ID`/`OIDC_CLIENT_SECRET`/`OIDC_REDIRECT_URI`; fetch `.well-known/openid-configuration`; expose authorize/token/jwks)
- [ ] 2.2 Implement `startOidcSignIn` with Arctic: generate state + PKCE `code_verifier` + nonce; store them **and the sanitized post-login target** (`safeRedirectTarget(?redirect)`) in transient httpOnly cookies; build the authorization URL with `scope=openid email profile` **plus `state`, `nonce`, and `code_challenge` (S256) as authorization parameters**, `redirect_uri` = bare `/auth/callback`
- [ ] 2.3 Implement callback resolution: validate `state`, exchange code via Arctic, verify `id_token` with jose against JWKS (`iss`/`aud`/`nonce`/`exp`), reject when `email_verified !== true`; recover the post-login target from its cookie; return verified claims + target or a typed error
- [ ] 2.4 Confirm `safeRedirectTarget` still rejects `//` **and `/\`** (backslash open-redirect); keep/extend its tests
- [ ] 2.5 Unit tests for callback resolution (mirror `oauth-callback.test.ts`): error param, state mismatch, id_token verification failure, missing/false `email_verified`, target preservation (`/admin` survives), backslash/`//` target rejection

## 3. Session store & provisioning

- [ ] 3.1 Implement the session store (create: random token → store its hash, `expires_at = now + 6h`; validate by hashed id + expiry; delete by id; delete-on-encounter for expired rows)
- [ ] 3.2 Implement the transactional identity upsert: **normalize the email claim (trim + lower-case) first** and use it for all lookups/inserts/`ADMIN_EMAILS`; match precedence `(provider, sub)` → else normalized `email` (link) → else create `users` + `oauth_accounts` + `profiles`; display_name from `name` claim, fallback email local part / "Pengguna"; avatar_url from `picture`, nullable; idempotent
- [ ] 3.3 Unit tests: provisioning idempotency, name fallback, session hash-not-plaintext, expiry rejection

## 4. Wire routes & hooks

- [ ] 4.1 Rewrite `src/hooks.server.ts`: replace the Supabase client + `safeGetSession` with a `sessions`-table lookup populating `event.locals.user`; keep `GUARDED_PREFIXES` and the redirect behavior; keep the `DEV_ADMIN_EMAIL` bypass
- [ ] 4.2 Update `src/app.d.ts`: drop Supabase types; declare the app user type for `locals.user`; remove `locals.supabase`/`locals.safeGetSession`
- [ ] 4.3 Rewrite `/login` action to call `startOidcSignIn`; keep the Indonesian error copy and `?redirect=` handling
- [ ] 4.4 Rewrite `/auth/callback/+server.ts` to use the new callback resolution + session creation + cookie set/clear
- [ ] 4.5 Rewrite `/myprofile` sign-out action to delete the session row and clear the cookie (drop `supabase.auth.signOut()`); confirm `loadMyProfile` still reads by `locals.user.id`
- [ ] 4.6 Delete `src/lib/server/supabase/client.ts`, `src/lib/supabase/client.ts`, and `src/lib/server/auth/google-oauth.ts`/`oauth-callback.ts` as they are replaced; update `src/lib/features/admin/components/admin-shell.svelte` User import

## 5. Seed, dev IdP, env & config

- [ ] 5.1 Rewrite `db/seed.ts`: direct insert into `users` + `profiles` (drop `supabase.auth.admin.createUser`, drop service-role/URL reads); keep idempotent
- [ ] 5.2 Rewrite `db/seed-dev-admin.ts`: direct insert of the fixed dev-admin `users` + `profiles` row (no Supabase admin API)
- [ ] 5.3 Add `dex-config.yaml` (issuer `http://localhost:5556`, static OIDC client matching dev `OIDC_*`, `enablePasswordDB` + 2–3 `staticPasswords` (admin in `ADMIN_EMAILS` + attendee), each `email_verified: true`, login screen always shown / no connector skip)
- [ ] 5.4 Update `docker-compose.yml` (dev): add an in-stack `postgres` service and a **dev-only** `dex` service (publish `5556`); wire `app` to `DATABASE_URL` (→ postgres) + `OIDC_*`; document the `OIDC_ISSUER` topology (host-run `pnpm dev` → `localhost:5556`; containerized → `dex:5556` + `/etc/hosts` alias); confirm Dex is absent from `docker-compose.prod.yml`/`docker-compose.deploy.yml`
- [ ] 5.5 Collapse env to a single `DATABASE_URL`; update `drizzle.config.ts` to use it (drop `DIRECT_URL`)
- [ ] 5.6 Rewrite `.env.example`: remove all Supabase vars + `DIRECT_URL`; add `OIDC_*`, `POSTGRES_*`; document Dex-in-dev vs Google-in-prod and the dev `OIDC_ISSUER` topology
- [ ] 5.7 Update prod compose (`docker-compose.prod.yml`, `docker-compose.deploy.yml`): **add an in-stack `postgres` service + `postgres_data` volume** (`app` `depends_on` postgres), swap Supabase env for `DATABASE_URL` (→ postgres) + `OIDC_*` + `ADMIN_EMAILS`; update the `production-deploy` spec + README deploy section (Postgres service, volume, migrate step)

## 6. Remove Supabase & documentation

- [ ] 6.1 `pnpm remove @supabase/supabase-js @supabase/ssr`; confirm no `supabase`/`Supabase` references remain in `src/` and `db/`
- [ ] 6.2 Update `DEPLOY.md` (Google Cloud OAuth client + app callback, single `DATABASE_URL`, no Supabase) and `LOCAL_DEV_ADMIN.md` (Dex login + dev bypass)
- [ ] 6.3 Update `CLAUDE.md`/`AGENTS.md` and the `docs/` decision record if any detail drifted during implementation

## 7. Verify

- [ ] 7.1 `pnpm check` → `pnpm lint` → `pnpm test` all green
- [ ] 7.2 Manual: full login round-trip against Dex (admin + attendee), booking, `/myprofile`, sign-out, guarded-route redirect
- [ ] 7.3 Fresh `pnpm db:migrate` + `pnpm db:seed` against an empty Docker Postgres produces a usable dataset with no `auth` schema references
- [ ] 7.4 Prod smoke: point `OIDC_ISSUER` at Google in a staging config and confirm the identical code path completes a login
