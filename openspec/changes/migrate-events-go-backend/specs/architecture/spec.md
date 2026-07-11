## MODIFIED Requirements

### Requirement: Shared code and domain features are separated into horizontal and vertical layers

The SvelteKit app lives under `web/`; within it, `web/src/lib/` SHALL be organized into two kinds of code: **horizontal shared layers** that carry no domain knowledge — `src/lib/components/` (reusable UI), `src/lib/server/` (server-only infrastructure, including the API client factory and the remaining auth/session code), and shared helpers (`src/lib/utils.ts`, `src/lib/assets/`) — and **vertical domain slices** under `src/lib/features/<feature>/` (presentation and types only; event-domain data access lives in the Go service). Routes under `src/routes/` SHALL compose features and shared components; routes SHALL remain thin. Backend domain logic (events, registrations, categories, dashboard, storage) SHALL live in the Go service under `api/`, not in `web/src/lib/server/`. The architecture SHALL be documented in a root `ARCHITECTURE.md` covering both apps.

#### Scenario: A contributor locates where new code belongs

- **WHEN** a contributor needs to add domain-specific logic for a new domain area
- **THEN** `ARCHITECTURE.md` directs them to implement data access and business rules in `api/` (contract-first via `proto/`), presentation in `web/src/lib/features/<feature>/`, and only domain-agnostic reusable UI under `web/src/lib/components/`

#### Scenario: A reader understands the layering from the doc

- **WHEN** a reader opens `ARCHITECTURE.md`
- **THEN** it describes the two-app split (`web/` BFF, `api/` Go service, `proto/` contract), the web app's horizontal layers and vertical feature slices, and a structural map of both apps

### Requirement: Dependencies flow in one direction across layers

The architecture SHALL enforce a one-directional dependency flow. Within `web/`: features MAY import from `src/lib/components/` and shared helpers; routes MAY import from features (via barrels) and from `src/lib/components/`; shared components SHALL NOT import from features; a feature SHALL NOT import from another feature; `src/lib/server/` SHALL be server-only and SHALL NOT be imported by client-side code. Across apps: `web/` reaches `api/` ONLY through the generated connect-es client behind `web/src/lib/server/api/`; `web/` SHALL NOT open direct database connections for event-domain data (the sole remaining direct DB access is the legacy auth/session queries, scheduled for removal when auth moves to Go); `api/` SHALL NOT depend on `web/`. These rules SHALL be documented in `ARCHITECTURE.md`.

#### Scenario: A shared component is kept domain-agnostic

- **WHEN** a developer is tempted to import a feature type or service into a `src/lib/components/` primitive
- **THEN** `ARCHITECTURE.md` identifies this as a forbidden reverse dependency, and the component is instead kept generic (the domain concern moves to a feature)

#### Scenario: Cross-feature coupling is avoided

- **WHEN** feature A needs behavior owned by feature B
- **THEN** the dependency is recognized as forbidden cross-feature coupling, resolved by promoting the shared concern rather than importing B into A

#### Scenario: Server-only code is not pulled into the client bundle

- **WHEN** client-side code attempts to import from `src/lib/server/`
- **THEN** the build identifies this as a boundary violation; server-only access happens in server load functions / endpoints

#### Scenario: Event-domain data bypassing the API is rejected

- **WHEN** a code change adds a direct SQL query for event-domain tables inside `web/`
- **THEN** review identifies it as a boundary violation — the access belongs in `api/` behind a `proto/` RPC

## ADDED Requirements

### Requirement: The SvelteKit app is a BFF in front of the private Go API

The browser SHALL only ever talk to the SvelteKit app; the Go API SHALL NOT be exposed to browsers in this architecture phase. SvelteKit load functions and form actions SHALL fetch event-domain data by calling the Go API server-to-server with the generated client, preserving SSR, SEO endpoints (sitemap, JSON-LD), and progressive-enhancement form behavior unchanged.

#### Scenario: A page load fetches through the BFF

- **WHEN** a visitor requests an event page
- **THEN** the SvelteKit server load calls the Go API over the internal network and server-renders the result — the browser makes no request to the Go service

#### Scenario: Form submissions keep working without JavaScript

- **WHEN** a user submits a booking form with JavaScript disabled
- **THEN** the SvelteKit form action processes it (calling the Go API internally) exactly as before the migration
