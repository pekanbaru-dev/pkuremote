## Purpose

Reusable Cloudflare R2 object storage primitives for server-side file upload, deletion, and public URL generation, using the S3-compatible API.

## ADDED Requirements

### Requirement: R2 client is configured from environment variables and fails fast if any are missing

The system SHALL provide a server-only `getR2Client()` function that returns a singleton `S3Client` configured for Cloudflare R2 using `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` environment variables. If any required variable is absent or empty, the function SHALL throw a descriptive `Error` before attempting any network call. The client SHALL NOT be instantiated at module load time — it SHALL be created lazily on first call.

#### Scenario: Client initializes successfully with all env vars set

- **WHEN** all four R2 env vars are set and `getR2Client()` is called
- **THEN** a configured `S3Client` is returned without throwing

#### Scenario: Client throws when a required env var is missing

- **WHEN** `getR2Client()` is called and one or more of `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, or `R2_BUCKET` is absent
- **THEN** a descriptive `Error` is thrown naming the missing variable(s) before any network call is made

### Requirement: r2Put uploads bytes to R2 under a given key with a Content-Type

The system SHALL export a server-only `r2Put(key, body, contentType)` function that uploads a `Uint8Array` to the configured R2 bucket under the given key string, setting the object's `Content-Type` to the provided value. The function SHALL resolve when the upload completes and reject with an `Error` if the upload fails.

#### Scenario: A valid file is stored under the given key

- **WHEN** `r2Put("banners/events/abc.png", bytes, "image/png")` is called with valid credentials and a reachable bucket
- **THEN** the object is stored at key `banners/events/abc.png` with `Content-Type: image/png`

#### Scenario: An upload failure rejects with an error

- **WHEN** `r2Put` is called and the R2 API returns an error
- **THEN** the returned promise rejects with an `Error`

### Requirement: r2Delete removes an object from R2 by key, best-effort

The system SHALL export a server-only `r2Delete(key)` function that removes the object at the given key from the configured R2 bucket. A failure (e.g. object already gone, network error) SHALL be logged but SHALL NOT throw, so callers are never blocked by a cleanup failure.

#### Scenario: An existing object is removed

- **WHEN** `r2Delete("banners/events/abc.png")` is called for an object that exists
- **THEN** the object is removed from the bucket

#### Scenario: A delete failure is swallowed

- **WHEN** `r2Delete` is called and the R2 API returns an error
- **THEN** the error is logged and the function resolves without throwing

### Requirement: r2PublicUrl constructs a CDN URL from a key

The system SHALL export a pure `r2PublicUrl(key)` function that returns an absolute URL by concatenating `R2_PUBLIC_URL` (trailing slash normalized) with the given key. The function SHALL throw a descriptive `Error` if `R2_PUBLIC_URL` is not set.

#### Scenario: A key is converted to a full CDN URL

- **WHEN** `R2_PUBLIC_URL` is `https://cdn.pkubersua.com` and `r2PublicUrl("banners/events/abc.png")` is called
- **THEN** the function returns `https://cdn.pkubersua.com/banners/events/abc.png`

#### Scenario: Missing R2_PUBLIC_URL throws

- **WHEN** `r2PublicUrl` is called without `R2_PUBLIC_URL` set
- **THEN** a descriptive `Error` is thrown

### Requirement: r2PresignPut creates a short-lived presigned PUT URL for direct browser upload

The system SHALL export a server-only `r2PresignPut(key, contentType, expiresIn?)` function that returns a presigned PUT URL allowing a client (e.g. browser) to upload bytes directly to R2 at the given key, without the bytes passing through the server. The URL SHALL expire after a short default TTL (300 seconds / 5 minutes) and SHALL be scoped to the single given key and Content-Type (via `signableHeaders`).

#### Scenario: A presigned PUT URL is generated for a given key

- **WHEN** `r2PresignPut("test/abc.png", "image/png")` is called with valid credentials
- **THEN** a string presigned PUT URL is returned that can be used with `fetch(url, { method: "PUT", body, headers: { "Content-Type": "image/png" } })`

#### Scenario: The URL expires after the TTL

- **WHEN** more than the configured TTL elapses after generation
- **THEN** using the presigned URL to PUT returns an access-denied error from R2

#### Scenario: Missing credentials throws

- **WHEN** `r2PresignPut` is called and the R2 client cannot be constructed (env vars missing)
- **THEN** a descriptive `Error` is thrown
