## Context

The app is deployed as an adapter-node server behind Caddy (`reverse_proxy http://app:3000`), packaged in Docker. The container runs as the unprivileged `node` user, and the `app` service currently mounts **no** volume, so its filesystem is ephemeral across redeploys. The `events.bannerUrl` column exists and is nullable. `static/` is baked into the build and cannot receive runtime writes. The chosen security posture is server-only gating: all admin writes go through `+page.server.ts` actions guarded by `requireAdmin`.

## Goals / Non-Goals

**Goals:**
- Store event banners on the VPS local disk, with no external object store or extra credentials.
- A server-only service to upload (validated) and delete banners, returning a stable public path.
- Serve stored files uniformly in dev and prod.
- Persist uploads across Docker redeploys.

**Non-Goals:**
- No Supabase Storage, no service-role key, no external bucket.
- No image transformation/resizing/CDN.
- No general media library — just event banners.
- No multi-replica shared storage (documented limitation).

## Decisions

### Store under a configurable `UPLOAD_DIR` outside the build
Uploads are written to `UPLOAD_DIR` (dev `./uploads`, prod `/data/uploads`), never into `static/`.

- **Why:** `static/` is immutable at runtime (baked into the build; the Docker image is read-only for app code). A separate configurable dir is the only place runtime writes survive and can be volume-mounted.
- **Alternatives considered:** Writing into `static/uploads` — rejected: not served after build and not writable in the image.

### Serve files via a SvelteKit GET route, not Caddy `file_server`
`src/routes/uploads/[file]/+server.ts` reads the requested file from `UPLOAD_DIR` and streams it with `Content-Type` and `Cache-Control: public, max-age=31536000, immutable`. It validates the filename is a plain basename (rejects `/`, `..`, absolute paths) before touching disk.

- **Why:** One code path that works in `pnpm dev` (no Caddy) and in prod. UUID filenames are content-stable, so `immutable` caching is safe and offloads repeat loads to the browser/proxy.
- **Alternatives considered:** Caddy `file_server` serving the volume — faster in prod (Node never streams bytes) but doesn't exist in dev, splitting behavior. Deferred as a pure prod optimization; the volume can be mounted read-only into Caddy later without changing stored URLs.

### Validate type + size server-side; uuid object keys
`uploadEventBanner(file)` rejects anything outside the image MIME allowlist or above the size cap, and writes under `{uuid}.{ext}`.

- **Why:** The server is the only trustworthy validation point. UUID keys prevent collisions and remove any user-controlled path component (no traversal on write).

### Replace-on-edit deletes the old file
Event management calls `deleteEventBanner(oldUrl)` after a successful new upload + DB update. `deleteEventBanner` maps the public path back to a basename under `UPLOAD_DIR` (rejecting anything that escapes it) and unlinks best-effort; failures are logged, not thrown.

- **Why:** Prevents orphan-file accumulation on disk; best-effort so a stale/missing file never corrupts committed state.

### Persistence: named volume + node-owned directory
Add a named volume at `UPLOAD_DIR` on `app` in both compose files, and `mkdir -p $UPLOAD_DIR && chown -R node:node $UPLOAD_DIR` in the `Dockerfile` before `USER node`.

- **Why:** Without a volume, uploads vanish on redeploy. Because the container runs as `node`, the directory must be node-owned; pre-creating it in the image means the named volume inherits that ownership on first initialization, so the unprivileged user can write.
- **Alternatives considered:** Host bind mount — works too, but a named volume is self-contained and doesn't depend on a host path existing. Running as root — rejected: the image deliberately drops to `node`.

## Risks / Trade-offs

- **[Uploads lost on redeploy] → the named volume is mandatory; the tasks add it to both compose files and the change is not "done" until persistence is verified across a container restart.**
- **[Non-root user can't write the volume] → `Dockerfile` pre-creates and chowns `UPLOAD_DIR` so the named volume initializes with `node` ownership.**
- **[Path traversal via crafted filename] → both the write path (uuid-only keys) and the serve route (basename validation, reject `..`/`/`) forbid user-controlled paths.**
- **[Single-VPS only] → local disk breaks under multiple `app` replicas (each has its own disk) and has no built-in backup. Documented; object storage is the horizontal-scale path.**
- **[Disk fills over time] → replace-on-edit cleanup bounds growth; the size cap limits per-file size. A future retention/orphan sweep is out of scope.**
- **[Node serves image bytes] → acceptable at this scale; immutable cache headers minimize repeat hits, and Caddy `file_server` is available later as an optimization.**

## Migration Plan

- Set `UPLOAD_DIR` in `.env` (dev) and via the `app` service env in prod compose (`/data/uploads`).
- Add the named volume to `docker-compose.yml` and `docker-compose.prod.yml`; add the `mkdir`/`chown` to the `Dockerfile`.
- Deploy; verify an upload survives `docker compose ... up -d --build`.
- **Rollback:** revert code + compose/Dockerfile changes; `UPLOAD_DIR` becomes unused. Existing banner files remain in the volume; `bannerUrl` values keep resolving as long as the serving route exists.
