# admin-event-attendees Specification

## Purpose

TBD - created by archiving change admin-event-attendees. Update Purpose after archive.

## Requirements

### Requirement: An admin can view an event's attendees

The system SHALL provide `/admin/events/[id]/attendees` rendering all registrations for the event — per row: attendee name, phone, status, registration number, and registration date — together with summary counts (confirmed, attended, no_show, cancelled, total). Active registrations (`confirmed`, `attended`, `no_show`) SHALL be ordered before `cancelled`, then by registration date. The list SHALL be reachable from a per-row "Attendees" link on `/admin/events`. The route SHALL be admin-gated (inherits the `/admin` gate) and render inside the admin shell.

#### Scenario: An admin opens the attendee list

- **WHEN** an administrator opens `/admin/events/[id]/attendees` for an event with registrations
- **THEN** the page renders a table of its registrations with name, phone, status, registration number, and date, plus the summary counts

#### Scenario: The event has no registrations

- **WHEN** an administrator opens the attendees view for an event with no registrations
- **THEN** the page renders a friendly empty state instead of an empty table

#### Scenario: Cancelled registrations remain visible but out of the way

- **WHEN** an event has both active and cancelled registrations
- **THEN** active rows are shown first and cancelled rows are visible but de-emphasized, with a control to hide/show the cancelled rows

### Requirement: An admin can check attendees in

The system SHALL let an administrator change a registration's status among `confirmed`, `attended`, and `no_show` from the attendee list, via an admin-gated action calling the server-only `setRegistrationStatus`. The action SHALL NOT modify the event's `remaining_slots`. A request to set a status outside that set, or to change a registration that is `cancelled`, SHALL return a typed failure and make no change.

#### Scenario: Mark a confirmed attendee as attended

- **WHEN** an administrator marks a `confirmed` registration as `attended`
- **THEN** the registration's status becomes `attended`, `remaining_slots` is unchanged, and the row reflects the new status

#### Scenario: Undo a check-in

- **WHEN** an administrator changes an `attended` registration back to `confirmed`
- **THEN** the status becomes `confirmed` and `remaining_slots` is unchanged

#### Scenario: Cancelled registrations cannot be checked in

- **WHEN** an administrator attempts to set a `cancelled` registration to `attended`
- **THEN** the action returns a typed `INVALID_TRANSITION` failure and the registration is unchanged

### Requirement: An admin can export the attendee list as CSV

The system SHALL provide an admin-gated endpoint that returns the event's attendee list as a CSV download (`text/csv` with a `Content-Disposition: attachment` filename derived from the event). Each field SHALL be CSV-escaped so names or phones containing commas or quotes do not corrupt the file.

#### Scenario: An admin downloads the attendee CSV

- **WHEN** an administrator requests the attendees export for an event
- **THEN** the response is a `text/csv` attachment containing a header row and one row per registration, with fields safely quoted/escaped

### Requirement: Attendee read/write services are server-only and admin-gated

`getEventRegistrations` and `setRegistrationStatus` SHALL live under `src/lib/server/` and be invoked only from `+page.server.ts` / `+server.ts` handlers that call `requireAdmin(locals)` first. They SHALL NOT be importable from client code.

#### Scenario: A reviewer greps for client imports of the attendee services

- **WHEN** a reviewer greps `src/lib/features/`, `src/lib/components/`, and `**/+page.svelte` for imports of `getEventRegistrations` / `setRegistrationStatus`
- **THEN** no matches appear — they are imported only by server files
