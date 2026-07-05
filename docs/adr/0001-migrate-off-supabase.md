# ADR 0001 — Migrate off Supabase to self-hosted Postgres + Arctic/OIDC auth

- **Status:** Accepted (proposed 2026-07-05)
- **Deciders:** @jufianto (+ team review)
- **Related:** OpenSpec change [`migrate-off-supabase`](../../openspec/changes/migrate-off-supabase/) · GitHub issue [#35](https://github.com/pekanbaru-dev/pkuremote/issues/35)
- **Supersedes:** the Supabase-based auth introduced in `add-supabase-google-auth`

> This is the **human** decision record — the discussion, the options we weighed, and why
> we chose what we chose, for teammates. The machine-facing "what to build" contract lives
> in the OpenSpec change ([proposal](../../openspec/changes/migrate-off-supabase/proposal.md),
> [design](../../openspec/changes/migrate-off-supabase/design.md),
> [specs](../../openspec/changes/migrate-off-supabase/specs/),
> [tasks](../../openspec/changes/migrate-off-supabase/tasks.md)). Read this for the *why*;
> read OpenSpec for the *what*.

## TL;DR

We're removing Supabase entirely. Postgres moves into our own Docker stack; auth is reimplemented
with **Arctic** (OAuth2/OIDC client) + **jose** (token verification) + **DB-backed sessions**. The
identity provider becomes **environment-swappable**: a local **Dex** container in dev, **Google
directly** in prod. No data migration — greenfield reseed.

```
   BEFORE                                   AFTER
   ┌────────────────────┐                   ┌──────────────────────────┐
   │ Supabase Cloud     │                   │ Docker stack (VPS)        │
   │  · GoTrue (auth)   │                   │  · app (Arctic + jose)────┼──▶ Google (prod)
   │  · Postgres        │◀── DATABASE_URL   │  · postgres               │
   │  · auth.users +    │    (pooler 6543)  │  · caddy                  │
   │    trigger         │                   └──────────────────────────┘
   │  · Storage (unused)│                   dev only, never shipped:
   │  · RLS (dead)      │                     · dex (local OIDC, static users)
   └────────────────────┘
```

## Context — what we actually depended on

We audited every Supabase touchpoint before deciding. Findings:

| Supabase feature | Used? | Notes |
| --- | --- | --- |
| Postgres | ✅ | via Drizzle, direct connection |
| Google OAuth (GoTrue) | ✅ | `signInWithOAuth`, `exchangeCodeForSession` |
| Session cookies | ✅ | `@supabase/ssr`, `getUser()` per request |
| `auth.users` + `handle_new_user` trigger | ✅ | trigger auto-creates `profiles` on sign-up |
| Storage | ❌ | banners live on local disk (`UPLOAD_DIR`) |
| Realtime | ❌ | not used |
| PostgREST | ❌ | all data access is server-side via Drizzle |
| RLS on `profiles` | ⚠️ **dead weight** | Drizzle connects with a direct role that **bypasses RLS** |

**Key insight:** authorization already lives entirely in `hooks.server.ts` + `requireAdmin`
(the `ADMIN_EMAILS` allow-list), never in the database. So RLS + `auth.uid()` enforce nothing
and can be deleted. Postgres itself is trivially portable (plain `postgres-js`). The only hard
part is replacing **auth**.

**Constraint that shaped everything:** production runs on a **modest VPS**. The prod stack must
stay lean, and we don't want to operate an identity server there.

## Decisions & the alternatives we rejected

### 1. Auth strategy: roll our own with Arctic (not self-host GoTrue, not Auth.js)

| Option | Verdict |
| --- | --- |
| **A. Self-host GoTrue/Supabase in Docker** | ❌ Keeps us married to Supabase's auth schema and adds a heavy container — defeats the point on a small VPS. |
| **B. Auth.js (`@auth/sveltekit`)** | ➖ Fast, maintained, but a black box with adapter-owned tables. |
| **C. Arctic + own DB sessions** | ✅ **Chosen.** Full control, zero vendor lock-in, small surface (one provider, one session model), and the best learning value. Cost: ~200 lines of auth code we own and test. |

We already hand-roll session plumbing in `hooks.server.ts`, so C was within reach.

### 2. Generic OIDC, one code path — issuer is the only dev↔prod difference

We treat the provider as a **generic OIDC issuer** (discovery → authorize/token/JWKS; Arctic runs
the code+PKCE flow, jose verifies the `id_token`). We deliberately do **not** use Arctic's
Google-specific class.

- **Why:** if dev used one mechanism and prod another, dev would test a *different* code path
  than prod and prove nothing. With a single generic path, the only difference between
  environments is `OIDC_ISSUER` (`http://localhost:5556` in dev → `https://accounts.google.com`
  in prod). Google is a fully compliant OIDC provider, so this Just Works.
- **Claim contract:** rely only on claims both providers emit — `sub`, `email`, `name`,
  `picture` (nullable avatar). Require `email_verified` before granting admin in prod.

### 3. Dev IdP = Dex, dev-only. Prod = Google-direct.

We *do* run a self-hosted IdP — but **only in development**, as a learning artifact and a faithful,
offline rehearsal of the OIDC path. In production the app points straight at Google (zero extra
running services — Google is external).

- **Why we considered and rejected running an IdP in prod:** we explored putting Dex in front of
  Google in production. On a weak VPS that's an extra container brokering a single provider —
  not worth it. (We also confirmed "lightweight Hydra" is a trap: Ory Hydra is not an IdP on its
  own and needs Kratos + a consent UI — *heavier* than what we're removing.)
- **Nice side effect:** because the dev app runs on the **host** (`pnpm dev`), not in the compose
  network, both browser and app reach Dex at the same `http://localhost:5556` — this sidesteps
  the classic Dex issuer/hostname split that bites containerized apps.
- **Dev login source:** Dex `staticPasswords` (bcrypt-hashed local accounts) — an admin test
  account (in `ADMIN_EMAILS`) and an attendee account. Offline, deterministic, no Google
  credentials. The existing `DEV_ADMIN_EMAIL` bypass stays, so most local work needs no IdP at all.

### 4. Sessions: DB-backed (not stateless JWT)

A `sessions` table; the cookie carries an opaque token, and we store only its **hash**. Validated
by an indexed lookup + `expires_at` on every request.

- **Why:** instant revocation ("sign out everywhere" / admin kick), no dependence on a remote auth
  server, and storing a hash means a DB read can't resurrect a live cookie. Cost is one indexed
  query per request — negligible at our scale.

### 5. Identity schema: `profiles.id = users.id` (shared PK)

New app-owned tables: `users` (identity), `oauth_accounts` (linked providers), `sessions`.
`profiles` keeps its PK **equal to** `users.id` — exactly mirroring today's
`profiles.id → auth.users.id`.

- **Why:** `registrations.user_id` and `posts.author_id` keep pointing at `profiles.id` with
  **zero downstream FK churn**. The `handle_new_user` trigger's job moves into the OIDC callback
  as readable, testable app code.

### 6. No data migration — greenfield

Fresh schema + reseed. Existing Supabase rows are intentionally discarded. If real user data ever
needs to be carried over, that's a separate workstream.

## Consequences

**Good**
- No vendor lock-in; the whole system is `docker compose up` on any host.
- Connection model collapses: one `DATABASE_URL` (no pooler/`DIRECT_URL` split).
- Auth is readable and testable app code; no `SECURITY DEFINER` plpgsql, no dead RLS.
- OIDC secrets are server-only now (no `PUBLIC_` browser keys) — a small security win.

**Costs / risks we accepted**
- We own security-sensitive auth code (state/PKCE/nonce, cookie flags, token entropy, `iss`/`aud`/
  `exp` checks). Mitigated by leaning on Arctic + jose rather than bespoke crypto, plus unit tests.
- One-time Google Cloud OAuth client re-registration (app callback replaces the Supabase URL).
- Greenfield discards existing data (by decision).

## Explicitly deferred (not now)

- **Google-independent "break-glass" admin login in prod.** It only made sense when Dex ran in
  prod; since Dex is dev-only, prod admins log in via Google. Add an app-side password later *only*
  if a real "Google is down, I must get in" need appears.
- **Multiple providers** (GitHub, etc.) — the OIDC seam makes this a config change when wanted.
- **RBAC / role column** — admin identity stays the `ADMIN_EMAILS` allow-list.

## Resolved in review

- **Session expiry:** fixed absolute **6 hours** (no sliding renewal — avoids a per-request DB write; predictable length).
- **Dex UX:** always show the Dex login screen (no auto-redirect), so a developer can pick among 2–3 static test users.
- **`email_verified`:** strictly required, uniform across environments — an unverified email is rejected at sign-in.
- **Admin source:** `ADMIN_EMAILS` still governs admin regardless of provider; `requireAdmin` matches the verified `email` claim, so a Dex or Google identity is admin iff its email is allow-listed.

## Open questions (tracked in the OpenSpec design doc)

- **Identity match precedence** when a future second provider is added: auto-link by email vs. treat an email collision as an error. Proposed default is auto-link `(provider, sub)` → email → create.
- **Periodic session sweep:** delete-on-encounter is settled; a dedicated scheduler (pg_cron / interval) is deferred unless `sessions` bloat is observed.

## References

- OpenSpec change: [`openspec/changes/migrate-off-supabase/`](../../openspec/changes/migrate-off-supabase/)
- Arctic (OAuth2/OIDC client) · jose (JWT/JWKS) · Dex (OIDC provider)
- Prior art in this repo: `add-supabase-google-auth` (the setup this replaces)
