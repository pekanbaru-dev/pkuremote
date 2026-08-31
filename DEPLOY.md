# Deployment

How PKUBersua ships to production, and how to stand up the server the first
time. The stack is a SvelteKit (adapter-node) Docker image plus an in-stack
Postgres, fronted by a shared Caddy reverse proxy (managed by the
[`caddyku`](https://github.com/jufianto/caddyku) CLI) that terminates HTTPS
with automatic Let's Encrypt certificates. Auth is the app's own OIDC flow
(Arctic + DB-backed sessions) against Google — there is no Supabase.

## Pipeline at a glance

```
PR ─────────────────▶ CI (.github/workflows/ci.yml)
                       check · lint · test · build          (no image built)

merge to master ─────▶ Deploy production (.github/workflows/deploy.yml)
                       build image ▶ push :sha-<commit> + :latest
                       ▶ [production Environment gate — waits for Approve]
                       ▶ ssh server: docker compose pull && up -d

push staging-test ───▶ Deploy staging-test (.github/workflows/deploy-staging.yml)
                       build image ▶ push :staging
                       ▶ NO gate — ssh server: docker compose pull && up -d
                       (targets the SAME server/DB as prod — no staging box yet)

rollback ────────────▶ Actions ▸ Deploy (production) ▸ "Run workflow" ▸
                       enter an older image tag, e.g. sha-abc1234 (no rebuild)
```

Production deploys on every **merge to `master`**, gated by the `production`
Environment's **Required reviewers** (the job waits for an Approve click). A push
to **`staging-test`** force-deploys with **no gate** — it goes live immediately
on the same box/domain/DB as prod (no separate staging host yet).

---

## One-time server setup

### 1. Provision a host

Any small VPS works (Hetzner CX22, DigitalOcean, Vultr…), Ubuntu 22.04/24.04.
Note its public IP.

### 2. Point DNS at it **before the first deploy**

Create an `A` record: `pkubersua.com → <server IP>`. The shared Caddy cannot
obtain a TLS certificate until the domain resolves to the server.

### 3. Install Docker + Compose

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # log out/in so the group takes effect
docker compose version            # confirm the compose plugin is present
```

### 4. Open the firewall

Allow inbound `22` (SSH), `80` and `443` (HTTP/S). Everything else stays closed;
the app port `3000` and Postgres `5432` are internal to the Docker network.

### 5. This VPS uses a shared Caddy, managed by `caddyku`

This box fronts every project through a single `caddy-proxy` Docker Compose
stack, managed by `caddyku`. `docker-compose.deploy.yml` therefore does **not**
run its own Caddy or publish 80/443 — the `app` service joins the external
`caddy-net` network and Caddy reverse-proxies to it by container name.

**One time per VPS** (skip if `caddy-proxy` already runs — check `caddyku status`):

```bash
curl -sSL https://github.com/jufianto/caddyku/releases/latest/download/caddyku_linux_amd64.tar.gz \
  | tar -xz && sudo mv caddyku /usr/local/bin/
caddyku init                       # creates ~/projects/caddy-proxy/
cd ~/projects/caddy-proxy && docker compose up -d
```

**Per app** — create the project directory and drop in `docker-compose.deploy.yml`
(no `Caddyfile` here; the shared proxy owns that):

```bash
mkdir -p ~/projects/pkuremote
cd ~/projects/pkuremote
# copy docker-compose.deploy.yml from the repo (scp, git archive, or paste)
```

`DEPLOY_DIR` (the GitHub repository secret, below) must point at this directory.

### 6. Set up the Google OAuth client

Auth is a generic OIDC flow; in production the issuer is Google.

1. Google Cloud Console ▸ **APIs & Services ▸ Credentials ▸ Create credentials
   ▸ OAuth client ID ▸ Web application**.
2. **Authorized redirect URI**: `https://pkubersua.com/auth/callback` (the
   app's own callback — no Supabase redirect URL).
3. Note the **Client ID** and **Client secret** for the server `.env` below.

### 7. Create the server `.env`

In `~/projects/pkuremote/.env` (never committed). Read by
`docker-compose.deploy.yml` at runtime:

```ini
# --- Domain ---
SITE_DOMAIN=pkubersua.com

# --- In-stack Postgres (the database is no longer external) ---
POSTGRES_USER=pkuremote
POSTGRES_PASSWORD=<a strong password>
POSTGRES_DB=pkuremote

# --- OIDC (Google) ---
OIDC_ISSUER=https://accounts.google.com
OIDC_CLIENT_ID=<google-client-id>
OIDC_CLIENT_SECRET=<google-client-secret>
OIDC_REDIRECT_URI=https://pkubersua.com/auth/callback

# --- Admin access (comma-separated admin emails) ---
ADMIN_EMAILS=you@gmail.com,teammate@gmail.com
```

`DATABASE_URL` is **not** set by hand — the compose file builds it from the
`POSTGRES_*` values to point at the in-stack `postgres` service. There is no
`DIRECT_URL`, no Supabase URL/anon/service-role key, and no `ACME_EMAIL` here
(TLS is handled once, globally, by the shared `caddy-proxy`).

### 8. Register the domain with `caddyku`

Before the first `up`, patch the compose file onto `caddy-net` and add the
domain to the shared Caddyfile:

```bash
cd ~/projects/pkuremote
caddyku init-app \
  --compose-file docker-compose.deploy.yml \
  --service app \
  --container pkuremote_app \
  --domain pkubersua.com \
  --upstream pkuremote_app:3000
```

DNS must already resolve to this VPS or cert issuance retries harmlessly. Verify
with `caddyku status`.

### 9. Make the image pullable

The GHCR package is private by default. The deploy workflows (`deploy.yml`,
`deploy-staging.yml`) log the server into GHCR themselves before every
`docker compose pull`, using the run's own `GITHUB_TOKEN` piped over SSH as an
`envs:`-scoped var (never embedded in the script string, so it never lands in
shell history or a log line on the box). Nothing to configure on the server —
there's no long-lived credential to expire or lose on a host rebuild.

If you'd rather not log in on every deploy, make the package **public**
instead (it holds no secrets — DB/OIDC creds are injected at runtime, only
`PUBLIC_*` values are baked in):

> GitHub ▸ organization `pekanbaru-dev` ▸ **Packages** ▸ `pkuremote` ▸ Package
> settings ▸ Change visibility ▸ Public. (Org-owned packages are under
> `github.com/orgs/pekanbaru-dev/packages` if the repo sidebar shows none.)

---

## One-time GitHub setup

### Repository Variables (Settings ▸ Secrets and variables ▸ Actions ▸ Variables)

Non-secret; baked into the image at build time:

| Variable               | Example                 |
| ---------------------- | ----------------------- |
| `PUBLIC_SITE_URL`      | `https://pkubersua.com` |
| `PUBLIC_CONTACT_EMAIL` | `hello@pkubersua.com`   |

### Secrets & the approval gate

Both workflows read the **same repository-level** SSH secrets — the ungated
`staging-test` workflow has no Environment, so it can only read repo-level
secrets, and the gated `deploy.yml` reads them too (an Environment job falls back
to repo-level secrets when the Environment doesn't redefine them). Keep them in
**one** place:

| Scope                  | Where                                                     | Holds                                                                     |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Repository** secrets | Settings ▸ Secrets and variables ▸ Actions ▸ _Repository_ | `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_PORT` (opt), `DEPLOY_DIR` |

The gate itself is on the **`production` Environment** (Settings ▸ Environments ▸
production): its **Required reviewers** are what make `deploy.yml` wait for an
Approve click. The Environment holds no SSH secrets of its own.

> **⚠️ Why `staging-test` push is restricted.** The staging workflow is ungated
> and deploys to the **same prod box** using those repo-level SSH secrets. A
> push-triggered workflow runs from the pushed branch, so anyone who could push
> to `staging-test` could edit the workflow in the same push and run arbitrary
> SSH on production — bypassing the approval gate entirely. To close that, the
> **`restrict-staging-test` ruleset** limits `creation`/`update`/`deletion` of
> `staging-test` to the **admin role** (bypass `RepositoryRole:5`). Non-admin
> collaborators can no longer push it. Admins retain access because a repo admin
> can bypass the gate regardless (they can edit the Environment, its reviewers,
> or secrets), so admin-vs-non-admin is the only enforceable boundary here. If
> you later want to narrow this to a specific subset, create a GitHub **team**
> and swap the bypass actor to that team.

### Deploy SSH key

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-deploy" -N ""
```

- **Public** key (`deploy_key.pub`) → append to the server's
  `~/.ssh/authorized_keys` for `SSH_USER`.
- **Private** key (`deploy_key`) → set as the **repository** secret
  `SSH_PRIVATE_KEY` (Settings ▸ Secrets and variables ▸ Actions ▸ _Repository_,
  **not** an Environment secret — the ungated `staging-test` workflow has no
  environment and can only read repo-level secrets). Then delete both local
  files. Avoid pasting the key into a chat/terminal that echoes it; pipe from the
  file instead: `gh secret set SSH_PRIVATE_KEY < deploy_key`.

There are **no TLS certificates to upload** — the shared Caddy issues and renews
them automatically.

---

## First deploy

Once the server has the compose file + `.env`, the domain is registered with
`caddyku` (step 8), DNS resolves, and GitHub is configured, **merge a PR to
`master`**. The Deploy (production) workflow starts and pauses at "Waiting";
open **Actions ▸ the run ▸ Review deployments ▸ Approve**. It then builds the
image, pushes to GHCR, SSHes in, and runs `docker compose pull && up -d`.

> First cutover only: the in-stack Postgres starts empty, so apply the initial
> schema + seed (see "Database migrations" below) right after the first deploy —
> the app 500s until migrations run.

Watch the shared proxy pick it up:

```bash
cd ~/projects/caddy-proxy && docker compose logs -f caddy
caddyku status   # shows OK once the app container is reachable
```

## Releasing a new version

Merge your PR to `master` → **Approve** the deployment in Actions. That's it.

## Deploying to staging-test (no approval)

Push the `staging-test` branch — it force-deploys immediately, no gate. **Note:**
until a dedicated staging host exists this targets the **same** server, domain,
and database as production, so a push here goes live on the real site.

```bash
git push origin HEAD:staging-test
```

Only **repo admins** can push `staging-test` (the `restrict-staging-test`
ruleset — see "Secrets & the approval gate" for why). If your push is rejected
with a ruleset violation, you're not an admin; use the normal PR-to-`master`
path instead.

## Rolling back

**Actions ▸ Deploy (production) ▸ Run workflow ▸** enter a previous **immutable**
image tag (e.g. `sha-abc1234`, from the older run's logs). Do **not** use
`latest` — every successful deploy overwrites it, so it points at the _current_
(bad) image and would redeploy the very thing you're rolling back from. No
rebuild — the server pulls that already-published image and restarts. Or on the
server:

```bash
cd ~/projects/pkuremote
IMAGE_TAG=sha-abc1234 docker compose -f docker-compose.deploy.yml up -d
```

---

## Config reference — where each value lives

| Value                                                                         | Server `.env` | GitHub Variable | GitHub Secret (repository) |
| ----------------------------------------------------------------------------- | :-----------: | :-------------: | :------------------------: |
| `SITE_DOMAIN`                                                                 |      ✅       |                 |                            |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`                         |      ✅       |                 |                            |
| `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` / `OIDC_REDIRECT_URI` |      ✅       |                 |                            |
| `ADMIN_EMAILS`                                                                |      ✅       |                 |                            |
| `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_EMAIL` (baked at build)                    |               |       ✅        |                            |
| `SSH_HOST` / `SSH_USER` / `SSH_PRIVATE_KEY` / `SSH_PORT` / `DEPLOY_DIR`       |               |                 |             ✅             |

Secrets never leave the server or the GitHub repository secret store; the image
itself carries no secrets.

## Database migrations

Drizzle migrations are **not** run by the deploy. The in-stack `postgres` has no
published host port, so apply migrations + seed from a trusted machine (a repo
checkout) over an SSH tunnel:

```bash
# 1. On the server, temporarily publish Postgres on loopback for the one-off:
#    add `ports: ["127.0.0.1:5432:5432"]` to the postgres service, `up -d`,
#    OR forward it: ssh -L 5432:localhost:5432 <user>@<server>  (with the port published)
# 2. From your machine, in the repo, against the tunneled DB:
DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:5432/<POSTGRES_DB> pnpm db:migrate
DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:5432/<POSTGRES_DB> pnpm db:seed
# 3. Remove the temporary port publish and `up -d` again.
```

The `postgres_data` named volume persists the database across image redeploys;
only destroying that volume requires re-running migrate + seed.

### Verifying the schema matches the running build

Because the deploy does not migrate, an image can ship code that expects columns
the database does not have. On 2026-08-31 this took the site down for hours: prod
sat at `0000` while the image needed `0001`+`0002`, so `profiles.role` was
missing and **every request carrying a session cookie 500'd on every route,
including `/login`** (issues #60 / #61).

Two things now make that state visible:

- **`/healthz`** compares the live `drizzle.__drizzle_migrations` table against
  the journal bundled into the build. `200 {"status":"ok"}` when they agree,
  `503 {"status":"degraded"}` with a pending count when they do not. The app also
  logs `[migrations] FATAL: …` once at boot. It deliberately keeps serving —
  `up -d` replaces the container, so refusing to start would turn a partial
  degradation into a total outage.
- **`scripts/smoke-test.sh`** runs automatically after both deploy workflows and
  can be run by hand: `scripts/smoke-test.sh https://pkubersua.com`. Note it
  probes with a **bogus session cookie** on purpose — an anonymous homepage ping
  stays `200` throughout this kind of outage, so it proves nothing.

### Seeding a real deployment

`pnpm db:seed` needs a live connection, and it TRUNCATEs (cascading to
`registrations`). For a deployment, emit SQL instead and apply it on the server,
where the credentials already are:

```bash
# --events-only: no demo author/announcement/placeholder post (they'd be public)
# --no-truncate: INSERTs only; aborts if any event already exists
pnpm db:seed:sql --events-only --no-truncate > /tmp/seed.sql
scp /tmp/seed.sql <user>@<server>:/tmp/
ssh <user>@<server> 'docker exec -i pkuremote-postgres-1 \
  psql -U <POSTGRES_USER> -d <POSTGRES_DB> -v ON_ERROR_STOP=1 \
  --single-transaction < /tmp/seed.sql'
```

Take a backup first: `docker exec pkuremote-postgres-1 pg_dump -U <user> -d <db> | gzip > backup.sql.gz`.

## Troubleshooting

| Symptom                                        | Likely cause                                                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caddy can't get a cert                         | DNS not pointing at the server yet, or 80/443 blocked                                                                                                   |
| `stat docker-compose.deploy.yml: no such file` | `DEPLOY_DIR` doesn't match where the compose file was copied                                                                                            |
| `caddyku status` shows "not running"           | app container isn't up — `docker compose -f docker-compose.deploy.yml up -d`                                                                            |
| `caddyku status` shows "not on caddy-net"      | compose file wasn't patched by `caddyku init-app` — re-run it                                                                                           |
| App 500s on first request                      | migrations not applied to the in-stack Postgres yet (see above)                                                                                         |
| Every page 500s, but only when logged in       | migrations not applied — the session lookup joins `profiles`, which anonymous requests skip. Check `/healthz`; probe with `curl -H 'Cookie: session=x'` |
| `/healthz` returns 503 `degraded`              | pending migrations; the running build expects a newer schema than the DB has (see "Verifying the schema matches the running build")                     |
| Smoke test fails after a green deploy          | the deploy IS live but broken; read the step's output for which check failed, then `/healthz` and `docker logs pkuremote_app`                           |
| Login fails / `oauth_callback` error           | `OIDC_REDIRECT_URI` doesn't match Google's Authorized redirect URI                                                                                      |
| `/admin` locks everyone out                    | `ADMIN_EMAILS` missing/empty in the server `.env`                                                                                                       |
| `docker compose pull` denied: denied           | `GITHUB_TOKEN` didn't reach the SSH step's login — check `envs:`/`env:` wiring in the workflow, not the server (it self-logs in every run)              |
| Deploy job stuck "Waiting"                     | required reviewer enabled — approve it in the run                                                                                                       |
| Empty OG/canonical URLs                        | `PUBLIC_SITE_URL` Variable not set when the image was built                                                                                             |
