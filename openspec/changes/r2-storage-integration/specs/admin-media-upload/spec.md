## MODIFIED Requirements

### Requirement: Banner images are stored in Cloudflare R2 under a namespaced key

The system SHALL store event banner images and article cover images in Cloudflare R2 object storage. Files SHALL be named with a uuid-based key under a content-type prefix: `banners/events/{uuid}.{ext}` for event banners and `banners/articles/{uuid}.{ext}` for article covers. User-supplied filenames or paths SHALL never be used as keys.

#### Scenario: An uploaded banner is stored in R2 under the correct key prefix

- **WHEN** an admin-gated action calls `uploadEventBanner(file)` with a valid image
- **THEN** the file is written to R2 at key `banners/events/{uuid}.{ext}` and the function returns a public CDN URL

#### Scenario: An uploaded article cover is stored in R2 under the correct key prefix

- **WHEN** an authenticated action calls `uploadArticleCover(file)` with a valid image
- **THEN** the file is written to R2 at key `banners/articles/{uuid}.{ext}` and the function returns a public CDN URL

### Requirement: `uploadEventBanner` and `uploadArticleCover` return absolute CDN URLs

The system SHALL export server-only `uploadEventBanner(file)` and `uploadArticleCover(file)` functions that validate the file's MIME type against an allowlist (`image/png`, `image/jpeg`, `image/webp`) and enforce a maximum size of 2 MiB, upload the file to R2, and return an absolute public CDN URL of the form `{R2_PUBLIC_URL}/banners/{type}/{uuid}.{ext}` (suitable for storing in `events.bannerUrl` or article cover fields and rendering in an `<img src>`). Files failing validation SHALL be rejected with a typed `MediaUploadError` and SHALL NOT be uploaded.

#### Scenario: A valid image returns an absolute CDN URL

- **WHEN** `uploadEventBanner(file)` is called with a valid `image/webp` under the size limit
- **THEN** the function uploads the file to R2 and returns a URL starting with `R2_PUBLIC_URL`

#### Scenario: A disallowed type is rejected

- **WHEN** `uploadEventBanner(file)` is called with a non-image (e.g. `application/pdf`)
- **THEN** the function throws a `MediaUploadError` with code `INVALID_TYPE` and nothing is uploaded

#### Scenario: An oversized file is rejected

- **WHEN** `uploadEventBanner(file)` is called with an image exceeding 2 MiB
- **THEN** the function throws a `MediaUploadError` with code `FILE_TOO_LARGE` and nothing is uploaded

### Requirement: `deleteEventBanner` and `deleteArticleCover` remove objects from R2 best-effort

The system SHALL export server-only `deleteEventBanner(urlOrKey)` and `deleteArticleCover(urlOrKey)` functions that extract the R2 key from a stored CDN URL or bare key and remove the corresponding object from R2. A deletion failure SHALL be logged but SHALL NOT throw so that callers' already-committed state is never corrupted.

#### Scenario: Replacing a banner removes the old R2 object

- **WHEN** an event's banner is replaced and `deleteEventBanner(oldUrl)` is called with the previous CDN URL
- **THEN** the old R2 object is removed and the event row points at the new banner URL

#### Scenario: A failed cleanup does not corrupt state

- **WHEN** `deleteEventBanner(urlOrKey)` fails to remove the R2 object
- **THEN** the failure is logged and the caller's committed state is unaffected

## REMOVED Requirements

### Requirement: Banner images are stored on local disk under `UPLOAD_DIR`

**Reason**: Replaced by Cloudflare R2 object storage. Local disk storage is not CDN-capable, not scalable across instances, and requires Docker volume management.
**Migration**: Remove `UPLOAD_DIR` from `.env` and compose files. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_URL` instead.

### Requirement: A serving route streams stored files with traversal protection and cache headers

**Reason**: Files are now served directly from the R2 public CDN URL. No SvelteKit proxy route is needed.
**Migration**: Remove `src/routes/uploads/[file]/+server.ts`. Update any stored `/uploads/...` URLs in the database to null or the new CDN URL format.

### Requirement: Uploads persist across Docker redeploys and are writable by the container user

**Reason**: R2 is a managed durable object store — persistence and write access are handled by Cloudflare infrastructure. No Docker volume or container user ownership setup is required.
**Migration**: Remove the `/data/uploads` volume mount from `docker-compose.yml` and `docker-compose.prod.yml`. Remove the `mkdir`/`chown` setup in `Dockerfile` for the uploads directory.
