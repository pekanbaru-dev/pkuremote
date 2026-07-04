# Deployment

How PKUBersua ships to production, and how to stand up the server the first
time. The stack is a SvelteKit (adapter-node) Docker image behind Caddy, which
terminates HTTPS with automatic Let's Encrypt certificates.

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

Create an `A` record: `pkubersua.com → <server IP>` (and `www` if used). Caddy
cannot obtain a TLS certificate until the domain resolves to the server.

### 3. Install Docker + Compose

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # log out/in so the group takes effect
docker compose version            # confirm the compose plugin is present
```

### 4. Open the firewall

Allow inbound `22` (SSH), `80` and `443` (HTTP/S). Everything else stays closed;
the app port `3000` is internal to the Docker network.

### 5. Create the deploy directory and drop in three files

The server needs **only** these — no source code:

```bash
sudo mkdir -p /opt/pkuremote && sudo chown "$USER" /opt/pkuremote
cd /opt/pkuremote
# copy from the repo (scp, git archive, or paste):
#   docker-compose.deploy.yml
#   Caddyfile
```

### 6. Create the server `.env`

In `/opt/pkuremote/.env` (never committed). These are read by
`docker-compose.deploy.yml` at runtime:

```ini
# --- Domain / TLS ---
SITE_DOMAIN=pkubersua.com
ACME_EMAIL=you@example.com

# --- Database (Supabase pooled connection) ---
DATABASE_URL=postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres

# --- Supabase (browser-visible, read at runtime) ---
PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>

# --- Admin access (comma-separated Google emails) ---
ADMIN_EMAILS=admin@pkubersua.com
```

> `SUPABASE_SERVICE_ROLE_KEY` is **not** needed at runtime (only for
> `pnpm db:seed`). Keep it off the production host.

### 7. Make the image pullable

The GHCR package is private by default. Simplest: make it **public** (it holds
no secrets — DB/Supabase creds are injected at runtime, only `PUBLIC_*` values
are baked in):

> GitHub ▸ repo ▸ **Packages** ▸ `pkuremote` ▸ Package settings ▸ Change
> visibility ▸ Public.

To keep it private instead, log the server in once with a read-only token:

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
  one-click approval and are recorded in the environment's history.
- **Environment secrets** (scoped to this environment only):

  | Secret            | Purpose                                    |
  | ----------------- | ------------------------------------------ |
  | `SSH_HOST`        | server IP or hostname                      |
  | `SSH_USER`        | the deploy user                            |
  | `SSH_PRIVATE_KEY` | private half of the deploy key (see below) |
  | `SSH_PORT`        | SSH port if not `22` (optional)            |
  | `DEPLOY_DIR`      | e.g. `/opt/pkuremote`                      |

### Deploy SSH key

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-deploy" -N ""
```

- **Public** key (`deploy_key.pub`) → append to the server's
  `~/.ssh/authorized_keys` for `SSH_USER`.
- **Private** key (`deploy_key`) → paste into the `SSH_PRIVATE_KEY` environment
  secret. Then delete both local files.

There are **no TLS certificates to upload** — Caddy issues and renews them
automatically.

---

## First deploy

Once the server has the files + `.env`, DNS resolves, and GitHub is configured:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The Deploy workflow builds the image, pushes it to GHCR, (waits for approval if
you enabled it,) SSHes in, and runs `docker compose pull && up -d`. Watch Caddy
get its certificate:

```bash
docker compose -f docker-compose.deploy.yml logs -f caddy
```

## Releasing a new version

```bash
git checkout main && git pull
git tag v0.2.0
git push origin v0.2.0
```

## Rolling back

**Actions ▸ Deploy ▸ Run workflow ▸** enter a previous tag (e.g. `v0.1.0`). No
rebuild happens — the server just pulls that already-published image and
restarts. Or, on the server directly:

```bash
cd /opt/pkuremote
IMAGE_TAG=v0.1.0 docker compose -f docker-compose.deploy.yml up -d
```

---

## Config reference — where each value lives

| Value                                                                   | Server `.env` | GitHub Variable | GitHub Secret (production) |
| ----------------------------------------------------------------------- | :-----------: | :-------------: | :------------------------: |
| `SITE_DOMAIN`, `ACME_EMAIL`                                             |      ✅       |                 |                            |
| `DATABASE_URL`                                                          |      ✅       |                 |                            |
| `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`                       |      ✅       |                 |                            |
| `ADMIN_EMAILS`                                                          |      ✅       |                 |                            |
| `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_EMAIL` (baked at build)              |               |       ✅        |                            |
| `SSH_HOST` / `SSH_USER` / `SSH_PRIVATE_KEY` / `SSH_PORT` / `DEPLOY_DIR` |               |                 |             ✅             |

Secrets never leave the server or the GitHub Environment; the image itself
carries no secrets.

## Database migrations

Drizzle migrations are **not** run by the deploy. Apply them from a trusted
machine with the direct (non-pooled) connection before/after a release:

```bash
DATABASE_URL=$DIRECT_URL pnpm db:migrate
```

## Troubleshooting

| Symptom                      | Likely cause                                                |
| ---------------------------- | ----------------------------------------------------------- |
| Caddy can't get a cert       | DNS not pointing at the server yet, or 80/443 blocked       |
| `/admin` locks everyone out  | `ADMIN_EMAILS` missing/empty in the server `.env`           |
| `docker compose pull` denied | image still private and server not `docker login`'d to GHCR |
| Deploy job stuck "Waiting"   | required reviewer enabled — approve it in the run           |
| Empty OG/canonical URLs      | `PUBLIC_SITE_URL` Variable not set when the image was built |
