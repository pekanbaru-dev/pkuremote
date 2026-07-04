# admin-dashboard Specification

## Purpose

TBD - created by archiving change admin-dashboard. Update Purpose after archive.

## Requirements

### Requirement: `/admin` renders the admin dashboard

The system SHALL render an admin dashboard at `/admin` (replacing the placeholder page), inside the admin shell and behind the `/admin` gate. The dashboard SHALL present, at minimum: total events, upcoming events count, total active registrations, and overall capacity fill. The route's `load` SHALL obtain these from a server-only metrics service.

#### Scenario: An admin opens the dashboard

- **WHEN** an administrator navigates to `/admin`
- **THEN** the dashboard renders inside the admin shell with the metric stat tiles populated from the metrics service

#### Scenario: A non-admin cannot reach the dashboard

- **WHEN** a non-administrator (authenticated or not) navigates to `/admin`
- **THEN** they are redirected by the existing gate (to `/login` when unauthenticated, to `/` when authenticated-but-not-admin) and the dashboard does not render

### Requirement: Dashboard metrics are computed by a server-only aggregate service

The system SHALL expose a server-only `getDashboardMetrics()` under `src/lib/server/` that computes its figures with aggregate SQL (COUNT/SUM) rather than loading all rows into memory. It SHALL return: total events, upcoming events count, total active registrations (status `confirmed` or `attended`), overall capacity fill, and two short lists — recent registrations and next upcoming events. The service SHALL NOT be importable from client code.

#### Scenario: Metrics come from aggregate queries

- **WHEN** `getDashboardMetrics()` runs
- **THEN** it issues COUNT/SUM aggregate queries and small `LIMIT`ed list queries, and does not fetch every event/registration row into the application

#### Scenario: The service is server-only

- **WHEN** `pnpm build` runs
- **THEN** the dashboard metrics service does not appear in the client-side build output

### Requirement: Capacity fill is booked over quota across quota-bearing events

Overall capacity fill SHALL be computed as `Σ(quota − remainingSlots) ÷ Σ(quota)` over events where `quota` is not null. When `Σ(quota)` is zero (no quota-bearing events), the dashboard SHALL display a neutral placeholder (e.g. "—" or 0%) rather than dividing by zero.

#### Scenario: Fill is computed across quota-bearing events

- **WHEN** the database has events with quotas totaling 100 slots and 40 booked across them
- **THEN** the dashboard shows a capacity fill of 40%

#### Scenario: No quota-bearing events

- **WHEN** no event has a quota set
- **THEN** the capacity fill tile shows a neutral placeholder and no division-by-zero error occurs

### Requirement: The dashboard shows recent registrations and upcoming events

The dashboard SHALL render a short list of the most recent registrations (attendee name, event title, registration date) and a short list of the next upcoming events (title, date), each linking into the relevant admin area. Both lists SHALL render a friendly empty state when there is no data.

#### Scenario: Recent activity is shown

- **WHEN** there are recent registrations and upcoming events
- **THEN** the dashboard shows a recent-registrations list and an upcoming-events list, each item linking into the relevant admin screen

#### Scenario: Empty activity

- **WHEN** there are no registrations and no upcoming events
- **THEN** each list renders a friendly empty state instead of an empty container
