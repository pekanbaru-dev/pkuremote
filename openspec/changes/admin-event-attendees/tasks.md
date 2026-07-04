## 1. Server services

- [x] 1.1 Add `getEventRegistrations(eventId)` to `src/lib/server/registrations/`: `eventId`-scoped query returning attendee name, phone, status, registration number, createdAt; ordered active (confirmed/attended/no_show) before cancelled, then by createdAt. Include a `counts` tally (confirmed/attended/no_show/cancelled/total).
- [x] 1.2 Add `setRegistrationStatus(id, status)`: allow only `confirmed`/`attended`/`no_show`, only when the current status is one of those three; update `status` + `updatedAt`; never touch `remaining_slots`; typed `RegistrationError("INVALID_TRANSITION")` / `NOT_FOUND` otherwise.
- [x] 1.3 Export both from the registrations barrel; add `INVALID_TRANSITION` to `RegistrationErrorCode` + a friendly message.
- [x] 1.4 Unit-test the transition guard (allowed set, cancelled rejected, unknown status rejected) and the count tally — pure helpers extracted where needed.

## 2. Attendees route

- [x] 2.1 `src/routes/admin/events/[id]/attendees/+page.server.ts` `load`: `requireAdmin`, 404 if the event is missing, return the event + registrations + counts.
- [x] 2.2 `+page.svelte`: shadcn `table` of registrations with status `badge`; summary counts; active-first ordering; a toggle to hide/show cancelled rows; empty state when none.
- [x] 2.3 Check-in controls per row (mark attended / no_show / undo to confirmed) wired to admin-gated actions in `+page.server.ts` (each re-asserts `requireAdmin`), refreshing the row on success.
- [x] 2.4 Surface `INVALID_TRANSITION` / `NOT_FOUND` failures with a message.

## 3. CSV export

- [x] 3.1 `src/routes/admin/events/[id]/attendees/export/+server.ts` `GET`: `requireAdmin`, fetch the same rows, stream `text/csv` with `Content-Disposition: attachment; filename="<event-slug>-attendees.csv"`; CSV-escape every field.
- [x] 3.2 Add a "Download CSV" link on the attendees page pointing at the export endpoint.

## 4. Wiring

- [x] 4.1 Add an "Attendees" link per row on `src/routes/admin/events/+page.svelte` → `/admin/events/[id]/attendees`.

## 5. Verify

- [x] 5.1 Attendees list shows the event's registrations with correct counts; active-first; empty state when none.
- [x] 5.2 Check-in: confirmed → attended → confirmed round-trips; `remaining_slots` unchanged in all cases; cancelled cannot be checked in (typed error).
- [x] 5.3 CSV downloads with a header + one row per registration; fields with commas/quotes stay intact.
- [x] 5.4 Grep confirms the attendee services are imported only by server files; absent from the client bundle.
- [x] 5.5 `pnpm check` → `pnpm lint` → `pnpm test` → `pnpm build`.
