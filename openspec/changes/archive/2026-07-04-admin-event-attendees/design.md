## Context

The `registrations` table carries `attendeeName`, `attendeePhone`, `status` (`confirmed` | `cancelled` | `attended` | `no_show`, CHECK-constrained), `registrationNumber`, `createdAt`, `userId`, `eventId`, with an index on `eventId`. The registrations service already exposes `bookEvent`, `getMyRegistrations`, `getRegistrationByNumber`, `cancelRegistration`, and the `RegistrationError` / `getRegistrationErrorMessage` pair. `remaining_slots` bookkeeping is owned by the booking (`-1`) and cancel (`+1`) flows.

## Goals / Non-Goals

**Goals**

- Per-event attendee list for admins, read via an efficient `eventId`-scoped query.
- Door check-in: flip a registration among `confirmed` / `attended` / `no_show`.
- CSV export of the list.

**Non-Goals**

- No editing attendee details, no manual add/remove of registrations (booking/cancel stay in the public flow).
- No cancelling from here (cancellation moves slots and is the attendee's action).
- No schema change, no new columns.

## Decisions

### Read via an `eventId`-scoped query, counts derived in one pass

`getEventRegistrations(eventId)` selects the event's registrations ordered by status priority (active first) then `createdAt`. Counts (confirmed / attended / no_show / cancelled / total) are derived from the returned rows — attendee volumes per event are modest, so a single scoped query + in-memory tally is simpler than extra aggregate round-trips and keeps the list and counts consistent.

- **Alternatives considered**: separate `COUNT(*) GROUP BY status` query — rejected as unnecessary at this scale and a consistency risk against the listed rows.

### Check-in is a constrained status transition that never touches `remaining_slots`

`setRegistrationStatus(id, status)` allows `status ∈ { confirmed, attended, no_show }` only, and only on registrations currently in one of those three states. It updates `status` (+ `updatedAt`) and nothing else.

- **Why**: `attended` / `no_show` are terminal outcomes of a booked seat — the seat was already consumed at booking time, so marking attendance must not change `remaining_slots`. `cancelled` is excluded because cancellation is the attendee's slot-returning action, owned by `cancelRegistration`; re-activating a cancelled registration here would silently desync slot counts. Attempting to set/leave `cancelled` returns a typed `INVALID_TRANSITION` error.
- **Alternatives considered**: letting admins toggle any status incl. `cancelled` — rejected: breaks the slots invariant.

### CSV export is a dedicated admin-gated GET endpoint

`/admin/events/[id]/attendees/export` (`+server.ts` `GET`) re-runs `requireAdmin`, fetches the same rows, and streams `text/csv` with a `Content-Disposition: attachment; filename="<event-slug>-attendees.csv"`. Fields are CSV-escaped (quotes doubled, values quoted).

- **Why**: a GET endpoint yields a normal browser download without JS, keeps the serialization off the page, and reuses the same server read.

### Active-first ordering, cancelled visible but filterable

The list shows all statuses; rows are ordered active (`confirmed`, `attended`, `no_show`) before `cancelled`, then by `createdAt`. A client-side toggle hides/shows cancelled rows. Status renders as a `badge` with an intent per state.

- **Why**: matches the chosen "active by default, all visible" — organizers see who's coming first without losing the cancellation record.

## Risks / Trade-offs

- **Large events** could render a long table. → Acceptable at current scale; pagination is a future add if needed. The scoped query is indexed on `eventId`.
- **Concurrent check-ins** by two admins → last-write-wins on `status`; harmless (idempotent target states).
- **CSV injection** (formula-prefixed cells) → low risk (names/phones), but values are quoted; a future hardening could prefix `=+-@` cells with `'`.

## Open Questions

- Should `no_show` be auto-derived after the event ends instead of manual? Out of scope; manual check-in is the MVP.
