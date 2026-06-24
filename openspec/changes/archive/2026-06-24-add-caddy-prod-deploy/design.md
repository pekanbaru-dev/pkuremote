# Design: Add Caddy reverse proxy + Let's Encrypt for production, plus a Docker-based local dev workflow

## Context

The repo today is a SvelteKit 5 + Tailwind v4 FE that renders a single landing page. The build adapter is `@sveltejs/adapter-auto`, which means `pnpm build` picks a target platform at build time and is not directly runnable on a generic VPS. The architecture decision is **FE + Supabase only** — no separate backend, no Node API server beyond what SvelteKit itself ships. Production deploy is currently undefined: there is no Dockerfile, no `Caddyfile`, no production env template, and no README deploy section. Contributors who prefer Docker over installing Node locally have no way to run the FE either.

This change closes both gaps with a single shared `Dockerfile` (multi-stage), and two thin `docker-compose` files: one for local dev, one for production.

- **Production:** the SvelteKit Node build (via `adapter-node`) runs in a container, fronted by a Caddy container that handles TLS, HTTP→HTTPS, and HSTS. Let's Encrypt is the certificate authority. The two containers run together via `docker-compose.prod.yml`.
- **Local dev:** the same Dockerfile's `dev` stage runs `pnpm dev` with the source mounted as a bind volume, exposed on `localhost:5173`. No Caddy, no HTTPS, no port 80/443. Run via `docker compose up` (the default `docker-compose.yml`).

The change is **independent of the archived `setup-supabase-drizzle` change**. That change stands up the data layer (Supabase Cloud + Drizzle); this one stands up the build/serve layer (SvelteKit + Caddy). They share a `.env` but no service definitions.

## Goals / Non-Goals

**Goals:**

- A single `docker compose up` brings up the local dev server on `localhost:5173` with hot reload.
- A single `docker compose -f docker-compose.prod.yml up -d` brings up the production site on `:80`/`:443`.
- Caddy automatically obtains and renews a Let's Encrypt cert for `SITE_DOMAIN` via the ACME HTTP-01 challenge.
- The SvelteKit Node app is reachable **only** on the internal Docker network in production; nothing is exposed to the host except Caddy's ports.
- A README runbook that explains the local dev paths, the prod env vars, the DNS prerequisite, and the one-time cert bootstrap.
- Switching the adapter is a contained change: `pnpm dev` and `pnpm build` both still work; the dev server is unaffected.

**Non-Goals:**

- No Kubernetes / Nomad / multi-host deploy. Single-VPS / single-host is the target.
- No CDN, no Cloudflare proxy, no WAF. Caddy is the only thing in front of the Node app in production.
- No staging environment. A later change can add a second `SITE_DOMAIN` + staging Caddy block if needed.
- No zero-downtime blue/green. `docker compose up -d --no-deps --build app` followed by a Caddy reload is good enough for a community bulletin.
- No CI pipeline changes. The Dockerfile is built and tested manually; a later change can wire `docker build` into CI.
- No HTTPS for local dev. The user explicitly asked for HTTP-only local dev; certs, HSTS, and the `acme_server` block are prod-only.

## Decisions

### D1. Switch to `@sveltejs/adapter-node`, keep the adapter in `vite.config.ts`.

- **Choice:** Replace the `adapter-auto` import in `vite.config.ts` with `adapter-node`. Build output moves to `build/` (a Node entrypoint at `build/index.js`).
- **Why:** `adapter-auto` selects a platform target at build time and produces an output that is not runnable on a generic VPS without extra glue. `adapter-node` produces a standard Node 18+ server that runs anywhere. Putting the adapter config in `vite.config.ts` matches the project's existing pattern (the file already imports the adapter and passes it to the `sveltekit()` plugin).
- **Alternative considered:** Introduce a `svelte.config.js` and move the adapter there. Rejected: the project has not adopted `svelte.config.js` and adding one for a single adapter swap is more diff than necessary.

### D2. Three-stage Dockerfile, with shared base.

- **Choice:** `base` (pnpm + all deps), `build` (extends base, runs `pnpm build`, prunes to prod deps), `dev` (extends base, runs `pnpm dev --host 0.0.0.0`), and `runtime` (extends build, copies only `build/`, prod `node_modules`, `package.json`, runs `node build`). `docker-compose.yml` builds with `target: dev` and bind-mounts the source; `docker-compose.prod.yml` uses the default `runtime` target.
- **Why:** One Dockerfile covers both workflows; the dev stage keeps `vite` and friends so hot reload works, and the runtime stage is a slim ~170 MB image with only the prod Node bundle. Sharing the base stage means `pnpm install` runs once and the dev container benefits from the same cached layer.
- **Alternative considered:** Two separate Dockerfiles (`Dockerfile.dev`, `Dockerfile.prod`). Rejected: code drift between the two; the dev Dockerfile would need a separate `pnpm install` and would not benefit from prod's cached install layer.
- **Alternative considered:** Single stage with `pnpm dev` running in production. Rejected: ships dev tooling, slower cold start, no build step.

### D3. Caddy container next to the app, not on the host.

- **Choice:** Caddy runs as a service in `docker-compose.prod.yml` next to the `app` service, on the same Docker network. The Caddy image is the official `caddy:<version>` (version pinned to a stable tag).
- **Why:** Keeps the deploy story as "one `docker compose up`." No host-level package install, no systemd unit, no `apt-get install caddy` step. The trade-off is that certs and Caddy config cache live in a named Docker volume (`caddy_data`, `caddy_config`) — also acceptable, and the volume survives container restarts.
- **Alternative considered:** Run Caddy natively on the host. Rejected by the user's choice.

### D4. Caddyfile is parameterized via `{$SITE_DOMAIN}`.

- **Choice:** The Caddyfile references `{$SITE_DOMAIN}` (Caddy's env-style placeholder syntax), with a sane default in the file. Operators override it at deploy time via `SITE_DOMAIN=...` in the compose environment.
- **Why:** Lets the same Caddyfile ship in the repo without committing the real domain. A contributor can also test it with a placeholder domain, although real Let's Encrypt issuance requires a public DNS A/AAAA record pointing at the host.
- **Alternative considered:** Hard-code the domain in the Caddyfile. Rejected by the user's choice of parameterized.

### D5. HTTP-01 ACME challenge (not DNS-01).

- **Choice:** Use Caddy's default `acme_server` (Let's Encrypt production) with the HTTP-01 challenge. Caddy listens on `:80`, serves the challenge from `/.well-known/acme-challenge/*`, obtains the cert, and stores it in the `caddy_data` volume.
- **Why:** HTTP-01 needs only port 80 and a public A/AAAA record — no DNS provider credentials, no wildcard cert, no API tokens. Caddy handles renewals automatically. This is the lowest-friction option for a single-domain community site.
- **Alternative considered:** DNS-01 challenge (e.g. via a Caddy DNS plugin). Rejected: requires a per-provider plugin and credentials in the env. Not justified for one domain.

### D6. Caddy reverse-proxies to `app:3000` on the internal network.

- **Choice:** The `app` service listens on `127.0.0.1:3000` inside the container (set via `HOST=127.0.0.1` and `PORT=3000` env vars, which is `adapter-node`'s default). The `caddy` service's `reverse_proxy` block targets `http://app:3000`. The `app` service is **not** published to the host.
- **Why:** The Node process only ever talks to Caddy, never to the public internet directly. That removes a class of misconfiguration (forgetting to bind to localhost and exposing the Node server to `:3000` on the host) and keeps the security surface to Caddy alone.
- **Alternative considered:** Publish `app` on a host port and reverse-proxy to `host:port`. Rejected: increases blast radius if the bind config is ever changed.

### D7. Caddy persists certs and config cache to named volumes.

- **Choice:** Two named volumes: `caddy_data` (the ACME account + certs) and `caddy_config` (the loaded Caddy config cache). The Caddy image's expected paths are `/data` and `/config`; the compose file mounts the volumes at those paths.
- **Why:** Without persistence, every container restart forces a new ACME registration and the cert is reissued. Caddy handles this fine, but the Let's Encrypt rate limits are tighter on issuance than on renewal, so persisting is the right default.
- **Alternative considered:** Bind-mount `./caddy_data` to the host filesystem. Rejected: leaks implementation details into the repo tree and forces a `.gitignore` entry. Named volumes are cleaner.

### D8. HSTS on the HTTPS listener only.

- **Choice:** Caddy's HTTPS site block includes `header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`. The HTTP listener is a 301 to the HTTPS host.
- **Why:** A static editorial site has no reason to serve any traffic over plain HTTP. HSTS with a one-year max-age + `includeSubDomains` + `preload` is the safe default; if a later change introduces a subdomain that must stay HTTP, the HSTS line is the one knob to revisit.
- **Alternative considered:** No HSTS. Rejected: leaves the door open for SSL-stripping on a user's first visit to the (HTTP) redirect.

### D9. Local dev uses the same Dockerfile's `dev` stage, with the source mounted and Vite's dev server exposed.

- **Choice:** `docker-compose.yml` builds the `dev` stage, bind-mounts the current directory to `/app` (preserving `node_modules` and `.svelte-kit` from the image so `pnpm dev` finds them), and runs `pnpm dev --host 0.0.0.0`. Port 5173 is published to `127.0.0.1:5173` on the host. No Caddy service.
- **Why:** Gives Docker-first contributors a hot-reloading dev experience equivalent to `pnpm dev`, with no Caddy and no cert management. Mounting `node_modules` as an anonymous volume (not the bind mount) prevents the host's missing `node_modules` from leaking into the container and clobbering the image's deps.
- **Alternative considered:** Build the prod image and `node build` in dev. Rejected: no hot reload, slower iteration.
- **Alternative considered:** Run `pnpm dev` on the host instead of in Docker. Rejected: the user explicitly asked for a Docker dev loop.

## Risks / Trade-offs

- **First deploy needs DNS already pointing at the host.** → README states the prerequisite in bold. The `docker compose up` will not fail loudly if DNS is wrong — Caddy will just keep retrying — so the runbook calls out `dig +short $SITE_DOMAIN` as a sanity check.
- **Caddy image version drift.** → Pin to a specific `caddy:2.x` tag in `docker-compose.prod.yml`. Bump in a single PR.
- **ACME rate limits if the named volume is ever lost.** → README notes that destroying `caddy_data` triggers a fresh registration; the LE limit is 50 certs per week per domain, which is plenty of headroom.
- **The Caddy container has access to the host network (port 80/443).** → Expected for any public-facing proxy. The `app` container is the actual application; the proxy is the only thing exposed.
- **`adapter-node` adds a Node runtime the project didn't have before.** → Image size grows from 0 (static) to ~170 MB. Acceptable for a single-host deploy; revisit if size becomes a concern.
- **No healthcheck on `app` from Caddy.** → Caddy's default `reverse_proxy` will mark the upstream unhealthy if it returns 5xx for the active health check URL. The default health endpoint (`/`) is fine for a SvelteKit app; if a later change adds a `/healthz` route, the Caddyfile can be updated to point at it.
- **`vite.config.ts` is the adapter's home.** → A future contributor moving to `svelte.config.js` will need to remember the adapter lives in `vite.config.ts`. README mentions it.
- **Local dev bind-mount permissions.** → The image's `USER node` directive means the host's UID/GID must allow the `node` user to read the mounted source. The README notes this; if permissions bite a contributor, switching to a `user: "0:0"` override is a future change.

## Migration Plan

This change adds new infrastructure; nothing existing is removed or replaced. The "migration" is the first deploy:

1. Operator sets `SITE_DOMAIN` (DNS A/AAAA record already pointing at the host's public IP) and `ACME_EMAIL` in `.env` on the server.
2. Operator runs `docker compose -f docker-compose.prod.yml up -d --build`.
3. Caddy obtains a cert on first start (visible in `docker compose logs caddy`).
4. Operator verifies `https://$SITE_DOMAIN` returns 200 and the cert is valid in the browser.

Rollback: `docker compose -f docker-compose.prod.yml down`. The `caddy_data` and `caddy_config` volumes persist by default; destroy them only if you want a clean slate.

## Open Questions

- None blocking. The first deploy will validate the Caddyfile and the Dockerfile; any tweaks are normal post-deploy patches.
