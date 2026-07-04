## 1. Config

- [ ] 1.1 Add `UPLOAD_DIR` to `.env.example` (comment: server-only; dev default `./uploads`, prod `/data/uploads`) and set it in the local `.env`
- [ ] 1.2 Add `uploads/` (dev upload dir) to `.gitignore` so local uploads aren't committed

## 2. Storage service (local filesystem)

- [ ] 2.1 Create `src/lib/server/storage/` resolving `UPLOAD_DIR` (with the documented dev fallback); ensure the dir exists at startup
- [ ] 2.2 Implement `uploadEventBanner(file)`: validate MIME (`image/png|jpeg|webp`) and max size, write `{uuid}.{ext}` under `UPLOAD_DIR`, return `/uploads/{uuid}.{ext}`; typed errors on invalid input
- [ ] 2.3 Implement `deleteEventBanner(pathOrUrl)`: resolve to a basename under `UPLOAD_DIR` (reject escapes), unlink best-effort, log-and-swallow failures
- [ ] 2.4 Export both from `src/lib/server/storage/index.ts`; unit-test validation + the path-safety mapping

## 3. Serving route

- [ ] 3.1 Create `src/routes/uploads/[file]/+server.ts` GET: reject filenames containing `/`, `\`, `..`, or absolute paths (404); stream existing files with correct `Content-Type` + `Cache-Control: public, max-age=31536000, immutable`; 404 on missing
- [ ] 3.2 Verify it works under both `pnpm dev` and the adapter-node build

## 4. Docker persistence

- [ ] 4.1 In `Dockerfile`, before `USER node`, add `RUN mkdir -p /data/uploads && chown -R node:node /data/uploads`
- [ ] 4.2 In `docker-compose.prod.yml`: add a named volume (e.g. `uploads_data:/data/uploads`) to `app`, declare it under top-level `volumes:`, and set `UPLOAD_DIR: /data/uploads` in the `app` environment
- [ ] 4.3 Mirror the volume + `UPLOAD_DIR` in `docker-compose.yml` (dev stack) as appropriate

## 5. Verify

- [ ] 5.1 Upload a valid image → `/uploads/{uuid}.ext` returned and loads via `<img>` in dev
- [ ] 5.2 Disallowed type and oversized file rejected with typed errors; nothing written
- [ ] 5.3 Traversal filename → 404; missing file → 404
- [ ] 5.4 In the Docker stack: upload a banner, run `docker compose ... up -d --build`, confirm the file and its URL survive; confirm the `node` user can write the volume
- [ ] 5.5 Confirm the storage service is absent from the client build; run `pnpm check` → `pnpm lint` → `pnpm test`
