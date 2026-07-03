## Context

The PKUBersua site surfaces real-world events with banner, date, location, price, and quota — but the booking flow is a `mailto:` link, not a real registration. The events table has `quota` and `remainingSlots` columns (added by the `add-clickable-categories` change); the auth flow (Google OAuth via Supabase) is in place; the `profiles` table is set up. The missing piece is a `registrations` table, a booking action that decrements quota in the same transaction as the row insert, a my-registrations listing, and a per-registration ticket with a QR code.

GitHub issues #7, #8, #9 collectively describe the full flow:

- **#7 Book Event** — login-gated, upcoming-only, quota-checked, returns a registration number, surfaces a success message, emails the user (optional).
- **#8 View My Registrations** — list of the user's bookings with status.
- **9 View Registration Ticket** — ticket with QR code, owner-only access.

The current detail page renders an `EventBookingCta` component with a `mailto:` `href`. The change replaces that CTA with a server-rendered form action that creates a registration, then redirects to a ticket page. The myregistrations page and the ticket page are new routes.

The implementation is server-rendered throughout — no client-side state machine for the booking. The form action returns a redirect (success) or re-renders the page with an error (failure), which is the SvelteKit-native pattern.

## Goals / Non-Goals

**Goals:**

- Add a `registrations` table with a unique `(userId, eventId)` constraint and a `registrationNumber` short-id.
- Add a `bookEvent` service function that runs as a single Postgres transaction: validate (event exists, is upcoming, has slots, user is authenticated, user has no existing registration) → insert registration → decrement `events.remainingSlots` → return the new registration. Any failure rolls back.
- Add `getMyRegistrations`, `getRegistrationByNumber`, and `cancelRegistration` service functions.
- Replace the `mailto:` CTA on the detail page with a server-rendered form action that calls `bookEvent`. On success, redirect to the ticket page. On failure, re-render the detail page with the right error message.
- Gate the booking CTA on authentication: when the user is not logged in, render a `<a href="/login?redirect=...">Login dulu untuk booking</a>` link instead of the form.
- Render the correct disabled state on the CTA: past event → "Event telah berlalu"; sold out → "Kuota penuh"; registration closed (`registrationClosesAt` in the past) → "Pendaftaran ditutup".
- Add a `/myregistrations` page (auth-gated) that lists the user's bookings with status badges and a link to each ticket.
- Add a `/events/{slug}/ticket/{number}` page (auth + owner-gated) that shows the ticket details and a QR code.
- Generate a unique QR payload per registration (e.g. `pkubersua://registration/{registrationNumber}`) and render it as an inline SVG.
- Add an optional `events.registrationClosesAt` column for the "Pendaftaran ditutup" state.

**Non-Goals:**

- No payment integration (issue #7 lists email as optional, payment is not mentioned; the price block stays as it is today — display only).
- No email-sending (the success state is the redirect to the ticket page; email is a future change).
- No QR code scanner / check-in flow (the QR is a one-way artifact: printable, scannable; the verifier is a future change).
- No cancellation UI on the myregistrations page (the API exists for a future "Batalkan registrasi" button; this change ships the data shape and the transaction, not the UI).
- No admin UI for managing registrations (covered by GitHub issue #20 Panel Admin).
- No multi-ticket booking (one registration = one user = one event; groups are out of scope).
- No waitlist (sold-out events are sold-out, no queue).
- No RLS / per-user authorization changes on the existing tables (the existing RLS / public-anon pattern stays; the registration write goes through the service role via a server-only `+page.server.ts` action, which is the same pattern as the existing auth callback).

## Decisions

### Decision: Booking is a SvelteKit form action, not an API endpoint + client fetch

The detail page renders a `<form method="POST" action="?/book">` whose submit handler is the route's `actions.book` function. On success, the action returns a `redirect(303, /events/{slug}/ticket/{number})`. On failure, it returns a `fail(400, { code: 'EVENT_SOLD_OUT' })` which the page consumes via `form?.code` to render an inline error. This is the SvelteKit-native pattern, requires no client-side JS, and works without hydration.

**Alternatives considered:**

- _`POST /api/book` endpoint + client-side `fetch` + state machine._ Rejected: adds client-side state, breaks without JS, and is more code for the same behavior.
- _Direct `db.insert` from a `+page.svelte` `onclick`._ Rejected: server-only by SvelteKit's design; you can't query the DB from the client.

### Decision: `bookEvent` is a single Postgres transaction with `SELECT … FOR UPDATE` on the event row

The booking flow must be atomic: two concurrent bookings on the last slot must NOT both succeed. The implementation opens a transaction, runs `SELECT … FOR UPDATE` on the `events` row to lock it, checks `remainingSlots > 0`, inserts the registration, and decrements `remainingSlots` — all in one transaction. The Postgres `FOR UPDATE` row lock is the standard idiom for this race condition; an alternative (advisory locks, `UPDATE … WHERE remaining_slots > 0 RETURNING`) is more brittle.

**Alternatives considered:**

- _Read `remainingSlots`, check, then `UPDATE` — no lock._ Rejected: classic check-then-act race; two requests with `remainingSlots = 1` would both pass the check and both decrement.
- _Postgres advisory lock keyed on event id._ Rejected: works, but `FOR UPDATE` is more idiomatic and more readable.
- _Optimistic concurrency with a `version` column._ Rejected: more code, more failure modes; `FOR UPDATE` is the right tool here.

### Decision: `registrationNumber` is generated as `PKU-{year}-{nanoid(6)}` in the service

The registration number is the user-visible ticket id (e.g. `PKU-2026-aB3xY9`). It's a short, human-readable, year-prefixed string. The service generates it on insert and retries once on the (extremely rare) UNIQUE collision. `nanoid(6)` gives 36^6 = ~2.2B combinations per year — more than enough for the event scale.

**Alternatives considered:**

- _Postgres SERIAL / sequence._ Rejected: not human-readable; ugly like `12345`.
- _UUID._ Rejected: too long for a printed ticket; hard to read aloud.
- _`crypto.randomUUID()` shortened to 8 chars._ Acceptable but less entropy; nanoid is the right tool for short, URL-safe ids.

### Decision: The ticket page enforces ownership via 404, not 403

When a logged-in user navigates to `/events/{slug}/ticket/{number}` and the registration's `userId` doesn't match, the route returns a 404 (not a 403). Returning 403 would leak the existence of the registration (an attacker could enumerate numbers and find which ones exist). 404 is the right answer for "not yours" — it matches the response for "doesn't exist", which is what the user should see.

**Alternatives considered:**

- _Return 403 with "This is not your ticket"._ Rejected: leaks existence.
- _Return 200 with a "not your ticket" page._ Rejected: still leaks existence, and the URL bar lies.

### Decision: QR code is a server-rendered SVG, not a `<canvas>` or PNG

The ticket page runs the QR-generation library server-side and inlines the SVG into the HTML response. No client JS, no `<canvas>`, no PNG fallback. The SVG is in the initial HTML so the user can save the page, print it, or screenshot it. The library is `qrcode-svg` (small, well-maintained, SVG output) or a hand-rolled implementation if a new dependency is unwelcome — `qrcode` is the standard Node library.

**Alternatives considered:**

- _Generate QR as a data-URL PNG and use `<img src="data:image/png;base64,...">`. _ Rejected: bloats the HTML; harder to print at high resolution.
- _Generate QR as a separate route returning PNG._ Rejected: extra round-trip, breaks "save the page" UX.
- _Hand-roll a QR encoder._ Possible (the algorithm is documented), but the standard library is small and well-tested.

### Decision: `Event.registrationClosesAt` is a new optional column, not a derived value

The "Pendaftaran ditutup" state needs a deadline. Adding `registrationClosesAt` (timestamptz, NULL) to the `events` table gives the operator explicit control. NULL means "no deadline" (bookings accepted up to the event's start). The `+page.server.ts` derives the disabled-state from `registrationClosesAt` and the current time.

**Alternatives considered:**

- _Always derive from `events.startsAt` minus N hours._ Rejected: N is per-event and operator-controlled, not a constant.
- _Reuse `endsAt`._ Rejected: `endsAt` is the event's end time, not the booking deadline (you might book an hour before the event starts even though it runs for 3 hours).

### Decision: `EventBookingCta` gains an `authenticated: boolean` prop, no internal auth fetch

The CTA component does not call `locals.user` itself — the `+page.server.ts` reads `locals.user`, derives `authenticated`, and passes it as a prop. This keeps the CTA a pure presentation component (matches the existing `mode: "desktop" | "mobile"` prop pattern) and avoids server-only imports in a client-renderable component.

**Alternatives considered:**

- _Use `$page.data.user` inside the component._ Possible (SvelteKit's `page` store is client-safe), but mixing data-source patterns across components makes the codebase harder to follow. The prop pattern is consistent with the existing `mode` prop.

### Decision: `cancelRegistration` ships in this change but has no UI

The service function exists, with the same atomic transaction (mark `cancelled`, increment `remainingSlots`). The myregistrations page does NOT yet render a "Batalkan" button. The change ships the data path so a future change (or a quick follow-up) can add the button without a service-layer change.

**Alternatives considered:**

- _Ship the cancel button in this change._ Rejected: scope creep. The button is straightforward (a form action on the myregistrations page calling `cancelRegistration`); a 1-line addition can land in a follow-up.

## Risks / Trade-offs

- **The booking transaction is the critical-path correctness invariant.** Two concurrent bookings on the last slot must NOT both succeed. → Mitigation: `SELECT … FOR UPDATE` on the event row inside the transaction. The unit test must cover this case (using two parallel `bookEvent` calls in a test and asserting exactly one succeeds).
- **`registrationNumber` collisions are rare but possible.** nanoid(6) gives ~2.2B combinations; the yearly range is small enough that a collision is unlikely but not impossible. → Mitigation: the service catches the unique-constraint violation and retries once with a fresh nanoid. A second collision in the same transaction is vanishingly unlikely; if it happens, the function throws a typed `REGISTRATION_NUMBER_COLLISION` error and the user retries.
- **The QR payload is a URL, not a signed token.** Anyone with a registration number could forge a check-in scan if a check-in flow ships later. → Mitigation: when the check-in flow lands, the payload should be a signed JWT (with the registration id + a server secret). This change uses the plain URL as a placeholder; the verifier is out of scope.
- **The "Pendaftaran ditutup" state uses an `events.registrationClosesAt` column that the seed doesn't populate.** → Mitigation: the seed can be updated to set `registrationClosesAt` to the day before the event for one of the seeded events (so the e2e test can exercise the disabled state). The operator can also set it later via the future admin UI.
- **Auth is checked in `+page.server.ts` actions, not in the service.** The service trusts its caller. → Mitigation: the action layer always checks `locals.user` first; the service has no auth check. If a future caller forgets the auth check, the service will create a registration for `userId = null` (which would fail the FK to `profiles.id`, so the failure mode is a 500, not silent corruption). A future hardening can add an explicit "userId must be set" precondition in the service.
- **The new routes (`/myregistrations`, `/events/[slug]/ticket/[number]`) need to be added to the sitemap.** → Mitigation: update the `sitemap.xml` route to include both. Low effort.
- **The myregistrations page assumes the user has a `profiles` row.** If a user signed in via OAuth but the `profiles` insert didn't fire (the existing `auth-callback.test.ts` mocks this), the join returns no rows. → Mitigation: the page renders the empty state in that case (no registrations, no error). The profiles insert is already in the auth flow.
- **The detail page's existing `EventBookingCta` is rendered on both desktop and mobile.** The change updates both instances. → Mitigation: a single change to the component prop signature updates both (the prop is read by both the desktop and mobile render branches).
- **The booking form has no CSRF protection beyond SvelteKit's defaults.** SvelteKit's form actions are CSRF-protected by default (origin check). → Mitigation: nothing extra needed; the default is sufficient.
- **The myregistrations page sorts by `events.startsAt` ascending.** A user with many past registrations will see their oldest first. → Mitigation: the spec documents this ordering; a future change can add a "Sort by date registered" toggle.

## Migration Plan

This is a non-destructive additive change. The new `registrations` table is fresh; the `events.registrationClosesAt` column is nullable with no default (no impact on existing rows). No data migration.

**Deploy steps:**

1. Merge the change to `main`. CI runs `pnpm check` → `pnpm lint` → `pnpm test:unit -- --run` → `pnpm test:e2e` → `pnpm build`.
2. In the dev Supabase project: `pnpm db:migrate` (applies the new table + the new column).
3. `pnpm db:seed` (re-seeds; the seed script can optionally add one test registration per seeded event for the seed user).
4. Production: same steps against the prod Supabase project.
5. Verify in a browser: sign in with Google, navigate to an event, click "Booking Sekarang", land on the ticket page, see the QR. Navigate to `/myregistrations`, see the booking. Click "Lihat tiket", land back on the ticket page. Attempt to view another user's ticket URL (404).

**Rollback strategy:**

- The Drizzle migration can be rolled back with `pnpm db:migrate` (down migration) or by manually dropping the `registrations` table and the `events.registrationClosesAt` column. The new routes can be removed by reverting the merge. The detail page's `mailto:` CTA can be restored from git history.
- A revert of the merge commit restores the previous state (no registrations table, mailto: CTA). This is the safest rollback path.

**No DNS changes. No new env vars. Two new dependencies** (`nanoid`, `qrcode` — or equivalents). Both are small, well-maintained, and can be swapped if needed.

## Open Questions

- _Should the booking action accept a `?source=...` query param for analytics?_ Out of scope. A future change can add it.
- _Should the ticket page render the QR at multiple sizes (small for embedding, large for printing)?_ Start with one size; a future change can add a print stylesheet.
- _Should the myregistrations page show past registrations? Or only upcoming?_ Show all (sorted ascending by `events.startsAt`); the user can scroll past past events. A future change can add a "Show past" toggle if needed.
- _Should the `EventBookingCta` accept an `error` prop and render an inline error, or should the page render the error above the CTA?_ Start with the page-level error (the action returns `fail()` and the page renders the error above the CTA). A future change can move the error into the CTA if the design prefers.
- _Should the registration number be displayed in the success message? E.g. "Booking berhasil! Nomor registrasi: PKU-2026-aB3xY9."_ Yes — issue #7 explicitly asks for "Menampilkan nomor registrasi" on success. The ticket page shows it; the success flash message also shows it.
- _Should the `?redirect=...` flow on `/login` support the ticket page URL? The URL has two dynamic segments (`[slug]` and `[number]`)._ Yes — the existing `/login?redirect=...` already supports arbitrary paths; no change needed.
