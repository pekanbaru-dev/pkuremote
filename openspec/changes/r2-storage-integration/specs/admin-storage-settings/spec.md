## Purpose

An admin page at `/admin/settings` to verify the Cloudflare R2 storage configuration (read-only from env), test uploads via presigned URLs, and list/preview/delete uploaded test files.

## ADDED Requirements

### Requirement: Admin navigation includes a Storage settings entry

The system SHALL expose a `/admin/settings` route that is reachable from the admin navigation (via `NAV_ITEMS` in `src/lib/features/admin/nav.ts`). The route SHALL enforce `requireAdmin(locals)` and SHALL NOT be reachable by non-admin users.

#### Scenario: An admin can open the Storage settings page

- **WHEN** an authenticated admin navigates to `/admin/settings`
- **THEN** the page renders and shows the R2 storage configuration status

#### Scenario: A non-admin is blocked

- **WHEN** a signed-in non-admin (or anonymous) user requests `/admin/settings`
- **THEN** the request is rejected (redirect/forbidden) and the page does not render

### Requirement: The page shows R2 configuration status read-only from env

The page SHALL display whether each R2 env var (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`) is set, the R2 endpoint in use, and a link to the public URL base. It SHALL NOT allow editing these values — configuration remains sourced from environment variables.

#### Scenario: All env vars are set

- **WHEN** all R2 env vars are present in the server environment
- **THEN** the page lists each as set, shows the endpoint, and marks the configuration ready

#### Scenario: A required env var is missing

- **WHEN** one or more R2 env vars are missing
- **THEN** the page marks the configuration as incomplete and names the missing variable(s)

### Requirement: The page supports a presigned-URL test upload

The page SHALL let an admin select a file and upload it directly to R2 using a presigned PUT URL obtained from a server endpoint. The upload SHALL target the `test/` key prefix with a uuid-based name and preserve the file's Content-Type. After a successful upload, the page SHALL display the resulting public CDN URL and add the file to the visible list.

#### Scenario: A file is uploaded via presigned PUT

- **WHEN** an admin selects a file and triggers upload on the settings page
- **THEN** the server issues a short-lived presigned PUT URL for a `test/{uuid}.{ext}` key, the browser PUTs the file directly to R2, and the page shows the public CDN URL

#### Scenario: Upload fails or URL expires

- **WHEN** the presigned PUT fails or the URL has expired
- **THEN** the page shows an error and does not add a bogus entry to the list

### Requirement: The page lists and previews uploaded test files

The page SHALL list objects previously uploaded under the `test/` prefix, showing for each its key and a public URL; for image objects it SHALL render a preview via the CDN URL. The list SHALL be loaded from R2 (e.g. a `ListObjectsV2Command` scoped to the `test/` prefix).

#### Scenario: Existing test objects are listed

- **WHEN** the settings page loads and objects exist under `test/`
- **THEN** the page shows each object with its key, public URL, and image preview where applicable

### Requirement: The page can delete a test file

The page SHALL provide a delete action per listed object that removes the object from R2 via `r2Delete(key)` (admin-gated). After deletion the object SHALL disappear from the list.

#### Scenario: An admin deletes a test object

- **WHEN** an admin clicks delete on a listed test object
- **THEN** the object is removed from R2 and no longer appears in the list
