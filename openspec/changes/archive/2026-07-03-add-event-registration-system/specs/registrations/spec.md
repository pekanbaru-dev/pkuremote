## ADDED Requirements

### Requirement: `registrations` table stores user bookings with a unique short id and per-event attendee info

The Drizzle schema SHALL define a `registrations` table at `db/schema/registrations.ts` with the following columns: `id` (uuid, primary key, default `gen_random_uuid()`), `userId` (uuid, NOT NULL, foreign key to `profiles.id` with `ON DELETE CASCADE`), `eventId` (uuid, NOT NULL, foreign key to `events.id` with `ON DELETE CASCADE`), `registrationNumber` (text, NOT NULL, UNIQUE — a short human-readable id of the form `PKU-{year}-{nanoid(6)}`), `attendeeName` (text, NOT NULL — the name of the attendee as entered on the booking form for this event, separate from the user's profile name), `attendeePhone` (text, NOT NULL — the phone number of the attendee as entered on the booking form for this event), `status` (text, NOT NULL, default `'confirmed'`, CHECK constraint in `'confirmed' | 'cancelled' | 'attended' | 'no_show'`), `createdAt` (timestamptz, NOT NULL, default now()), `updatedAt` (timestamptz, NOT NULL, default now()). A unique constraint SHALL be enforced on `(userId, eventId)` so a user cannot register for the same event twice. The `db/schema/index.ts` barrel SHALL re-export the `registrations` table.

#### Scenario: A user registers for an event

- **WHEN** a user with a valid `profiles` row calls `bookEvent({ userId, eventId, attendeeName, attendeePhone })` for an event that is `upcoming` and has `remainingSlots > 0`
- **THEN** the function inserts a `registrations` row with a fresh `registrationNumber`, the entered `attendeeName` and `attendeePhone`, status `'confirmed'`, and the current timestamp; the `events.remainingSlots` is decremented by 1 in the same transaction; the function returns the new registration.

#### Scenario: A user cannot register for the same event twice

- **WHEN** a user calls `bookEvent({ userId, eventId, attendeeName, attendeePhone })` and a `registrations` row already exists with the same `(userId, eventId)`
- **THEN** the function throws a typed `ALREADY_REGISTERED` error and no row is inserted; `events.remainingSlots` is not decremented.

#### Scenario: A user enters a different name for a different event

- **WHEN** the same user registers for two different events, entering "John Doe" as `attendeeName` for the first and "Jane Doe" for the second
- **THEN** each `registrations` row stores its own `attendeeName`; the ticket for the first event shows "John Doe" and the ticket for the second shows "Jane Doe"; the rows are independent (the unique constraint is on `(userId, eventId)`, not on `attendeeName`).

#### Scenario: A duplicate `registrationNumber` is retried once

- **WHEN** the `nanoid(6)` generator produces a `registrationNumber` that collides with an existing row (the unique-constraint insert fails)
- **THEN** the function catches the unique-constraint violation, generates a fresh `registrationNumber`, and retries the insert once. A second collision throws a typed `REGISTRATION_NUMBER_COLLISION` error.

### Requirement: `bookEvent` is atomic — the quota check and the row insert happen in the same transaction

The `bookEvent` service function SHALL run inside a single Postgres transaction. The transaction SHALL `SELECT … FOR UPDATE` the `events` row to lock it (preventing concurrent bookings on the last slot), check `status = 'upcoming'` and `remainingSlots > 0`, check the `(userId, eventId)` uniqueness constraint, insert the `registrations` row, and decrement `events.remainingSlots` by 1. Any check failure rolls back the entire transaction (no insert, no decrement).

#### Scenario: Two concurrent bookings on the last slot

- **WHEN** two requests call `bookEvent({ userId: A, eventId })` and `bookEvent({ userId: B, eventId })` concurrently, and the event has `remainingSlots = 1`
- **THEN** exactly one of the two requests succeeds (returns the new registration); the other request throws a typed `EVENT_SOLD_OUT` error; `events.remainingSlots` is decremented exactly once (to 0).

#### Scenario: Booking a past event

- **WHEN** `bookEvent` is called for an event whose `status !== 'upcoming'` (i.e. `'live'` or `'past'`)
- **THEN** the function throws a typed `EVENT_PAST` error and no row is inserted; `events.remainingSlots` is not decremented.

#### Scenario: Booking a sold-out event

- **WHEN** `bookEvent` is called for an event whose `remainingSlots = 0`
- **THEN** the function throws a typed `EVENT_SOLD_OUT` error and no row is inserted; `events.remainingSlots` is not decremented (it's already 0).

#### Scenario: Booking after the registration deadline

- **WHEN** `bookEvent` is called for an event whose `registrationClosesAt` is in the past
- **THEN** the function throws a typed `REGISTRATION_CLOSED` error and no row is inserted.

### Requirement: The detail page CTA replaces the `mailto:` flow with a server-rendered form action that collects per-event attendee name and phone

The event detail page at `src/routes/events/[slug]/+page.svelte` SHALL render the `EventBookingCta` component with the `authenticated` prop set from the `data.user` value: when `data.user` is non-null, the CTA renders a `<form method="POST" action="?/book">` containing two text inputs (a required "Nama Peserta" input bound to the form field `attendeeName` and a required "No. HP" input bound to the form field `attendeePhone`) and a submit button labeled "Booking Sekarang"; when `data.user` is `null`, the CTA renders an `<a href="/login?redirect=/events/{event.slug}">` link labeled "Login dulu untuk booking". The `+page.server.ts` SHALL export an `actions.book` handler that calls `bookEvent({ userId, eventId, attendeeName, attendeePhone })` with the form data. On success, the handler returns a `redirect(303, /events/{slug}/ticket/{registrationNumber})`. On a typed error or validation failure, the handler returns a `fail(400, { code, errors? })`; the page re-renders with the error message above the CTA and the previously-entered `attendeeName` / `attendeePhone` values pre-filled in the form.

#### Scenario: An authenticated visitor books an event

- **WHEN** an authenticated visitor fills in "Andi" and "081234567890" in the booking form on `/events/{slug}` for an upcoming event with `remainingSlots > 0` and submits
- **THEN** the action creates a new registration with `attendeeName = "Andi"` and `attendeePhone = "081234567890"`, decrements `remainingSlots`, and redirects the browser to `/events/{slug}/ticket/{registrationNumber}` with a 303 status.

#### Scenario: An unauthenticated visitor sees the login link

- **WHEN** an unauthenticated visitor visits `/events/{slug}`
- **THEN** the CTA renders an `<a href="/login?redirect=/events/{slug}">` link instead of the booking form; clicking the link takes the visitor to `/login` with the detail page URL as the `?redirect=` target.

#### Scenario: A booking attempt with empty fields shows the validation errors

- **WHEN** an authenticated visitor submits the booking form on `/events/{slug}` with empty `attendeeName` or `attendeePhone` fields
- **THEN** the action returns `fail(400, { code: 'VALIDATION', errors: { attendeeName?: string, attendeePhone?: string } })`; the page re-renders with the per-field error messages ("Nama wajib diisi." / "No. HP wajib diisi.") below the corresponding inputs.

#### Scenario: A booking attempt on a sold-out event shows the error

- **WHEN** an authenticated visitor submits the booking form on `/events/{slug}` and the event has `remainingSlots = 0`
- **THEN** the action returns `fail(400, { code: 'EVENT_SOLD_OUT' })`; the page re-renders with the error message "Event ini sudah penuh — coba event lain." above the CTA; no registration is created.

### Requirement: The booking CTA renders the right disabled state for past / sold-out / closed events

The `EventBookingCta` component SHALL accept an `event` prop and a `mode` prop (existing). The CTA SHALL render a `disabled` button with the appropriate label when any of these conditions hold: `event.status !== 'upcoming'` (label: "Event telah berlalu"), `event.remainingSlots === 0` (label: "Kuota penuh"), `event.registrationClosesAt` is in the past (label: "Pendaftaran ditutup"). When the event is bookable, the CTA renders a submit button labeled "Booking Sekarang". The disabled state is rendered both on the desktop sticky panel and on the mobile floating action button.

#### Scenario: The CTA on a sold-out event

- **WHEN** a visitor views `/events/{slug}` for an event with `remainingSlots = 0`
- **THEN** both the desktop panel and the mobile FAB render a `disabled` button with the label "Kuota penuh"; clicking it does not submit the form.

#### Scenario: The CTA on a past event

- **WHEN** a visitor views `/events/{slug}` for an event with `status = 'past'`
- **THEN** both the desktop panel and the mobile FAB render a `disabled` button with the label "Event telah berlalu".

#### Scenario: The CTA when the registration deadline has passed

- **WHEN** a visitor views `/events/{slug}` for an event with `registrationClosesAt` in the past
- **THEN** both the desktop panel and the mobile FAB render a `disabled` button with the label "Pendaftaran ditutup".

### Requirement: `/myregistrations` page lists the logged-in user's bookings

The site SHALL expose a `/myregistrations` route (with co-located `+page.server.ts`) that lists the logged-in user's registrations. The route's `load()` SHALL call `getMyRegistrations(locals.user.id)` and return the result. The page SHALL render a vertical list of registrations; each row shows the event title (linked to `/events/{slug}`), the event's date/time, the event's location, a status badge for the event (`Akan Datang` / `Berlangsung` / `Selesai` / `Pendaftaran Ditutup`) and a status badge for the registration (`Dikonfirmasi` / `Dibatalkan` / `Hadir` / `Tidak Hadir`), the `registrationNumber`, and a "Lihat tiket" link to the ticket page. The list is sorted ascending by `events.startsAt`. When the user has no registrations, the page renders an `EmptyState` with the message "Anda belum memiliki registrasi event — lihat semua event di halaman arsip." and a link to `/events`.

#### Scenario: A logged-in user with bookings visits `/myregistrations`

- **WHEN** a logged-in user with 2 confirmed registrations visits `/myregistrations`
- **THEN** the page renders a list of 2 rows, each with the event title, date, location, status badges, registration number, and a "Lihat tiket" link to the corresponding ticket page.

#### Scenario: A logged-in user with no bookings visits `/myregistrations`

- **WHEN** a logged-in user with 0 registrations visits `/myregistrations`
- **THEN** the page renders the `EmptyState` with the message "Anda belum memiliki registrasi event — lihat semua event di halaman arsip." and a link to `/events`; no list rows are rendered.

#### Scenario: An unauthenticated visitor visits `/myregistrations`

- **WHEN** an unauthenticated visitor visits `/myregistrations`
- **THEN** the route's `load()` redirects the browser to `/login?redirect=/myregistrations` with a 303 status.

### Requirement: The ticket page renders the attendee's per-event name, event details, and a unique QR code

The site SHALL expose a nested route at `/events/[slug]/ticket/[number]` (with co-located `+page.server.ts`) that renders a single registration as a printable ticket. The page SHALL display the event's banner, the **attendee's per-event name** (from `registrations.attendeeName` — NOT the user's profile name, so the same user can attend different events under different names), the event's title, date/time, location, the attendee's phone number, and the `registrationNumber`. The page SHALL render a QR code as an inline SVG, generated from the payload returned by `qr.ts` (e.g. `pkubersua://registration/{registrationNumber}`). The page is server-rendered (no client JS required).

#### Scenario: A logged-in user views their own ticket

- **WHEN** a logged-in user visits `/events/{slug}/ticket/{number}` for a registration that belongs to them
- **THEN** the page renders the event banner, the per-event attendee name (from `attendeeName`), the attendee phone, the event title, date/time, location, the `registrationNumber`, and a scannable QR code as an SVG.

#### Scenario: A user views another user's ticket

- **WHEN** a logged-in user visits `/events/{slug}/ticket/{number}` for a registration that belongs to another user
- **THEN** the route returns a 404 status with the standard SvelteKit error page; the page does not render the ticket; the response does not leak the existence of the registration.

#### Scenario: A user views a ticket for a cancelled registration

- **WHEN** a logged-in user visits `/events/{slug}/ticket/{number}` for a registration whose `status = 'cancelled'`
- **THEN** the page renders a "Registrasi ini telah dibatalkan" message and no QR code; the registration number is still shown.

#### Scenario: An unauthenticated visitor visits a ticket URL

- **WHEN** an unauthenticated visitor visits `/events/{slug}/ticket/{number}`
- **THEN** the route's `load()` redirects the browser to `/login?redirect=/events/{slug}/ticket/{number}` with a 303 status.

### Requirement: `cancelRegistration` decrements-and-flips atomically

The `cancelRegistration(registrationNumber, userId)` service function SHALL run inside a single Postgres transaction. The transaction SHALL `SELECT … FOR UPDATE` the `registrations` row to lock it, verify the `userId` matches (else throw `NOT_FOUND`), verify the event is still `upcoming` (else throw `REGISTRATION_NOT_CANCELLABLE`), set the registration's `status` to `'cancelled'`, and increment `events.remainingSlots` by 1. Any check failure rolls back the entire transaction (no status change, no increment).

#### Scenario: A user cancels their own registration

- **WHEN** a user calls `cancelRegistration(registrationNumber, userId)` for a registration that belongs to them and the event is `upcoming`
- **THEN** the registration's `status` becomes `'cancelled'`; `events.remainingSlots` is incremented by 1; the function returns the updated registration.

#### Scenario: A user tries to cancel another user's registration

- **WHEN** a user calls `cancelRegistration(registrationNumber, userId)` and the registration belongs to another user
- **THEN** the function throws a typed `NOT_FOUND` error; no row is updated; `events.remainingSlots` is not changed.

#### Scenario: A user tries to cancel a past event's registration

- **WHEN** a user calls `cancelRegistration(registrationNumber, userId)` and the event's `status !== 'upcoming'`
- **THEN** the function throws a typed `REGISTRATION_NOT_CANCELLABLE` error; no row is updated; `events.remainingSlots` is not changed.

### Requirement: Registration service exports are server-only

The data-access service functions (`bookEvent`, `getMyRegistrations`, `getRegistrationByNumber`, `cancelRegistration`, plus the `buildRegistrationQrPayload` helper) SHALL be exported from a server-only barrel at `src/lib/server/registrations/index.ts`. The barrel SHALL live under `src/lib/server/` so SvelteKit's bundler excludes it from the client bundle. The `+page.server.ts` and `+server.ts` files SHALL import from this barrel; client-side components SHALL NOT import from it.

#### Scenario: A reviewer greps for direct service imports

- **WHEN** a reviewer greps `src/lib/features/`, `src/lib/components/`, and `src/routes/**/+page.svelte` for `from "$lib/server/registrations"`
- **THEN** no matches appear.

#### Scenario: A reviewer imports the public surface

- **WHEN** a `+page.server.ts` imports from `$lib/server/registrations`
- **THEN** TypeScript resolves the export from `db-registrations.ts` and the function is callable.
