# admin-media-upload Specification

## Purpose

TBD - created by archiving change admin-media-upload. Update Purpose after archive.

## Requirements

### Requirement: Banner images are stored on local disk under `UPLOAD_DIR`

The system SHALL store event banner images on the local filesystem under a directory resolved from the `UPLOAD_DIR` environment variable, located outside the SvelteKit build output (never in `static/`). When `UPLOAD_DIR` is unset in development, the system MAY fall back to a documented default (e.g. `./uploads`); in production it SHALL be set explicitly. Stored files SHALL be named with a uuid-based key (`{uuid}.{ext}`), never a user-supplied path.

#### Scenario: An uploaded banner is written under UPLOAD_DIR

- **WHEN** an admin-gated action calls `uploadEventBanner(file)` with a valid image
- **THEN** the file is written under `UPLOAD_DIR` with a uuid-based name and no user-controlled path segment

#### Scenario: The store is outside the build

- **WHEN** `pnpm build` runs and the app is packaged
- **THEN** `UPLOAD_DIR` is not part of the immutable build output (it is a separate runtime directory)

### Requirement: `uploadEventBanner` validates type and size and returns a public path

The system SHALL export a server-only `uploadEventBanner(file)` under `src/lib/server/storage/` that validates the file's MIME type against an allowlist (`image/png`, `image/jpeg`, `image/webp`) and enforces a maximum size, writes the file to `UPLOAD_DIR`, and returns a public path of the form `/uploads/{uuid}.{ext}` (suitable for storing in `events.bannerUrl` and rendering in an `<img src>`). Files failing validation SHALL be rejected with a typed error and SHALL NOT be written.

#### Scenario: A valid image returns a public path

- **WHEN** `uploadEventBanner(file)` is called with an `image/webp` under the size limit
- **THEN** the function writes the file and returns a `/uploads/{uuid}.webp` path

#### Scenario: A disallowed type is rejected

- **WHEN** `uploadEventBanner(file)` is called with a non-image (e.g. `application/pdf`)
- **THEN** the function throws a typed validation error and writes nothing

#### Scenario: An oversized file is rejected

- **WHEN** `uploadEventBanner(file)` is called with an image exceeding the maximum size
- **THEN** the function throws a typed validation error and writes nothing

### Requirement: A serving route streams stored files with traversal protection and cache headers

The system SHALL provide a GET route at `src/routes/uploads/[file]/+server.ts` that serves a stored file from `UPLOAD_DIR`. It SHALL validate that the requested filename is a plain basename — rejecting any value containing `/`, `\`, `..`, or an absolute path — and return 404 rather than reading outside `UPLOAD_DIR`. For an existing file it SHALL respond with the correct `Content-Type` and an immutable long-lived cache header (uuid names are content-stable). The route SHALL behave identically in `pnpm dev` and in the production adapter-node server.

#### Scenario: A stored banner is served

- **WHEN** a browser requests `/uploads/{uuid}.png` for an existing file
- **THEN** the route responds 200 with the image bytes, the correct `Content-Type`, and a `Cache-Control` marking it immutable

#### Scenario: A path-traversal filename is rejected

- **WHEN** a request targets `/uploads/..%2F..%2Fetc%2Fpasswd` or any filename containing `/`, `\`, or `..`
- **THEN** the route responds 404 and reads nothing outside `UPLOAD_DIR`

#### Scenario: A missing file returns 404

- **WHEN** a request targets `/uploads/{uuid}.png` for a file that does not exist
- **THEN** the route responds 404

### Requirement: `deleteEventBanner` removes a previously stored banner best-effort

The system SHALL export a server-only `deleteEventBanner(pathOrUrl)` that maps a stored public path back to a basename under `UPLOAD_DIR` (rejecting anything that escapes the directory) and removes the file. A deletion failure (e.g. file already gone) SHALL be logged but SHALL NOT throw in a way that corrupts the caller's already-committed state.

#### Scenario: Replacing a banner removes the old file

- **WHEN** an event's banner is replaced — a new file is uploaded, the event row is updated to the new path, and `deleteEventBanner(oldPath)` is called
- **THEN** the old file is removed from `UPLOAD_DIR` and the event points at the new banner

#### Scenario: A failed cleanup does not corrupt state

- **WHEN** `deleteEventBanner(pathOrUrl)` fails to remove the file
- **THEN** the failure is logged and the caller's committed state (the new banner path on the event) is unaffected

### Requirement: Uploads persist across Docker redeploys and are writable by the container user

The `UPLOAD_DIR` location SHALL be backed by a named Docker volume mounted on the `app` service in both `docker-compose.yml` and `docker-compose.prod.yml`, so uploaded files survive container restarts and rebuilds. Because the container runs as the unprivileged `node` user, the `Dockerfile` SHALL create `UPLOAD_DIR` owned by `node` before dropping to that user, so the volume initializes with write permission for the runtime user.

#### Scenario: An upload survives a redeploy

- **WHEN** an admin uploads a banner and the stack is redeployed (`docker compose ... up -d --build`)
- **THEN** the banner file is still present and its `/uploads/{uuid}.ext` URL still resolves

#### Scenario: The runtime user can write the volume

- **WHEN** the `node` user attempts to write a file into the volume-mounted `UPLOAD_DIR`
- **THEN** the write succeeds because the directory is owned by `node`

### Requirement: Upload/delete callers must be admin-gated

The storage service SHALL be invoked only from server contexts that have already enforced administrator access via `requireAdmin(locals)`. The service assumes an authorized caller and performs no additional session checks. The service and the serving route SHALL live in server-only locations and SHALL NOT be importable from client components.

#### Scenario: An upload happens inside an admin-gated action

- **WHEN** an event create/edit form action calls `uploadEventBanner`
- **THEN** that action has already called `requireAdmin(locals)` earlier in its execution, so only administrators can trigger an upload
