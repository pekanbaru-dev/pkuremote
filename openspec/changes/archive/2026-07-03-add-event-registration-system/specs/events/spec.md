## ADDED Requirements

### Requirement: `Event` type optionally carries `registrationClosesAt`

The `Event` type at `src/lib/features/events/types.ts` SHALL add an optional `registrationClosesAt?: string` field (ISO-8601 string). When set and the current time is past this value, the event is no longer bookable. When unset, no registration deadline applies. The Drizzle row in the `events` table SHALL have a corresponding nullable `registrationClosesAt` column.

#### Scenario: A consumer imports the `Event` type

- **WHEN** a route or component imports `type Event` from `$lib/features/events`
- **THEN** the type includes `registrationClosesAt?: string` alongside the other optional fields.

#### Scenario: An event has no registration deadline

- **WHEN** an event's `registrationClosesAt` is `null` in the database
- **THEN** the `Event` returned by `getEventBySlug` has `registrationClosesAt === undefined` and the event is bookable up to its `startsAt`.

### Requirement: Event detail page's "Booking Sekarang" CTA is a real form action, not a `mailto:` link

The event detail page SHALL render the "Booking Sekarang" CTA via the `EventBookingCta` component, which posts to the route's `actions.book` handler. The CTA SHALL NOT use `mailto:` for the booking flow (the mailto: pattern is removed). The CTA's disabled state SHALL reflect the event's bookability (upcoming status, `remainingSlots > 0`, no past `registrationClosesAt`). The previous mailto: behavior is **REMOVED** — the CTA no longer opens an email client.

#### Scenario: A visitor clicks "Booking Sekarang" on a bookable event

- **WHEN** a visitor clicks the "Booking Sekarang" button on a bookable event
- **THEN** the browser submits the form to `?/book`; the action creates a registration and redirects to the ticket page; no email client opens.

### Requirement: Event detail page surfaces the registration deadline in the metadata

When the `events.registrationClosesAt` column is set, the event detail page SHALL show the registration deadline in the booking panel as a small meta line above the CTA (e.g. "Pendaftaran ditutup pada 20 Oktober 2026 pukul 23.59"). When the column is null, the meta line is omitted.

#### Scenario: An event with a registration deadline

- **WHEN** a visitor views `/events/{slug}` for an event with `registrationClosesAt = "2026-10-20T23:59:00+07:00"`
- **THEN** the booking panel renders a meta line "Pendaftaran ditutup pada 20 Oktober 2026 pukul 23.59" above the CTA.

#### Scenario: An event with no registration deadline

- **WHEN** a visitor views `/events/{slug}` for an event with `registrationClosesAt = null`
- **THEN** the booking panel does not render the deadline meta line; the CTA is bookable up to the event's `startsAt`.
