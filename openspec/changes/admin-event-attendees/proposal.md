## Why

The admin panel can create, edit, and delete events, but there is no way to see **who registered** for an event or to check attendees in at the door. Viewing and managing registrations was an explicit non-goal of `admin-event-management` ("No registration management/check-in here — separate change"). This change fills that gap.

## What Changes

- **Attendees view** at `/admin/events/[id]/attendees`: a table of the event's registrations — attendee name, phone, status, registration number, and date — with summary counts (confirmed, attended, cancelled, total).
- **Check-in**: mark a registration `attended` or `no_show` at the door (and undo back to `confirmed`) via admin-gated actions.
- **CSV export**: download the attendee list as a CSV file for offline use / printing.
- **Active shown prominently, all visible**: confirmed/attended surface first; cancelled/no_show remain visible (a filter toggles the cancelled rows) so the picture is honest without hiding data.
- **Server-only reads/writes** added to the registrations service, invoked only from admin-gated `+page.server.ts` / `+server.ts`.
- An **"Attendees" link per row** on `/admin/events` into the new view.

## Capabilities

### New Capabilities

- `admin-event-attendees`: The per-event attendee list, door check-in (status transitions among confirmed/attended/no_show), CSV export, and the server-only registration read/update services behind them.

### Modified Capabilities

<!-- None at spec level. The public booking flow and the `registrations` table are unchanged; this adds admin read + status-update paths. -->

## Impact

- **New routes**: `src/routes/admin/events/[id]/attendees/+page.svelte` + `+page.server.ts` (load + check-in actions), and `src/routes/admin/events/[id]/attendees/export/+server.ts` (CSV).
- **Extended server code**: `src/lib/server/registrations/` gains `getEventRegistrations(eventId)` and `setRegistrationStatus(id, status)` with typed errors.
- **Modified**: `src/routes/admin/events/+page.svelte` gains an "Attendees" link per row.
- **Reuses**: the existing `registrations` table, `Registration` type, and the shadcn `table` / `badge` components. **No schema change.**
- **Depends on**: `add-admin-access-gate` (`requireAdmin`), `admin-shell` (chrome), `admin-components` (table), `admin-event-management` (the event list this links from).
- **Slots invariant**: check-in transitions among `confirmed`/`attended`/`no_show` do NOT change `remaining_slots` (only `confirmed`↔`cancelled`, handled by the booking/cancel flow, move slots). This change never touches `remaining_slots`.
