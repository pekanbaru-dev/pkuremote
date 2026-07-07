# Deployment

How PKUBersua ships to production, and how to stand up the server the first
time. The stack is a SvelteKit (adapter-node) Docker image plus an in-stack
Postgres, fronted by a shared Caddy reverse proxy (managed by the
[`caddyku`](https://github.com/jufianto/caddyku) CLI) that terminates HTTPS
with automatic Let's Encrypt certificates. Auth is the app's own OIDC flow
(Arctic + DB-backed sessions) against Google — there is no Supabase.

## Pipeline at a glance

```
PR / push to main ──▶ CI (.github/workflows/ci.yml)
                       check · lint · test · build          (no image built)

git tag v1.2.0 ──────▶ Deploy (.github/workflows/deploy.yml)
   & push tag          build image ▶ push ghcr.io/pekanbaru-dev/pkuremote:v1.2.0 + :latest
                       ▶ [production Environment gate]
                       ▶ ssh server: docker compose pull && up -d

rollback ────────────▶ Actions ▸ Deploy ▸ "Run workflow" ▸ enter an older tag
                       (no rebuild — server just pulls the existing image)
```

An image is built **only when you push a version tag**, to keep Actions minutes
low. Merges to `main` only run the quality gate.

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

`DEPLOY_DIR` (the GitHub Environment secret, below) must point at this directory.

### 6. Set up the Google OAuth client

Auth is a generic OIDC flow; in production the issuer is Google.

1. Google Cloud Console ▸ **APIs & Services ▸ Credentials ▸ Create credentials
   ▸ OAuth client ID ▸ Web application**.
2. **Authorized redirect URI**: `https://pkubersua.com/auth/callback` (the app's
   own callback — no Supabase redirect URL).
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
ADMIN_EMAILS=admin@pkubersua.com
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

The GHCR package is private by default. Simplest: make it **public** (it holds
no secrets — DB/OIDC creds are injected at runtime, only `PUBLIC_*` values are
baked in):

> GitHub ▸ organization `pekanbaru-dev` ▸ **Packages** ▸ `pkuremote` ▸ Package
> settings ▸ Change visibility ▸ Public. (Org-owned packages are under
> `github.com/orgs/pekanbaru-dev/packages` if the repo sidebar shows none.)

To keep it private, log the server in once with a read-only token (classic PAT,
`read:packages` only):

```bash
echo <PAT_with_read:packages> | docker login ghcr.io -u <github-user> --password-stdin
```

---

## One-time GitHub setup

### Repository Variables (Settings ▸ Secrets and variables ▸ Actions ▸ Variables)

Non-secret; baked into the image at build time:

| Variable               | Example                 |
| ---------------------- | ----------------------- |
| `PUBLIC_SITE_URL`      | `https://pkubersua.com` |
| `PUBLIC_CONTACT_EMAIL` | `hello@pkubersua.com`   |

### The `production` Environment (Settings ▸ Environments ▸ New environment)

Name it **`production`**, then:

- **Deployment branches and tags** ▸ _Selected_ ▸ add rule `v*` — only version
  tags can deploy here.
- _(Optional)_ **Required reviewers** ▸ add yourself — deploys then pause for a
  one-click approval.
- **Environment secrets**:

  | Secret            | Purpose                                    |
  | ----------------- | ------------------------------------------ |
  | `SSH_HOST`        | server IP or hostname                      |
  | `SSH_USER`        | the deploy user                            |
  | `SSH_PRIVATE_KEY` | private half of the deploy key (see below) |
  | `SSH_PORT`        | SSH port if not `22` (optional)            |
  | `DEPLOY_DIR`      | e.g. `/home/<user>/projects/pkuremote`     |

### Deploy SSH key

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-deploy" -N ""
```

- **Public** key (`deploy_key.pub`) → append to the server's
  `~/.ssh/authorized_keys` for `SSH_USER`.
- **Private** key (`deploy_key`) → paste into the `SSH_PRIVATE_KEY` environment
  secret. Then delete both local files.

There are **no TLS certificates to upload** — the shared Caddy issues and renews
them automatically.

---

## First deploy

Once the server has the compose file + `.env`, the domain is registered with
`caddyku` (step 8), DNS resolves, and GitHub is configured, apply the initial
schema + seed (see "Database migrations" below), then:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The Deploy workflow builds the image, pushes it to GHCR, (waits for approval if
enabled,) SSHes in, and runs `docker compose pull && up -d`. Watch the shared
proxy pick it up:

```bash
cd ~/projects/caddy-proxy && docker compose logs -f caddy
caddyku status   # shows OK once the app container is reachable
```

## Releasing a new version

```bash
git checkout main && git pull
git tag v0.2.0
git push origin v0.2.0
```

## Rolling back

**Actions ▸ Deploy ▸ Run workflow ▸** enter a previous tag (e.g. `v0.1.0`). No
rebuild — the server pulls that already-published image and restarts. Or on the
server directly:

```bash
cd ~/projects/pkuremote
IMAGE_TAG=v0.1.0 docker compose -f docker-compose.deploy.yml up -d
```

---

## Config reference — where each value lives

| Value                                                                         | Server `.env` | GitHub Variable | GitHub Secret (production) |
| ----------------------------------------------------------------------------- | :-----------: | :-------------: | :------------------------: |
| `SITE_DOMAIN`                                                                 |      ✅       |                 |                            |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`                         |      ✅       |                 |                            |
| `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` / `OIDC_REDIRECT_URI` |      ✅       |                 |                            |
| `ADMIN_EMAILS`                                                                |      ✅       |                 |                            |
| `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_EMAIL` (baked at build)                    |               |       ✅        |                            |
| `SSH_HOST` / `SSH_USER` / `SSH_PRIVATE_KEY` / `SSH_PORT` / `DEPLOY_DIR`       |               |                 |             ✅             |

Secrets never leave the server or the GitHub Environment; the image itself
carries no secrets.

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

## Troubleshooting

| Symptom                                        | Likely cause                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Caddy can't get a cert                         | DNS not pointing at the server yet, or 80/443 blocked                        |
| `stat docker-compose.deploy.yml: no such file` | `DEPLOY_DIR` doesn't match where the compose file was copied                 |
| `caddyku status` shows "not running"           | app container isn't up — `docker compose -f docker-compose.deploy.yml up -d` |
| `caddyku status` shows "not on caddy-net"      | compose file wasn't patched by `caddyku init-app` — re-run it                |
| App 500s on first request                      | migrations not applied to the in-stack Postgres yet (see above)              |
| Login fails / `oauth_callback` error           | `OIDC_REDIRECT_URI` doesn't match Google's Authorized redirect URI           |
| `/admin` locks everyone out                    | `ADMIN_EMAILS` missing/empty in the server `.env`                            |
| `docker compose pull` denied                   | image still private and server not `docker login`'d to GHCR                  |
| Deploy job stuck "Waiting"                     | required reviewer enabled — approve it in the run                            |
| Empty OG/canonical URLs                        | `PUBLIC_SITE_URL` Variable not set when the image was built                  |
