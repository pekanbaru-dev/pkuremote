## 1. Dependencies & schema

- [ ] 1.1 Add `arctic` and `jose`; remove `@supabase/supabase-js` and `@supabase/ssr` from `package.json` (keep them installed until step 6 so the app compiles mid-migration)
- [ ] 1.2 Add `db/schema/users.ts` (`users`: id, email UNIQUE, email_verified, created_at) and re-export from `db/schema/index.ts`
- [ ] 1.3 Add `db/schema/oauth-accounts.ts` (`oauth_accounts`: provider, provider_uid, user_id FK→users, UNIQUE `(provider, provider_uid)`) and re-export
- [ ] 1.4 Add `db/schema/sessions.ts` (`sessions`: id hash PK, user_id FK→users cascade, expires_at, created_at, index on user_id) and re-export
- [ ] 1.5 Re-point `db/schema/profiles.ts` FK `id → users.id` (shared PK); delete `db/auth-ref.ts`
- [ ] 1.6 `pnpm db:generate` — new migration for users/oauth_accounts/sessions/profiles FK
- [ ] 1.7 Add a migration that drops `profiles` RLS policies, disables RLS, and drops the `on_auth_user_created` trigger + `public.handle_new_user()` function

## 2. OIDC integration (Arctic + jose)

- [ ] 2.1 Add an OIDC config/discovery helper (read `OIDC_ISSUER`/`OIDC_CLIENT_ID`/`OIDC_CLIENT_SECRET`/`OIDC_REDIRECT_URI`; fetch `.well-known/openid-configuration`; expose authorize/token/jwks)
- [ ] 2.2 Implement `startOidcSignIn` with Arctic: generate state + PKCE `code_verifier` + nonce, set transient httpOnly cookies, build the authorization URL (`openid email profile`)
- [ ] 2.3 Implement callback resolution: validate `state`, exchange code via Arctic, verify `id_token` with jose against JWKS (`iss`/`aud`/`nonce`/`exp`), reject when `email_verified !== true`; return verified claims or a typed error
- [ ] 2.4 Unit tests for callback resolution (mirror `oauth-callback.test.ts`): error param, state mismatch, id_token verification failure, `next` sanitization

## 3. Session store & provisioning

- [ ] 3.1 Implement the session store (create: random token → store its hash, `expires_at = now + 6h`; validate by hashed id + expiry; delete by id; delete-on-encounter for expired rows)
- [ ] 3.2 Implement the transactional identity upsert with match precedence — `(provider, sub)` → else `email` (link) → else create `users` + `oauth_accounts` + `profiles`; display_name from `name` claim, fallback email local part / "Pengguna"; avatar_url from `picture`, nullable; idempotent
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
- [ ] 5.4 Add a `dex` service to `docker-compose.yml` (dev only); confirm it is absent from `docker-compose.prod.yml` and `docker-compose.deploy.yml`
- [ ] 5.5 Collapse env to a single `DATABASE_URL`; update `drizzle.config.ts` to use it (drop `DIRECT_URL`)
- [ ] 5.6 Rewrite `.env.example`: remove all Supabase vars + `DIRECT_URL`; add `OIDC_*`; document Dex-in-dev vs Google-in-prod
- [ ] 5.7 Update prod compose (`docker-compose.prod.yml`, `docker-compose.deploy.yml`) to drop Supabase env and forward `OIDC_*`

## 6. Remove Supabase & documentation

- [ ] 6.1 `pnpm remove @supabase/supabase-js @supabase/ssr`; confirm no `supabase`/`Supabase` references remain in `src/` and `db/`
- [ ] 6.2 Update `DEPLOY.md` (Google Cloud OAuth client + app callback, single `DATABASE_URL`, no Supabase) and `LOCAL_DEV_ADMIN.md` (Dex login + dev bypass)
- [ ] 6.3 Update `CLAUDE.md`/`AGENTS.md` and the `docs/` decision record if any detail drifted during implementation

## 7. Verify

- [ ] 7.1 `pnpm check` → `pnpm lint` → `pnpm test` all green
- [ ] 7.2 Manual: full login round-trip against Dex (admin + attendee), booking, `/myprofile`, sign-out, guarded-route redirect
- [ ] 7.3 Fresh `pnpm db:migrate` + `pnpm db:seed` against an empty Docker Postgres produces a usable dataset with no `auth` schema references
- [ ] 7.4 Prod smoke: point `OIDC_ISSUER` at Google in a staging config and confirm the identical code path completes a login
