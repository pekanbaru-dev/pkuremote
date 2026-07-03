## Why

The event detail page today opens a `mailto:` link when a visitor clicks "Booking Sekarang" — no registration, no quota management, no ticket. GitHub issues [#7](https://github.com/pekanbaru-dev/pkuremote/issues/7) (Book Event), [#8](https://github.com/pekanbaru-dev/pkuremote/issues/8) (View My Registrations), and [#9](https://github.com/pekanbaru-dev/pkuremote/issues/9) (View Registration Ticket) describe the real flow: an authenticated user books an event (server creates a registration, decrements quota, returns a registration number), sees their bookings on a "Registrasi Saya" page, and views a single ticket with a QR code that only they can access. The change introduces a `registrations` table, a real booking action, a my-registrations listing, and a per-registration ticket page — and replaces the mailto: CTA on the detail page with the real flow.

## What Changes

### Schema (Drizzle, in `db/schema/`)

- **Add a `registrations` table** (`db/schema/registrations.ts`): `id` (uuid, PK, default `gen_random_uuid()`), `userId` (uuid, NOT NULL, FK to `profiles.id` ON DELETE CASCADE), `eventId` (uuid, NOT NULL, FK to `events.id` ON DELETE CASCADE), `registrationNumber` (text, NOT NULL, UNIQUE — short human-readable like `PKU-2026-0001`), `status` (text, NOT NULL, default `'confirmed'`, CHECK constraint in `'confirmed' | 'cancelled' | 'attended' | 'no_show'`), `createdAt` (timestamptz, default now()), `updatedAt` (timestamptz, default now()). Unique constraint on `(userId, eventId)` to prevent duplicate registrations for the same event.
- **Add a new migration** under `db/migrations/` capturing the new table + the unique constraint.

### Service layer (`src/lib/server/registrations/`)

- **New `db-registrations.ts`** with Drizzle queries (server-only, mirrors the events pattern at `$lib/server/events/`):
  - `bookEvent({ userId, eventId })` — transactional: checks event is upcoming and `remainingSlots > 0`, checks user has no existing registration, inserts a new row with a generated `registrationNumber` (`PKU-${year}-${nanoid(6)}` — unique per row), decrements `events.remainingSlots` by 1 in the same transaction. Returns the new registration or throws a typed error (`EVENT_NOT_FOUND`, `EVENT_PAST`, `EVENT_SOLD_OUT`, `ALREADY_REGISTERED`, `NOT_AUTHENTICATED`).
  - `getMyRegistrations(userId)` — returns the user's registrations with the event joined, sorted by `events.startsAt` ascending. Each item carries the event shape (title, slug, startsAt, location) and the registration's `status`, `registrationNumber`, `createdAt`.
  - `getRegistrationByNumber(registrationNumber, userId)` — returns a single registration (joined to event) only when the requesting user matches the registration's `userId`. Returns `undefined` otherwise (used by the ticket page to enforce "owner only").
  - `cancelRegistration(registrationNumber, userId)` — marks the registration as `cancelled` and increments `events.remainingSlots` by 1 in the same transaction. (Cancellable only when the event is still `upcoming`.)
- **New `qr.ts`** with a `buildRegistrationQrPayload(registration)` helper that returns a string payload for the QR code (e.g. `pkubersua://registration/{registrationNumber}` — verifiable at the door via a future check-in flow; the verifier is out of scope for this change).
- **New server barrel** at `src/lib/server/registrations/index.ts` re-exporting the four functions.

### Detail page CTA (`src/routes/events/[slug]/+page.svelte` + `+page.server.ts`)

- **Replace the `mailto:` flow** with a server-rendered form action. The "Booking Sekarang" `<Button>` becomes a `<form method="POST" action="?/book">` button that POSTs to the route's `actions.book` handler. The handler calls `bookEvent(...)` server-side, then redirects to `/events/{slug}/ticket/{registrationNumber}` (the new ticket page) on success. On the four error cases, the route re-renders the detail page with a flash message via a `?error=...` query param.
- **Auth gate:** when `locals.user` is `null`, the booking button is rendered as a quiet `<a href="/login?redirect=/events/{slug}">Login dulu untuk booking</a>` link instead of the form button. The detail page's existing `eventBookingCta.svelte` is updated to take an `authenticated` prop (boolean) and render either the form (authenticated) or the login link (not).
- **Status-aware disabled states** (per issue #7): the button renders as `disabled` with the right label when `event.status !== 'upcoming'`, when `event.remainingSlots === 0` (label: "Kuota penuh"), or when the event's `registrationClosesAt` (new optional column, see below) is in the past (label: "Pendaftaran ditutup"). All three are derived server-side in the `+page.server.ts` `load()`.
- **New optional column on `events`:** `registrationClosesAt` (timestamptz, NULL) — when set, bookings are rejected after this time. Default `null` (no registration deadline).

### My Registrations page (`src/routes/myregistrations/`)

- **New route** at `src/routes/myregistrations/+page.svelte` (co-located `+page.server.ts`): lists the logged-in user's registrations, sorted by `events.startsAt` ascending. Each row shows: event title (link to `/events/{slug}`), date/time, location, status badge (`Akan Datang` / `Berlangsung` / `Selesai` / `Pendaftaran Ditutup` for the event; `Dikonfirmasi` / `Dibatalkan` / `Hadir` / `Tidak Hadir` for the registration), registration number, and a "Lihat tiket" link to the ticket page.
- **Auth gate:** when `locals.user` is `null`, redirect to `/login?redirect=/myregistrations`.
- **Empty state:** the page renders a `EmptyState` with the message "Anda belum memiliki registrasi event — lihat semua event di halaman arsip." and a link to `/events`. The `EmptyState` is the same primitive from `$lib/components/ui/empty-state`.

### Ticket page (`src/routes/events/[slug]/ticket/[number]/`)

- **New nested route** at `src/routes/events/[slug]/ticket/[number]/+page.svelte` (co-located `+page.server.ts`): shows the event's banner, the participant's name (from `profiles.displayName`), the event's title, date/time, location, and the registration number. A QR code (rendered as an SVG) is generated from the payload returned by `qr.ts`. The page is server-rendered (no client JS) so the QR is in the initial HTML.
- **Auth + ownership gate:** when `locals.user` is `null`, redirect to `/login?redirect=/events/{slug}/ticket/{number}`. When the user is authenticated but the registration's `userId` doesn't match, the route returns a 404 (not 403 — to avoid leaking that the registration exists for another user). When the registration is `cancelled`, the page renders a "Registrasi ini telah dibatalkan" message and no QR.

### Feature layer (in `src/lib/features/events/`)

- **Update `EventCard`'s CTA awareness:** not needed (the CTA is on the detail page, not the card).
- **Update `EventBookingCta`** to accept an `authenticated` prop and render the form or login link accordingly. No public-API change to other consumers.

### Tests

- **New `src/lib/server/registrations/db-registrations.test.ts`** (server project): 4 tests using a sqlite-in-memory or pg-mem fixture (or by mocking the Drizzle client) — `bookEvent` happy path, `bookEvent` rejects a sold-out event, `getMyRegistrations` returns the right shape, `getRegistrationByNumber` returns `undefined` for a non-owner.
- **New `src/lib/features/events/components/event-booking-cta.svelte.spec.ts`** (client project): two tests — the form is rendered when `authenticated === true`, the login link is rendered when `authenticated === false`.
- **New e2e test** at `e2e/registration.e2e.ts`: full round-trip — sign in (via the test OAuth or the dev login bypass), navigate to an event, click "Booking Sekarang", land on the ticket page, see the QR code, navigate to `/myregistrations`, see the booking, click "Lihat tiket", land back on the same ticket page. Tests skip cleanly if not authenticated.

### Verification

- `pnpm check`, `pnpm lint`, `pnpm test:unit -- --run`, `pnpm test:e2e`, `pnpm build`. Manual: book a real event in a browser, view the ticket (QR code visible + scannable), check the user's myregistrations page, attempt to view another user's ticket (404).
- The booking action's atomicity (decrement quota + insert registration in the same transaction) is the most important test — the unit test must cover the "two concurrent bookings on the last slot" case.

## Capabilities

### New Capabilities

- `registrations`: The booking & registration system — `registrations` DB table, `bookEvent` / `getMyRegistrations` / `getRegistrationByNumber` / `cancelRegistration` service functions, the `Booking Sekarang` form action on the event detail page, the `/myregistrations` listing page, the `/events/[slug]/ticket/[number]` ticket page with a QR code, and the per-user ownership / authentication gates. Closes GitHub issues #7, #8, #9.

### Modified Capabilities

- `events`: The event detail page's `Booking Sekarang` CTA changes from a `mailto:` link to a server-rendered form action that calls the registration system. The `Event` type gains an optional `registrationClosesAt?: string` field. The `EventBookingCta` component gains an `authenticated: boolean` prop. (No existing requirements are removed or relaxed.)
- `drizzle-integration`: Adds the `registrations` table and the `events.registrationClosesAt` column. The schema export and the migration history both update.

## Impact

- **Schema (new + modified):**
  - `db/schema/registrations.ts` — new file.
  - `db/schema/events.ts` — add `registrationClosesAt` (timestamptz, NULL).
  - `db/schema/index.ts` — re-export `registrations`.
  - `db/migrations/0003_*.sql` — new file (generated by `pnpm db:generate`).
- **Seed (`db/seed.ts`):** optionally insert one test registration per seed event for the seed user so the myregistrations page has data in dev. Idempotent.
- **Service (new):**
  - `src/lib/server/registrations/db-registrations.ts` — new file.
  - `src/lib/server/registrations/qr.ts` — new file.
  - `src/lib/server/registrations/index.ts` — new barrel.
- **Components (modified):**
  - `src/lib/features/events/components/event-booking-cta.svelte` — add `authenticated` prop; render form or login link.
- **Routes (new + modified):**
  - `src/routes/events/[slug]/+page.server.ts` — add `actions.book` form action; gate on `locals.user`; pass `authenticated` and `error` to the page.
  - `src/routes/events/[slug]/+page.svelte` — read `data.authenticated` and `data.bookingError`; pass to the CTA.
  - `src/routes/myregistrations/+page.server.ts` — new.
  - `src/routes/myregistrations/+page.svelte` — new.
  - `src/routes/events/[slug]/ticket/[number]/+page.server.ts` — new.
  - `src/routes/events/[slug]/ticket/[number]/+page.svelte` — new.
- **Existing features (unmodified):** homepage, listing page, detail page hero / price block / quota meter, sitemap, auth flow.
- **Tests (new):** see the "Tests" section above. 4 new files.
- **Spec:**
  - `openspec/changes/add-event-registration-system/specs/registrations/spec.md` — new capability spec.
  - `openspec/changes/add-event-registration-system/specs/events/spec.md` — delta for the CTA + `registrationClosesAt` field.
  - `openspec/changes/add-event-registration-system/specs/drizzle-integration/spec.md` — delta for the new table + column.
- **Public surface:** three new routes (`/myregistrations`, `/events/{slug}/ticket/{number}` — the booking form posts to the existing `/events/{slug}` URL). New auth-gated surfaces.
- **Dependencies:** `nanoid` (or a similar short-id library) for the registration number. `qrcode` (or `qrcode-svg`) for the QR code generation. Both are small, well-maintained packages. (Alternative: a hand-rolled short-id helper + a pre-rendered SVG QR library like `qr-image` — also acceptable.)
- **No new env vars.**
- **Out of repo:** the QR code's verifier (the check-in scanner) is a future change. This change ships the QR code's SVG rendering on the ticket page only.
- **Closes:** GitHub issues #7, #8, #9.
