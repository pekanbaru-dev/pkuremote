# Local admin access without Google login

Working on the `/admin` panel locally is awkward if you can't complete an OIDC
round-trip on `localhost`. You have two options:

1. **Dev-login bypass** — the fastest path, documented here. A dev-only switch
   signs you in as a chosen user without any OAuth. Best for day-to-day admin
   work.
2. **Real OIDC login on localhost via Dex** — the true auth path, using the
   dev-only Dex IdP (no Google credentials, no internet). See
   "[Real login via Dex](#real-login-via-dex)" below. Use this when you
   specifically want to exercise the real login/session machinery.

This guide covers option 1, then documents option 2.

## TL;DR

```sh
# in .env
DEV_ADMIN_EMAIL=you@example.com   # the account you want to be signed in as
ADMIN_EMAILS=you@example.com      # same email — this is what grants /admin

pnpm db:seed-dev-admin            # once — also makes booking / profile work
pnpm dev                          # restart if it was already running
# open http://localhost:5175/admin  → you're in, no Google prompt
```

## What it does

When the app runs under `pnpm dev` **and** `DEV_ADMIN_EMAIL` is set,
`src/hooks.server.ts` skips the `sessions`-table lookup and injects a user with
that email as `locals.user`. Everything downstream reads only `locals.user`, so
`requireAdmin` and the route guards behave exactly as they would with a real
login — you're just not going through the OIDC flow.

## Step by step

1. **Set two env vars in `.env`:**
   - `DEV_ADMIN_EMAIL` — the email to sign in as.
   - `ADMIN_EMAILS` — must contain that same email. `/admin` access is granted
     by the `ADMIN_EMAILS` allow-list (see `src/lib/server/auth/admin.ts`), not
     by the bypass itself.
2. **Provision the user (recommended):** `pnpm db:seed-dev-admin`. This inserts
   a real `users` row (and its matching `profiles` row) at the bypass user's
   fixed id for your `DEV_ADMIN_EMAIL` — a direct DB insert, no external auth
   API. It's idempotent — safe to re-run. Skip this only if you never touch
   booking / `/myprofile` (see Limitations).
3. **Start (or restart) the dev server:** `pnpm dev`. `.env` is read at
   **startup**, so if the server was already running when you added the var, it
   won't pick it up — restart it.
4. **Confirm it's active:** the terminal prints
   `[dev-login] Auth bypass active — signed in as "you@example.com".`
5. **Go straight to `http://localhost:5175/admin`.** Don't go via `/login` — you
   are already "signed in", so the login page just bounces you onward.

## Safety — why this can't reach production

The bypass is double-gated:

- **Compiled out of production.** `dev` (from `$app/environment`) is statically
  `false` in the adapter-node production build, so the whole branch is inert —
  the built server calls `resolveDevLoginEmail(false, …)`, which always returns
  `null`. A stray `DEV_ADMIN_EMAIL` in a prod environment does nothing.
- **Off by default.** It only activates when `DEV_ADMIN_EMAIL` is set.

Still: **never set `DEV_ADMIN_EMAIL` in a production environment.** It's a
local-development convenience only.

## Limitations

| Flow                                         | Works with just `DEV_ADMIN_EMAIL`?     |
| -------------------------------------------- | -------------------------------------- |
| Admin dashboard, event & category management | ✅ yes                                 |
| Booking an event, `/myprofile`               | ⚠️ only after `pnpm db:seed-dev-admin` |

Booking and `/myprofile` write/read rows that foreign-key to
`profiles` → `users`. Without the seed there's no such row for the bypass
user, so booking shows a friendly _"Akun Anda belum siap untuk booking…"_
message instead of succeeding. Running the seed once fixes this.

## Turning it off

Comment out or remove `DEV_ADMIN_EMAIL` in `.env` and restart `pnpm dev`. You're
back to the normal Google login.

## Troubleshooting

| Symptom                                                | Cause / fix                                                                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Login page still shows the Google button               | Server started before the var was set — restart `pnpm dev`. Also navigate to `/admin` directly, not `/login`.                             |
| `/admin` redirects you to `/`                          | Your `DEV_ADMIN_EMAIL` is not in `ADMIN_EMAILS`. Add it.                                                                                  |
| Booking fails with _"belum siap untuk booking"_        | Run `pnpm db:seed-dev-admin` once, then retry.                                                                                            |
| `db:seed-dev-admin` errors _"ID cannot be a nil uuid"_ | You're on an old checkout — `DEV_ADMIN_USER_ID` must be a non-nil UUID (already fixed in `src/lib/server/auth/dev-user.ts`). Pull latest. |
| No `[dev-login]` line in the terminal                  | `DEV_ADMIN_EMAIL` isn't set, or you're not on the dev server (`pnpm dev`).                                                                |

## Real login via Dex

To exercise the actual OIDC flow (Arctic + DB-backed sessions) locally, run the
dev-only **Dex** IdP instead of the bypass. Dex is a faithful stand-in for
Google — the app's code path is identical; only `OIDC_ISSUER` differs.

**Issuer topology (important).** id_token verification asserts `iss` matches
`OIDC_ISSUER`, so the issuer URL must resolve to the same Dex from both the
browser and the app. Two supported setups:

1. **Host-run app (recommended).** Run Postgres + Dex in Docker and the app on
   the host:
   ```sh
   docker compose up -d postgres dex      # in-stack db + Dex on :5556
   # in .env (host-run):
   DATABASE_URL=postgresql://pkuremote:pkuremote@localhost:5432/pkuremote
   OIDC_ISSUER=http://localhost:5556
   OIDC_CLIENT_ID=pkuremote-dev
   OIDC_CLIENT_SECRET=pkuremote-dev-secret
   OIDC_REDIRECT_URI=http://localhost:5175/auth/callback
   ADMIN_EMAILS=admin@pkubersua.local
   # leave DEV_ADMIN_EMAIL unset so the real flow runs
   pnpm db:migrate && pnpm db:seed
   pnpm dev
   ```
   Both the browser and the host-run app reach Dex at `localhost:5556`.
2. **Containerized app.** Set `OIDC_ISSUER=http://dex:5556` in both
   `dex-config.yaml` (the `issuer`) and `.env`, and add `127.0.0.1 dex` to your
   `/etc/hosts` so the browser resolves `dex` too. `localhost:5556` does **not**
   work with a containerized app (its `localhost` is the app container, not Dex).

**Test users** (`dex-config.yaml`, password `password` for both):

| Email                      | Role                                   |
| -------------------------- | -------------------------------------- |
| `admin@pkubersua.local`    | admin (email is in dev `ADMIN_EMAILS`) |
| `attendee@pkubersua.local` | normal attendee                        |

Go to `http://localhost:5175/login`, click "Continue with Google", and Dex's
login form lets you pick a test user. The admin account lands you in `/admin`;
the attendee account can book events.

## Where it lives in the code

- **Bypass:** `src/lib/server/auth/dev-user.ts` (`resolveDevLoginEmail`,
  `makeDevAdminUser`, `DEV_ADMIN_USER_ID`) and `src/hooks.server.ts`.
- **Seed:** `db/seed-dev-admin.ts` (run via `pnpm db:seed-dev-admin`).
- **Admin gate:** `src/lib/server/auth/admin.ts` (the `ADMIN_EMAILS` allow-list
  — the single seam all admin authorization funnels through).
