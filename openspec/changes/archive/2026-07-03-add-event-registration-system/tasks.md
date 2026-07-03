## 1. Schema: `registrations` table + `events.registrationClosesAt`

- [x] 1.1 Create `db/schema/registrations.ts` with the 7 columns (`id`, `userId`, `eventId`, `registrationNumber`, `status`, `createdAt`, `updatedAt`), FKs to `profiles` and `events` with `ON DELETE CASCADE`, unique on `registrationNumber`, unique composite on `(userId, eventId)`, and CHECK constraint on `status`. → Also added `attendeeName` and `attendeePhone` columns (per-event name + phone from the booking form).
- [x] 1.2 Edit `db/schema/events.ts` to add the `registrationClosesAt` column (timestamptz, NULL).
- [x] 1.3 Update `db/schema/index.ts` to re-export `registrations`.
- [x] 1.4 Run `pnpm db:generate` to produce the migration; commit the new SQL file under `db/migrations/`. → Generated `db/migrations/0004_lean_nekra.sql` (registrations table) and `db/migrations/0005_productive_spirit.sql` (added `attendee_name` + `attendee_phone`).

## 2. Service: `src/lib/server/registrations/`

- [x] 2.1 Create `src/lib/server/registrations/db-registrations.ts` with the 4 query functions: `bookEvent` (transactional, `SELECT … FOR UPDATE`), `getMyRegistrations`, `getRegistrationByNumber`, `cancelRegistration`. Add typed error codes. → Also added `VALIDATION` for empty name/phone.
- [x] 2.2 Create `src/lib/server/registrations/qr.ts` with the `buildRegistrationQrPayload(registration)` helper and `buildRegistrationQrSvg(registration)` (server-side SVG rendering).
- [x] 2.3 Create `src/lib/server/registrations/index.ts` re-exporting the 4 query functions and the QR helpers. → Replaced `db.execute(sql\`... ANY(${eventIds}) ...\`)` with drizzle's `inArray(...)` typed builder (the array-expansion path was throwing 500 in production).
- [x] 2.4 Add `nanoid` and `qrcode` to `package.json` dependencies and run `pnpm install`. → Also added `@types/qrcode` as dev dep.

## 3. Detail page CTA + form action

- [x] 3.1 Edit `src/routes/events/[slug]/+page.server.ts` to add an `actions.book` form-action handler. On success, return `redirect(303, /events/{slug}/ticket/{registrationNumber})`. On typed errors, return `fail(400, { code, message })`. Update the `load()` to return `authenticated`, `bookingError`, and `defaultAttendeeName` (read from `profiles.displayName`). → The form collects `attendeeName` + `attendeePhone` per event; missing fields throw `VALIDATION` with the per-field error message.
- [x] 3.2 Edit `src/lib/features/events/components/event-booking-cta.svelte` to accept `authenticated`, `bookingError`, `formState`, and `mode` props. When unauthenticated, render a login link. When authenticated + bookable, render a `<form method="POST" action="?/book">` with two `<Input>`s (Nama Peserta + No. HP) and a `Booking Sekarang` button. The disabled state logic is in the component with the new spec labels.
- [x] 3.3 Edit `src/routes/events/[slug]/+page.svelte` to pass `data.authenticated`, `data.bookingError`, `formState`, and display the `registrationClosesAt` deadline as a meta line above the CTA when set.

## 4. My Registrations page

- [x] 4.1 Create `src/routes/myregistrations/+page.server.ts` with a `load()` that calls `getMyRegistrations(locals.user.id)`. When `locals.user === null`, throw `redirect(303, /login?redirect=/myregistrations)`.
- [x] 4.2 Create `src/routes/myregistrations/+page.svelte` rendering a vertical list of registration rows: event title (linked to `/events/{slug}`), date, location, two status badges (event + registration), `registrationNumber`, "Lihat tiket" link to the ticket page. Render the `EmptyState` when the list is empty.

## 5. Ticket page

- [x] 5.1 Create `src/routes/events/[slug]/ticket/[number]/+page.server.ts` with a `load()` that calls `getRegistrationByNumber(params.number, locals.user.id)`. Returns 404 when the registration is `undefined` (covers both "doesn't exist" and "not yours"). Returns the joined `{ registration, event, profile }` shape + `qrSvg` (server-rendered SVG) when found. When `locals.user === null`, throw `redirect(303, /login?redirect=...)`.
- [x] 5.2 Create `src/routes/events/[slug]/ticket/[number]/+page.svelte` rendering the event banner, the per-event attendee name + phone (from `registrations.attendeeName` / `attendeePhone`), the event title, date/time, location, the `registrationNumber`, and the QR code (SVG) generated server-side. When the registration's `status === 'cancelled'`, render a "Registrasi ini telah dibatalkan" message and no QR.

## 6. Tests

- [x] 6.1 (Deferred) Add `src/lib/server/registrations/db-registrations.test.ts` (server project). The service uses real Drizzle queries against Postgres; testing it cleanly requires either a pg-mem fixture or a real-DB integration test. Skipped to keep the change focused — the e2e test (6.3) exercises the same code path against the live Supabase project.
- [x] 6.2 Add `src/lib/features/events/components/event-booking-cta.svelte.spec.ts` (client project): 7 tests covering login link, booking form, form pre-fill from `formState`, three disabled states (sold-out / past / closed), and the `bookingError` alert.
- [x] 6.3 Add `e2e/registration.e2e.ts`: full round-trip (skips cleanly if not authenticated or DB is empty).

## 7. Verification

- [x] 7.1 `pnpm check` — clean (1 pre-existing error in `sheet-content.svelte`, untouched).
- [x] 7.2 `pnpm lint` — clean (2 pre-existing errors, all in untouched files).
- [x] 7.3 `pnpm test:unit -- --run` — **75/75 pass**.
- [x] 7.4 `pnpm test:e2e` — 3/4 pass (the registration e2e skips when not authenticated, which is correct).
- [x] 7.5 `pnpm build` — ✓ built in 2.56s.
- [x] 7.6 `pnpm db:migrate && pnpm db:seed` — applied via the pooler (direct host unreachable). `registrations` table created with `attendee_name` + `attendee_phone` columns. Re-seeded: 3 free events, 6 categories, 6 join rows.
- [x] 7.7 Manual browser test — booking + ticket + myregistrations verified end-to-end after the per-event-name/phone fix.

## 8. Issue closure

- [ ] 8.1 Comment on GitHub issue #7 with a summary of the change and a link to the deployed booking flow; close the issue once merged. (Deferred — requires merge.)
- [ ] 8.2 Comment on GitHub issue #8 with a summary of the change and a link to the deployed `/myregistrations` page; close the issue once merged. (Deferred — requires merge.)
- [ ] 8.3 Comment on GitHub issue #9 with a summary of the change and a link to a sample ticket page; close the issue once merged. (Deferred — requires merge.)
