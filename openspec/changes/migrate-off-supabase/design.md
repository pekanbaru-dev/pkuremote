## Context

The app uses Supabase Cloud for Postgres, Google OAuth (GoTrue), and session cookies. It does **not** use Supabase Storage (banners are on local disk via `UPLOAD_DIR`), Realtime, or PostgREST. RLS policies exist on `profiles` but enforce nothing: the Drizzle client (`src/lib/server/db/client.ts`) connects with a direct role that bypasses RLS, and all data access funnels through `$lib/server/`. Authorization already lives entirely in `hooks.server.ts` (auth guard) and `requireAdmin` (email allow-list) — never in the database.

The identity chain today is `registrations.user_id → profiles.id → auth.users.id` (plus `posts.author_id → profiles.id`). `auth.users` is Supabase-owned; a `SECURITY DEFINER` trigger `handle_new_user()` auto-creates a `profiles` row on insert to `auth.users`, deriving `display_name`/`avatar_url` from the Google identity's metadata.

Constraint: the production target is a **modest VPS**. The prod stack must stay lean (app + postgres + caddy). Google login adds zero running services in prod because Google is external. A local IdP is acceptable **only** in development.

## Goals / Non-Goals

**Goals:**

- Remove all Supabase dependencies (`@supabase/*`, `auth.users`, service-role key, pooler/`DIRECT_URL`, RLS).
- Own the auth flow with Arctic + a DB-backed session store, over a **generic OIDC** integration.
- Keep a **single provider-agnostic code path** so dev (Dex) faithfully rehearses prod (Google) — the only dev↔prod difference is the `OIDC_ISSUER` env var.
- Preserve the downstream FK shape (`profiles.id` stays the identity other tables reference) so `registrations`/`posts` are untouched.
- Keep the prod footprint at three services; run the local IdP (Dex) in dev only.

**Non-Goals:**

- No data migration. Greenfield: fresh schema + reseed. Existing Supabase rows are discarded.
- No RBAC/role column (admin identity stays the `ADMIN_EMAILS` allow-list via `requireAdmin`).
- No Google-independent admin login in prod ("break-glass" password) — explicitly deferred.
- No multi-provider support now (Google only); the OIDC seam makes adding one later a config change.
- No self-hosted IdP in production.

## Decisions

### D1: Auth strategy C — Arctic + own sessions (not self-hosted GoTrue, not Auth.js)

Reimplement auth with **Arctic** (OAuth2/OIDC client) + **jose** (id_token verification) + an app-owned DB session store.

- **Why not A (self-host GoTrue/Supabase in Docker):** keeps the app married to Supabase's auth schema and adds a heavy container — defeats the point on a modest VPS.
- **Why not B (Auth.js/@auth/sveltekit):** faster, but introduces a maintained black box and adapter-owned tables; the app already hand-rolls session plumbing in `hooks.server.ts`, so C is in reach and leaves no opaque auth layer.
- **Why C:** full control, zero vendor coupling, small surface (one Google provider, one session model), and the best learning value. Trade-off: ~200 lines of auth code we own and test.

### D2: Generic OIDC, issuer-swappable — Dex in dev, Google in prod

The app talks to a **generic OIDC issuer** via discovery (`${OIDC_ISSUER}/.well-known/openid-configuration`) → authorize/token/jwks endpoints. Arctic runs the authorization-code + PKCE + state/nonce flow; jose verifies the returned `id_token` against the issuer's JWKS.

- **Dev:** `OIDC_ISSUER=http://localhost:5556` (Dex).
- **Prod:** `OIDC_ISSUER=https://accounts.google.com` (Google is a fully compliant OIDC provider).
- **Why generic (not Arctic's `Google` class):** if dev used Dex-generic and prod used the Google-specific class, dev would exercise a _different_ code path than prod — the local IdP would validate nothing. One generic path makes Dex a faithful rehearsal. This is the single most important decision for the dev IdP to be worth running.
- **Claim contract:** rely only on claims both emit — `sub` (→ `oauth_accounts.provider_uid`), `email`, `name` (→ `display_name`, fallback email local-part), `picture` (→ nullable `avatar_url`).
- **`email_verified` is strictly required (all environments):** a sign-in whose `id_token` lacks `email_verified === true` is rejected outright (not merely blocked from admin). Google always verifies; Dex static users are configured verified. This is uniform — no env-conditional branch.
- **Admin authorization is provider-independent:** `requireAdmin` matches the verified `email` claim against `ADMIN_EMAILS`, so a Dex identity and a Google identity with an allow-listed email are admin identically. Switching Dex↔Google changes nothing about who is an admin. `ADMIN_EMAILS` remains the sole admin source (no role column).

### D3: Dex is dev-only; production is Google-direct

Dex runs as a Docker Compose service in **development only**, never shipped to prod. In prod the app points `OIDC_ISSUER` straight at Google.

- **Why:** keeps the prod stack at three services on a weak VPS; Google-direct costs zero running services. Dex earns its keep purely as a local, offline, credential-free rehearsal of the OIDC path plus a learning artifact.
- **Consequence / dev topology:** the repo's `docker-dev-loop` runs the app _inside_ compose, where `localhost:5556` points at the app container, not Dex — so the issuer must resolve identically from both browser and app. Two supported topologies (see `docker-dev-loop` spec): **(1) host-run app** (`pnpm dev`) with `OIDC_ISSUER=http://localhost:5556` — recommended for OIDC work, and what makes the "localhost sidesteps the hostname split" simplification true; **(2) containerized app** with `OIDC_ISSUER=http://dex:5556` plus a `127.0.0.1 dex` `/etc/hosts` alias so both sides resolve the same issuer. `localhost:5556` with a containerized app is explicitly unsupported.
- **Dev login source:** Dex `enablePasswordDB` + `staticPasswords` (bcrypt-hashed local accounts baked into `dex-config.yaml`) — deterministic test identities, no Google credentials, no internet. No Google connector behind Dex in dev.

### D4: DB-backed sessions (not stateless JWT)

Sessions live in a `sessions` table; the cookie carries an opaque, high-entropy session id (httpOnly, Secure, SameSite=Lax). `hooks.server.ts` validates by looking the id up and checking `expires_at` on every request.

- **Why not stateless JWT:** DB sessions give instant revocation (an admin "kick user"/sign-out-everywhere story) and no reliance on a remote auth server; the lookup is one indexed query. Trade-off: a DB read per request — negligible at this scale, and the same connection the request already uses.
- Session id is a random token; only its hash is stored (so a DB read cannot resurrect a live cookie).
- **Expiry: a fixed absolute 6-hour lifetime** (`expires_at = created_at + 6h`), **not** sliding. Fixed avoids a DB write on every request (matters on a modest VPS) and gives predictable session length; the cost is that an actively-working user is signed out at the 6-hour mark and must log in again. Sign-out deletes only the current session row (multi-device sessions are independent; "sign out everywhere" is deferred).
- **Expired-session cleanup:** delete-on-encounter (a lookup that finds an expired row deletes it and treats the request as unauthenticated) plus a lightweight periodic sweep (`DELETE FROM sessions WHERE expires_at < now()`), so stale rows don't accumulate.

### D5: App-owned identity schema; `profiles.id = users.id` (shared PK)

New tables: `users` (identity: id, email, email_verified, created_at), `oauth_accounts` (provider, provider_uid, user_id — one row per linked provider, unique on `(provider, provider_uid)`), `sessions` (id/hash, user_id, expires_at). `profiles` keeps its PK **equal to** `users.id` (1:1), exactly mirroring today's `profiles.id → auth.users.id`.

- **Why shared PK:** `registrations.user_id` and `posts.author_id` keep pointing at `profiles.id` with no change — zero downstream FK churn.
- **Why separate `users` from `profiles`:** `users` is the auth/identity record (email, verification, linked accounts); `profiles` is the app-facing display record (display_name, avatar). Keeping them split mirrors the current shape and leaves room for multiple oauth_accounts per user.
- `db/auth-ref.ts` (the `pgSchema("auth").table("users")` shim) is deleted; the FK now references the real `users` table.

### D6: Profile provisioning moves from a DB trigger to the callback

The `handle_new_user()` `SECURITY DEFINER` trigger is dropped. Its logic runs in the OIDC callback as an idempotent upsert: on first sign-in, insert `users` + `oauth_accounts` + `profiles` in one transaction; `display_name` from the `name` claim (fallback email local-part), `avatar_url` from `picture` (nullable).

- **Why:** readable, unit-testable app code instead of plpgsql that only runs inside Postgres; no `SECURITY DEFINER` surface; matches the "all logic in `$lib/server/`" model.

### D7: Drop RLS; single `DATABASE_URL`

Reverse the `profiles` RLS policies and `auth.uid()` usage (they enforce nothing under the direct-connection model). Collapse `DATABASE_URL` (pooler) + `DIRECT_URL` (direct) into one `DATABASE_URL` at the Docker Postgres, used by the app, `drizzle-kit`, and the seed alike.

- **Why:** RLS was only meaningful with PostgREST/anon-key access, which we don't use. One direct connection removes the pooler/DDL split entirely.

### D8: Auth-flow security details carried over from the current implementation

The OIDC rewrite MUST preserve protections the Supabase flow (or its `safeRedirectTarget`) already had, and add the ones OIDC requires:

- **Send `state`, `nonce`, and PKCE `code_challenge` (S256) as authorization parameters.** A provider only echoes a `nonce` it received; generating/storing a nonce without sending it would make every callback's nonce check fail.
- **Preserve the post-login target across the round-trip.** `redirect_uri` is the bare `/auth/callback` (no `?next=`), so the sanitized target is stored in a transient cookie at sign-in and recovered in the callback — otherwise a user bounced from `/admin` loses the destination and lands on `/myprofile`.
- **Keep the backslash open-redirect check.** `safeRedirectTarget` must reject `/\evil.com` as well as `//evil.com` (browsers may normalize `\` to `/`), not just the `//` form.
- **Normalize emails (trim + lower-case) before lookup/insert and for `ADMIN_EMAILS`.** Postgres uniqueness is case-sensitive; without normalization `Ayu@Pku.dev` and `ayu@pku.dev` create two identities while the admin check (already lower-cased) sees only one. Uniqueness is enforced case-insensitively.

## Risks / Trade-offs

- **Dev/prod provider divergence** → Mitigated by D2 (one generic OIDC path; issuer is the only difference) and D3 (host-run dev app removes the issuer/hostname split).
- **Claim shape differences between Dex and Google** → Mitigated by D2's claim contract: depend only on `sub`/`email`/`name`, keep `avatar_url` nullable, require `email_verified` for admin in prod.
- **Hand-rolled auth has security-sensitive surface** (CSRF/state, PKCE, nonce, cookie flags, session token entropy, id_token `iss`/`aud`/expiry checks) → Mitigated by leaning on Arctic (state/PKCE) + jose (JWKS/`iss`/`aud`/`exp` verification) rather than bespoke crypto, plus targeted unit tests mirroring the existing `oauth-callback.test.ts`.
- **Greenfield discards existing Supabase data** → Accepted by decision (Non-Goal). If any real user data exists, it is intentionally not migrated.
- **Google Cloud OAuth client must be re-registered** with the app's own callback (prod), replacing the Supabase redirect URL → one-time console step documented in `DEPLOY.md`.
- **Two auth code paths could drift if someone reaches for Arctic's Google class later** → the spec pins the generic-OIDC requirement so the temptation is documented as out-of-bounds.

## Migration Plan

Greenfield cutover (no data carry-over), sequenced so the app never half-depends on both systems:

1. Add `arctic` + `jose`; scaffold `users`/`oauth_accounts`/`sessions` schema. **Baseline the migration history** — the existing `0000`/`0001` reference `auth.users`/`auth.uid()`/the `authenticated` role and fail on plain Postgres before any repair migration runs, so squash/regenerate `db/migrations/` from the final self-hosted schema (greenfield makes rewriting history safe) rather than appending a re-point migration.
2. Implement the OIDC integration (discovery, Arctic authorize/callback, jose verification), the DB session store, and the profile upsert. Keep behavior behind the same routes (`/login`, `/auth/callback`, `/myprofile`) and the same `GUARDED_PREFIXES` guard.
3. Rewrite `hooks.server.ts` (session lookup replaces `safeGetSession`/`getUser`), `app.d.ts` (app user type replaces Supabase `User`), and the seed scripts (direct inserts).
4. Add the dev-only Dex service + `dex-config.yaml`; collapse env to a single `DATABASE_URL`; add `OIDC_*`; update `.env.example`, `DEPLOY.md`, `LOCAL_DEV_ADMIN.md`.
5. Remove `@supabase/*` and the two Supabase client modules + `db/auth-ref.ts`.
6. Verify: `pnpm check` → `pnpm lint` → `pnpm test`; local login round-trip against Dex; a prod smoke test against Google in staging config.

**Rollback:** greenfield and unreleased — rollback is reverting the change branch before the tag/deploy. Once cut over, there is no dual-run; the Supabase project can be kept read-only briefly as a safety net, then decommissioned.

## Resolved Decisions (from review)

- **Session expiry** → fixed absolute **6 hours** (no sliding renewal). See D4.
- **Dex UX** → **always show the Dex login screen** (do not auto-redirect to a single connector), so a developer can pick among 2–3 static test users. See `local-oidc-dev`.
- **`email_verified`** → **strictly required**, uniformly across environments — an unverified email is rejected at sign-in. See D2.
- **`ADMIN_EMAILS` remains the admin source** regardless of provider (Dex or Google); `requireAdmin` matches the verified `email` claim. See D2.
- **Session token storage** → store only the token **hash** (raw token lives only in the cookie). See D4.

## Open Questions

- **Identity match precedence.** When provisioning, match order is: (1) existing `oauth_accounts` row by `(provider, provider_uid=sub)` → use its user; else (2) existing `users` row by `email` → link a new `oauth_accounts` row to it; else (3) create `users` + `oauth_accounts` + `profiles`. Proposed default is above — confirm case (2) (auto-link by email) is desired vs. treating an email collision as an error. With a single provider today this rarely fires; it matters only if a second provider is added later.
- **Periodic sweep mechanism.** Delete-on-encounter is settled; the _periodic_ sweep could be a `pg_cron` job, a tiny interval in the Node process, or simply skipped (rely on delete-on-encounter only). Proposed default: skip a dedicated scheduler for now and rely on delete-on-encounter — revisit only if `sessions` bloat is ever observed.
