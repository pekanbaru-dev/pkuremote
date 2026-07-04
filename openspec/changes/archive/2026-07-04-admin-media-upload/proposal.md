## Why

Admin event management needs to set an event's banner image. We chose **upload** (not URL-paste), and we're storing files on the **VPS local filesystem** rather than an object store — no Supabase Storage, no service-role key, no external bucket. This change adds a server-only media-upload capability: a local uploads directory, an admin-gated upload/delete service, and a route that serves the stored files. It writes a public path into the existing `events.bannerUrl` column. It's factored out of event management so the storage concern is isolated and reusable.

## What Changes

- Store banner images on local disk under a configurable `UPLOAD_DIR` (dev default e.g. `./uploads`; prod `/data/uploads`), **outside the SvelteKit build** (the `static/` dir is baked at build time and cannot receive runtime uploads).
- Add a server-only storage service at `src/lib/server/storage/`: `uploadEventBanner(file)` validates and writes the image, returning a public path like `/uploads/{uuid}.{ext}`; `deleteEventBanner(pathOrUrl)` removes a previously stored file (for replace-on-edit cleanup).
- Add a SvelteKit GET route `src/routes/uploads/[file]/+server.ts` that streams a stored file from `UPLOAD_DIR` with the correct content type and an immutable cache header. It works identically in `pnpm dev` and in the adapter-node prod server (no dependency on Caddy), and it rejects path-traversal filenames.
- Enforce validation server-side: allowed image MIME types (`image/png`, `image/jpeg`, `image/webp`), a maximum file size, and a uuid-based object key (no user-controlled path).
- **Persistence for the Docker deploy**: add a named volume mounted at `UPLOAD_DIR` on the `app` service in `docker-compose.yml` and `docker-compose.prod.yml`, and pre-create the directory owned by the `node` user in the `Dockerfile` (the container runs as unprivileged `node`). Without the volume, uploads are lost on every redeploy/restart.
- Enforcement stays server-only gating: callers (form actions) MUST call `requireAdmin(locals)` before invoking the upload/delete service.

## Capabilities

### New Capabilities

- `admin-media-upload`: The local-disk banner upload/delete service, the `UPLOAD_DIR` location, file validation rules, the `/uploads/[file]` serving route (with path-traversal protection and cache headers), and the persistence wiring (Docker volume + directory ownership).

### Modified Capabilities

<!-- None. events.bannerUrl already exists; no requirement of the events capability changes here. -->

## Impact

- **New env var**: `UPLOAD_DIR` (server-only; documented in `.env.example`). Dev default `./uploads`; prod `/data/uploads` via compose.
- **New code**: `src/lib/server/storage/index.ts` (filesystem write/delete), `src/routes/uploads/[file]/+server.ts` (serving route). Reuses `events.bannerUrl` — **no schema change**.
- **Deploy changes**: a named volume (e.g. `uploads_data:/data/uploads`) on `app` in both compose files; a `mkdir -p $UPLOAD_DIR && chown node:node` step in the `Dockerfile`; `UPLOAD_DIR` set in the `app` service environment.
- **Depends on**: `add-admin-access-gate` (callers gate via `requireAdmin`).
- **Consumed by**: `admin-event-management` (banner upload on create/edit).
- **Known limitation**: local disk is single-VPS (no built-in backup/CDN; breaks under multiple `app` replicas). Backups are an operator responsibility; object storage is the future path if the app scales horizontally.
