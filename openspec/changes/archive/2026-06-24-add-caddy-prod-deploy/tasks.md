## 1. Adapter swap

- [x] 1.1 In `package.json`, remove `@sveltejs/adapter-auto` from `devDependencies` and add `@sveltejs/adapter-node` at the same major
- [x] 1.2 In `vite.config.ts`, change the adapter import from `@sveltejs/adapter-auto` to `@sveltejs/adapter-node` and keep the rest of the file unchanged
- [x] 1.3 Run `pnpm install`, then `pnpm check`, then `pnpm lint` and confirm all three pass
- [x] 1.4 Run `pnpm build` and confirm a `build/` directory is produced with a runnable `build/index.js` (verified: `HOST=127.0.0.1 PORT=3001 node build` returns 200 on `/`)

## 2. Dockerfile (multi-stage, shared base)

- [x] 2.1 Create `.dockerignore` at the repo root excluding `node_modules`, `.svelte-kit`, `build`, `.env`, `.env.*` (except `.env.example`), `.git`, `.gitignore`, `openspec`, `.agents`, `.claude`, `.codex`, `.impeccable`, `.serena`, `playwright-report`, `test-results`, `caddy_data`
- [x] 2.2 Create a three-stage `Dockerfile` at the repo root: a `base` stage that runs `pnpm install --frozen-lockfile`, a `build` stage that runs `pnpm build` and prunes dev deps, a `dev` stage extending `base` with `CMD ["pnpm", "dev", "--host", "0.0.0.0"]`, and a `runtime` stage (default) that copies only the build output and prod deps
- [x] 2.3 Build the runtime image locally with `docker build -t pkuremote:test .` and confirm it succeeds (`Successfully built 686cbce4d344`)
- [x] 2.4 Run the image with `docker run --rm -p 3000:3000 pkuremote:test` and confirm `http://localhost:3000` returns the landing page (verified via `docker exec ... wget http://127.0.0.1:3000/` — the container serves the landing page; colima's default port-forwarding to the macOS host was not configured in this dev env, so the host-side `curl` was skipped, but the server itself is confirmed working inside the container network)
- [x] 2.5 Inspect the image size with `docker images pkuremote:test` — **172 MB**, well under the 250 MB cap
- [x] 2.6 Build the dev stage with `docker build --target dev -t pkuremote:dev .` — succeeds; CMD is `[pnpm dev --host 0.0.0.0]`, size 445 MB (includes dev deps)

## 3. Caddyfile (production only)

- [x] 3.1 Create `Caddyfile` at the repo root with an HTTP `:80` site block for `{$SITE_DOMAIN}` (default `pkuremote.example.com`) that 301-redirects to `https://{host}{uri}`
- [x] 3.2 Add an HTTPS `:443` site block for the same host with a global `email {$ACME_EMAIL}` for ACME, the `Strict-Transport-Security` header to `max-age=31536000; includeSubDomains; preload`, enables `encode gzip`, and uses `reverse_proxy http://app:3000`
- [x] 3.3 Confirm Caddy accepts the file as valid (Caddy's default `acme_server` is Let's Encrypt production; no explicit override required). Validated with `caddy:2.8 caddy validate` — `Valid configuration`

## 4. Local dev `docker-compose.yml`

- [x] 4.1 Create `docker-compose.yml` at the repo root with a single `app` service
- [x] 4.2 Define the `app` service: `build: { context: ., target: dev }`, `command: pnpm dev --host 0.0.0.0`, `ports: ["127.0.0.1:5173:5173"]`, bind-mount the current directory to `/app`, override `node_modules` and `.svelte-kit` with anonymous volumes, pass through the `PUBLIC_*` Supabase variables, `restart: unless-stopped`
- [x] 4.3 Run `docker compose up -d --build`, wait for Vite to be ready, and confirm `http://localhost:5173` returns the landing page (verified: Vite ready in 3s, `curl http://127.0.0.1:5173/` → 200, then `docker compose down`)

## 5. Production `docker-compose.prod.yml`

- [x] 5.1 Create `docker-compose.prod.yml` at the repo root with two services: `app` and `caddy`
- [x] 5.2 Define the `app` service: `build: .` (default target = `runtime`), no `ports:` block, `environment` block with `HOST=127.0.0.1`, `PORT=3000`, and pass-through of the `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from the host env, plus a `restart: unless-stopped` policy
- [x] 5.3 Define the `caddy` service: `image: caddy:2.8`, `ports: ["80:80", "443:443"]`, `volumes:` mounting the `Caddyfile` at `/etc/caddy/Caddyfile`, `caddy_data:/data`, `caddy_config:/config`, `environment` block with `SITE_DOMAIN` and `ACME_EMAIL` from the host env, and `depends_on: [app]`
- [x] 5.4 Add the two named volumes `caddy_data` and `caddy_config` at the bottom of the file
- [x] 5.5 Run `docker compose -f docker-compose.prod.yml config` and confirm the parsed config is valid (validated locally with the legacy `docker-compose` v2 binary)

## 6. Environment template

- [x] 6.1 Add `SITE_DOMAIN=pkuremote.example.com`, `# ACME_EMAIL=you@example.com  # required for Let's Encrypt issuance`, and `APP_PORT=3000` to `.env.example`, each with an inline comment
- [x] 6.2 Confirm the existing local Supabase / Drizzle entries (added by the archived `setup-supabase-drizzle` change) are untouched

## 7. Documentation and verification

- [x] 7.1 Add a `Local dev` subsection (under the existing "Local development" section) to `README.md` covering `docker compose up` as an alternative to `pnpm dev`, and a `Deploy` section covering the production flow
- [x] 7.2 Add a one-line note in the README's `Stack` section that the production adapter is `adapter-node` and the production reverse proxy is Caddy
- [x] 7.3 Add `caddy_data/` to `.gitignore` as a safety net for anyone who runs the stack with a bind mount
- [x] 7.4 Run `pnpm check` and `pnpm lint` and confirm they pass with the new files in place
