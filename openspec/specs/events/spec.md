# events Specification

## Purpose

TBD - created by archiving change slice-events-rebrand-pkubersua. Update Purpose after archive.

## Requirements

### Requirement: Event data shape is the `Event` type defined in `features/events/types.ts`

The project SHALL define an `Event` TypeScript type in `src/lib/features/events/types.ts` with the fields: `id` (string, required, slug-safe), `slug` (string, required, unique, URL-safe), `title` (string, required), `startsAt` (ISO-8601 string, required), `endsAt` (ISO-8601 string, optional), `location` (string, required), `excerpt` (string, required, max 200 chars), `body` (string, required, supports inline markdown), `bannerUrl` (string URL or null, optional), `status` (one of `"upcoming" | "live" | "past"`, derived from `startsAt`/`endsAt` vs the current time but allowed to be set explicitly), `quota` (positive integer or null, optional), `remainingSlots` (non-negative integer or null, optional, SHALL be ≤ `quota` when both are set), `priceNormal` (number in IDR or null, optional), `pricePromo` (number in IDR or null, optional, SHALL be < `priceNormal` when both are set), and `category` (one of `"workshop" | "talk" | "meetup" | "social" | "other"`, optional).

#### Scenario: A consumer imports the `Event` type

- **WHEN** a route or component imports `type Event` from `$lib/features/events`
- **THEN** TypeScript resolves the type from `features/events/types.ts` and the consumer sees all required and optional fields with their documented semantics.

#### Scenario: A new event is added to the dummy data

- **WHEN** a developer adds an entry to `features/events/services/dummy-events.ts`
- **THEN** the entry passes the `Event` type check (slug unique, `pricePromo` < `priceNormal` when both set, `remainingSlots` ≤ `quota` when both set) and appears on the listing and detail pages.

### Requirement: Homepage lists upcoming and past events in two sections

The homepage at `/` SHALL render two distinct sections in this order: "Event Akan Datang" (upcoming events, sorted ascending by `startsAt`) and "Event Sebelumnya" (past events, sorted descending by `startsAt`). Each section SHALL render its events as a list/grid of `EventCard` components. Each section SHALL have a semantic heading (`<h2>`) with a stable `id` so it can be deep-linked. Each section SHALL show an `EmptyState` when no events match.

#### Scenario: A visitor opens the homepage with at least one upcoming event

- **WHEN** the page is requested at `/` and there is at least one upcoming event
- **THEN** the page renders the "Event Akan Datang" section with one `EventCard` per upcoming event in chronological order (soonest first), each card linking to `/events/{slug}`.

#### Scenario: A visitor opens the homepage with no upcoming events

- **WHEN** the page is requested at `/` and there are zero upcoming events
- **THEN** the "Event Akan Datang" section renders an `EmptyState` with the message "Belum ada event yang akan datang — pantau terus untuk kabar terbaru."

#### Scenario: A visitor opens the homepage with at least one past event

- **WHEN** the page is requested at `/` and there is at least one past event
- **THEN** the page renders the "Event Sebelumnya" section with one `EventCard` per past event in reverse chronological order (most recent first), with at most 6 events shown and a "Lihat semua" link to `/events` if more exist.

#### Scenario: A visitor opens the homepage with no past events

- **WHEN** the page is requested at `/` and there are zero past events
- **THEN** the "Event Sebelumnya" section is omitted entirely from the page (no empty state, no heading), so the page doesn't apologize for an empty history on a brand-new site.

### Requirement: EventCard shows banner, title, date, location, status, and price

Each `EventCard` (in `src/lib/features/events/components/event-card.svelte`) SHALL render the event's `bannerUrl` in a fixed-height (`h-48`) banner at the top, with the banner clipped to `rounded-xl` (12px) corners and a `group-hover:scale-105 transition-transform duration-500` effect on the image. Below the banner, the card SHALL render (in document order): (1) two category pill badges — one styled `bg-primary/10 text-primary rounded-full text-label-md` reading the event's `category`, and one styled `bg-secondary/10 text-secondary rounded-full text-label-md` reading the event's `categorySecondary`; (2) the event title in `font-headline-md text-headline-md`; (3) a one-line excerpt with `line-clamp-2`; (4) a footer row containing a Material Symbols `calendar_today` icon next to the event date, and a right-aligned `Book Now` / `RSVP` / `Register` link (selected by the event's `category` via a small mapping) styled `text-primary font-bold hover:translate-x-1 transition-transform`. The card SHALL be a `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group` container. The whole card SHALL be a single `<a>` linking to `/events/{event.slug}`.

The card root `<a>` SHALL be a flex column (`flex flex-col`), the body container below the banner SHALL carry `flex-1` (so it grows to fill the banner-to-bottom space), and the footer row SHALL use `mt-auto` (not a fixed top margin) so that it is pinned to the bottom of the card body. As a result, when multiple `EventCard`s are rendered in the same grid row (e.g. the "Upcoming Community Gatherings" 3-column grid), their footer rows SHALL share a common baseline — the date + CTA row of the shortest-excerpt card SHALL align with the date + CTA row of the longest-excerpt card — regardless of excerpt length, badge presence, or title line count. On a single-column layout (mobile), where each card is its own grid row, `mt-auto` SHALL degrade to a no-op and the footer SHALL sit directly below the excerpt with the body's standard `gap-3` spacing.

#### Scenario: Reader scans a Stitch-style event card

- **WHEN** a visitor views an event card in the Upcoming Community Gatherings grid
- **THEN** they see a 192px-tall banner, two category pills, the event title, a 2-line excerpt, the date with a calendar icon, and a "Book Now" / "RSVP" / "Register" CTA.

#### Scenario: Banner zooms on card hover

- **WHEN** a visitor hovers an event card
- **THEN** the banner image scales up to 105% over 500ms.

#### Scenario: Category pills are hidden when category is missing

- **WHEN** the event has neither `category` nor `categorySecondary` set
- **THEN** the card renders with no category pills (graceful degradation, per the existing "Partial response" rule).

#### Scenario: Footer rows align across a grid row regardless of excerpt length

- **WHEN** a grid row renders two or more `EventCard`s whose excerpts differ in length (e.g. one 1-line excerpt and one 2-line excerpt)
- **THEN** the date + CTA footer row of every card in that row sits at the same vertical position — pinned to the bottom of each card — so the footer rows form a single aligned baseline across the row.

#### Scenario: Footer sits directly under excerpt on single-column mobile

- **WHEN** an `EventCard` is rendered in a single-column (mobile) grid where it is the only item in its row
- **THEN** the footer row sits directly below the excerpt with the body's standard `gap-3` spacing (no extra gap is introduced), matching the pre-change layout.

### Requirement: Event detail page is server-rendered with full SEO

The event detail page at `src/routes/events/[slug]/+page.svelte` SHALL be server-rendered via a co-located `+page.server.ts` that loads the event by `slug` from the dummy-data service. The page SHALL return a 404 (`error(404, ...)`) when the slug is unknown. The page SHALL include in `<svelte:head>`: a unique `<title>` (event title + " — PKUBersua"), a unique `meta description` (the event excerpt truncated to 160 chars), a `link rel="canonical"` pointing at the absolute URL, `og:title`, `og:description`, `og:type=article`, `og:url`, `og:image` (the banner URL or the default OG image), `og:site_name=PKUBersua`, and Twitter Card tags (`twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`).

#### Scenario: A visitor opens an event detail page

- **WHEN** a visitor navigates to `/events/{slug}` for a known slug
- **THEN** the page renders the event hero (banner, title, status badge, date, location), the price block, the quota display, the body, and the booking CTA — all on the server, with the meta tags and JSON-LD in the initial HTML response.

#### Scenario: A visitor opens an unknown slug

- **WHEN** a visitor navigates to `/events/does-not-exist`
- **THEN** the server returns a 404 status with the SvelteKit error page, and the meta title is "Tidak ditemukan — PKUBersua".

### Requirement: Event detail page emits Schema.org Event JSON-LD

The event detail page SHALL embed a `<script type="application/ld+json">` block in `<svelte:head>` with a `Schema.org Event` object containing: `name` (event title), `startDate` (event `startsAt`), `endDate` (event `endsAt` when set, otherwise omitted), `eventAttendanceMode` (`"https://schema.org/OfflineEventAttendanceMode"` since all current events are in-person), `eventStatus` (`"https://schema.org/EventScheduled"`), `location.name` (event location string), `location.address` (event location string, since we don't yet have structured addresses), `organizer.name = "PKUBersua"`, `organizer.url = "{PUBLIC_SITE_URL}"`, and `offers` (an `Offer` with `price`, `priceCurrency="IDR"`, `availability` reflecting the quota — `https://schema.org/InStock` while `remainingSlots > 0`, otherwise `https://schema.org/SoldOut`). When `priceNormal` is null, `offers` is omitted and a `isAccessibleForFree=true` flag is set on the event.

#### Scenario: A search engine crawls an event detail page

- **WHEN** Google's structured-data validator parses the JSON-LD block
- **THEN** it finds a `Event` node with `name`, `startDate`, `location`, `organizer`, and (when applicable) `offers`, and the validator reports zero errors.

#### Scenario: An event is sold out

- **WHEN** the dummy data for an event has `remainingSlots = 0`
- **THEN** the JSON-LD `offers.availability = "https://schema.org/SoldOut"`, and the page's booking CTA renders as `disabled` with the label "Kuota penuh".

### Requirement: Booking CTA opens a pre-filled mailto link

The event detail page SHALL render a booking CTA labeled "Booking Sekarang" (desktop: a `Button` inside the sticky right-column panel; mobile: a floating action button fixed to the bottom-right of the viewport). On activation, the CTA SHALL open `mailto:hello@pkubersua.com?subject=Booking: {event title}&body=Halo, saya ingin mendaftar untuk event {event title} ({startsAt} di {location}).%0A%0ANama:%0ANo. HP:%0A` in the visitor's mail client. The CTA SHALL be `disabled` and labeled "Kuota penuh" when `remainingSlots = 0`.

#### Scenario: A visitor on desktop clicks the booking CTA

- **WHEN** the visitor clicks the "Booking Sekarang" button in the right-column panel
- **THEN** their default mail client opens a new compose window addressed to `hello@pkubersua.com`, with the subject pre-filled to "Booking: {event title}" and the body pre-filled with the event title, date, location, and two empty lines for the visitor to fill in their name and phone number.

#### Scenario: A visitor on mobile taps the floating booking button

- **WHEN** the visitor taps the floating "Booking" button visible at the bottom-right of the viewport
- **THEN** the same mailto flow as the desktop CTA runs, and the floating button remains visible while the visitor scrolls the page.

#### Scenario: A visitor tries to book a sold-out event

- **WHEN** the event has `remainingSlots = 0`
- **THEN** the booking CTA renders as `disabled`, the label reads "Kuota penuh", the `aria-disabled` attribute is set, and clicking does not open the mail client.

### Requirement: Price block supports free, normal, and promo pricing

The event detail page SHALL render a price block with the following rules: when `priceNormal` is null, show a `CurrencyDisplay` with value `"GRATIS"` styled as a primary badge; when `pricePromo` is set and is less than `priceNormal`, show the promo price as the prominent value, the normal price as a smaller strikethrough value to its right, and a small "Promo" label; otherwise show the normal price alone.

#### Scenario: A reader views a free event

- **WHEN** the event has `priceNormal = null`
- **THEN** the price block shows a "GRATIS" label in the primary accent color.

#### Scenario: A reader views a paid event without promo

- **WHEN** the event has `priceNormal = 25000` and `pricePromo = null`
- **THEN** the price block shows "Rp 25.000" once, with no strikethrough.

#### Scenario: A reader views an event with a promo price

- **WHEN** the event has `priceNormal = 100000` and `pricePromo = 75000`
- **THEN** the price block shows "Rp 75.000" as the prominent value, "Rp 100.000" smaller with a strikethrough to its right, and a small "Promo" label.

### Requirement: Quota display shows total and remaining slots when both are set

When both `quota` and `remainingSlots` are set on an event, the detail page SHALL render a quota line in the booking panel reading "{remainingSlots}/{quota} slot tersedia" using the meta-label typography, and SHALL render a small horizontal progress bar in the primary fill (or destructive fill when full) sized to `(quota − remainingSlots) / quota`. When either field is null, the quota line is omitted.

#### Scenario: A reader views an event with quota

- **WHEN** the event has `quota = 50` and `remainingSlots = 18`
- **THEN** the detail page renders "18/50 slot tersedia" and a progress bar filled to 64% (representing 32 booked out of 50).

#### Scenario: A reader views an event with no quota configured

- **WHEN** the event has `quota = null`
- **THEN** the quota line and the progress bar are not rendered, and the booking CTA is enabled (subject only to the sold-out check, which can't fire without quota).

### Requirement: Empty states for the event listing use the `EmptyState` primitive

When the "Event Akan Datang" section has no events, the section SHALL render an `EmptyState` (from `$lib/components/ui/empty-state`) with `title="Belum ada event yang akan datang"` and `description="Pantau terus untuk kabar terbaru komunitas."`. The `EmptyState` SHALL be visually quiet (no illustration, no CTA button) and shall not be rendered for the "Event Sebelumnya" section, which is omitted entirely when empty.

#### Scenario: A first-time visitor lands on the homepage

- **WHEN** the dummy data has no past events and at least one upcoming event
- **THEN** the page renders the "Event Akan Datang" section with events and skips the "Event Sebelumnya" section entirely; the page does not apologize for an empty history.

#### Scenario: A returning visitor lands on the homepage after the last event ended

- **WHEN** the dummy data has past events but no upcoming events
- **THEN** the page renders the "Event Sebelumnya" section with past events and the "Event Akan Datang" section renders the `EmptyState`.

### Requirement: All event-specific code lives in `src/lib/features/events/`

The folder `src/lib/features/events/` SHALL contain: `types.ts` (the `Event` type), `services/dummy-events.ts` (the `getUpcomingEvents`, `getPastEvents`, and `getEventBySlug` functions that read from a typed const array), `components/event-card.svelte`, `components/event-list.svelte`, `components/event-detail-hero.svelte`, `components/event-booking-cta.svelte`, `components/event-price-block.svelte`, `components/event-quota-meter.svelte`, and `index.ts` (the public surface exporting `Event`, the three service functions, and the public components). Components in this folder SHALL import primitives only from `$lib/components/ui/`. The feature SHALL NOT import from any other feature folder.

#### Scenario: A consumer imports the public surface

- **WHEN** a route imports from `$lib/features/events`
- **THEN** the only exports are `Event`, `getUpcomingEvents`, `getPastEvents`, `getEventBySlug`, `EventCard`, `EventList`, `EventDetailHero`, `EventBookingCta`, `EventPriceBlock`, and `EventQuotaMeter`.

#### Scenario: A reviewer audits a feature component for cross-feature imports

- **WHEN** a reviewer greps `src/lib/features/events/components/` for `from "$lib/features/`
- **THEN** no matches appear except for the feature's own `$lib/features/events` import surface.

### Requirement: Event type optionally carries `categoryLabel` and `categorySecondary`

The `Event` type SHALL add two optional fields: `categoryLabel?: string` and `categorySecondary?: string`. Each SHALL be a string of max 16 characters, displayed as a pill label on the event card. When either field is `undefined`, the corresponding pill SHALL be hidden. The dummy data SHALL fill both fields on all 8 events.

#### Scenario: A new event is added to the dummy data with categories

- **WHEN** a developer adds an entry to `features/events/services/dummy-events.ts` with `categoryLabel: "Workshop"` and `categorySecondary: "Hands-on"`
- **THEN** the event card renders two pills reading "Workshop" and "Hands-on", and the type check passes.
