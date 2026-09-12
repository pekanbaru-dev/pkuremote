## ADDED Requirements

### Requirement: A Go service serves the event domain over ConnectRPC on the private network only

The repository SHALL contain a Go service in `api/` (module `github.com/pekanbaru-dev/pkuremote/api`) that serves the event domain via connect-go on a single port speaking gRPC, gRPC-Web, and Connect JSON. The service SHALL be reachable only on the internal Docker network: its container SHALL publish no host ports and SHALL NOT appear in the Caddy configuration. The SvelteKit BFF is its only client in this change.

#### Scenario: The API is not reachable from outside the stack

- **WHEN** the compose stack is up and a client on the host attempts to connect to the api service's port
- **THEN** the connection is refused — no host port is published and Caddy does not proxy to it

#### Scenario: JSON debugging works against the same port

- **WHEN** a developer inside the network POSTs JSON to a Connect RPC path (e.g. `/events.v1.EventService/ListEvents`)
- **THEN** the service answers with JSON, without any gRPC tooling

### Requirement: Requests carry trusted-header identity guarded by an internal token

The BFF SHALL resolve the browser's session cookie and forward the authenticated user's id as an `X-User-Id` header on internal calls, plus a shared-secret `X-Internal-Token` header. The Go service SHALL reject any request whose internal token is missing or wrong, SHALL treat `X-User-Id` as the authenticated identity only after the token check passes, and SHALL fail closed (refuse all requests) when its `INTERNAL_TOKEN` configuration is unset in production. RPCs that require authentication SHALL fail with an unauthenticated error when `X-User-Id` is absent.

#### Scenario: A request without the internal token is rejected

- **WHEN** a request reaches the Go service without a valid `X-Internal-Token`
- **THEN** the service responds with an authentication error and does not read `X-User-Id`

#### Scenario: Anonymous reads still work

- **WHEN** the BFF calls a public read RPC (event listing) with a valid internal token and no `X-User-Id`
- **THEN** the RPC succeeds — public data requires no user identity

#### Scenario: Missing token config fails closed

- **WHEN** the service starts in production mode without `INTERNAL_TOKEN` set
- **THEN** it refuses to serve requests rather than accepting unauthenticated headers

### Requirement: Admin authorization is enforced in Go and exposed via `GetMe`

The Go service SHALL own admin authorization: it reads `ADMIN_EMAILS` (comma-separated, trimmed, lowercased, fail-closed when unset/empty — semantics identical to the `admin-access` capability) and its middleware SHALL reject admin RPCs for non-admin identities regardless of what the BFF asserts. `AuthService.GetMe` SHALL return the calling user's identity and `is_admin` flag so the BFF can gate `/admin` routes without reading `ADMIN_EMAILS` itself.

#### Scenario: A non-admin cannot invoke an admin RPC

- **WHEN** a request with a valid internal token and a non-admin `X-User-Id` calls an admin RPC (e.g. `CreateEvent`)
- **THEN** the service responds with a permission-denied error and no write occurs

#### Scenario: GetMe reports admin status

- **WHEN** the BFF calls `GetMe` for a user whose email is in `ADMIN_EMAILS`
- **THEN** the response has `is_admin = true`; for any other user it is `false`

### Requirement: The RPC surface preserves current user-visible behavior

The Go service SHALL implement the event domain so that browser-facing behavior is unchanged: upcoming/past/filtered event listings, event detail by slug, booking (including quota exhaustion and duplicate-booking errors mapped to the same user-facing messages), my-registrations, ticket lookup by registration number, admin event CRUD with validation equivalent to `validateEventInput`, attendee check-in status changes, dashboard aggregates, attendee CSV export (same columns), and banner upload/serving via the shared uploads volume.

#### Scenario: Booking behaves identically

- **WHEN** a user books an event that is full, already booked by them, or past its registration deadline
- **THEN** the BFF surfaces the same error messages and states as the pre-migration implementation

#### Scenario: CSV export matches

- **WHEN** an admin exports attendees for an event
- **THEN** the downloaded CSV has the same columns and row content as the pre-migration export

#### Scenario: Uploaded banners remain reachable at stable URLs

- **WHEN** an admin uploads a banner and a visitor requests the existing `/uploads/<file>` URL
- **THEN** the BFF serves the bytes (proxied from the api's storage) and previously uploaded files remain reachable

### Requirement: The service exposes health and starts safely

The Go service SHALL expose a plain-HTTP `/healthz` endpoint reporting readiness (including DB connectivity), SHALL apply pending goose migrations before serving traffic, and SHALL shut down gracefully on SIGTERM. The compose stack SHALL use the healthcheck so the web service starts against a ready API.

#### Scenario: Compose waits for a healthy api

- **WHEN** the stack starts and the api is still migrating or cannot reach Postgres
- **THEN** `/healthz` reports not-ready and dependent services wait until it reports healthy

### Requirement: The BFF reaches the API through a server-only client factory

The web app SHALL create its connect-es client per request via a factory in `web/src/lib/server/api/` (server-only path), configured from an `API_URL` environment variable. Client-side code SHALL NOT import the API client; the existing server-only enforcement (bundler + ESLint restricted imports) SHALL cover the new module.

#### Scenario: Client code cannot import the API client

- **WHEN** a `.svelte` file or client-side module imports from `$lib/server/api`
- **THEN** the build fails with the standard server-only violation
