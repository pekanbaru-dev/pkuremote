## 1. Config

- [x] 1.1 Add `UPLOAD_DIR` to `.env.example` (server-only; dev default `./uploads`, prod `/data/uploads`) and set it in the local `.env`
- [x] 1.2 Add `uploads/` (dev upload dir) to `.gitignore` so local uploads aren't committed

## 2. Storage service (local filesystem)

- [x] 2.1 Create `src/lib/server/storage/` resolving `UPLOAD_DIR` (dev fallback `./uploads`); `uploadEventBanner` mkdir's the dir before writing
- [x] 2.2 Implement `uploadEventBanner(file)`: validate MIME (`image/png|jpeg|webp`) + max size (2 MiB), write `{uuid}.{ext}`, return `/uploads/{uuid}.{ext}`; typed `MediaUploadError` on invalid input
- [x] 2.3 Implement `deleteEventBanner(pathOrUrl)`: `safeBasename` (rejects `..`/`\`) + in-dir check, unlink best-effort, log-and-swallow failures
- [x] 2.4 Export from `src/lib/server/storage/index.ts`; `storage.test.ts` covers validation + path-safety (105 tests pass)

## 3. Serving route

- [x] 3.1 `src/routes/uploads/[file]/+server.ts` GET: rejects unsafe names (404 via `readUpload`); streams with correct `Content-Type` + `Cache-Control: public, max-age=31536000, immutable`; 404 on missing
- [x] 3.2 Verified on dev: valid → 200 (`image/png`, immutable), missing → 404, traversal → 404; endpoint present in the adapter-node build output

## 4. Docker persistence

- [x] 4.1 `Dockerfile`: `RUN mkdir -p /data/uploads && chown -R node:node /data/uploads` before `USER node`; `ENV UPLOAD_DIR=/data/uploads`
- [x] 4.2 `docker-compose.prod.yml`: named volume `uploads_data:/data/uploads` on `app`, declared under top-level `volumes:`, `UPLOAD_DIR: /data/uploads` in app env (verified via `docker compose config`)
- [x] 4.3 `docker-compose.yml` (dev): `UPLOAD_DIR: /app/uploads` (persisted via the existing repo bind-mount → host `./uploads`; no separate volume needed)

## 5. Verify

- [x] 5.1 Upload path returns `/uploads/{uuid}.ext`; serving route loads it (verified via dev with a placed file)
- [x] 5.2 Disallowed type and oversized file rejected with typed errors (unit tests); nothing written
- [x] 5.3 Traversal filename → 404; missing file → 404 (verified on dev)
- [x] 5.4 Docker wiring verified via `docker compose config` (volume + UPLOAD_DIR + node-owned dir); full `up --build` persistence is a deploy-time step
- [x] 5.5 Storage service absent from client build; `pnpm check` (0 errors) → `pnpm lint` (clean) → `pnpm test` (105 passed)
