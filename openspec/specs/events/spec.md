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

### Requirement: Event data lives in Supabase, not in a hardcoded array

The events feature SHALL read its data from the Supabase Postgres database via the Drizzle client at `src/lib/server/db/client.ts`. The `src/lib/features/events/services/dummy-events.ts` file SHALL be deleted. The server-only service module at `src/lib/server/events/db-events.ts` (re-exported from `src/lib/server/events/index.ts`) SHALL export `getUpcomingEvents()`, `getPastEvents()`, and `getEventBySlug(slug)` with the same signatures and return shapes as the previous dummy service, but implemented as Drizzle queries against the `events` table with an eager-loaded join to `event_categories` and `categories`. Every function SHALL return events with a `categories: { id, name, slug }[]` field populated (the M2M relation). The events feature barrel at `src/lib/features/events/index.ts` SHALL NOT export the service functions (they live under `$lib/server/events/` and are imported by `+page.server.ts` / `+server.ts` files only).

#### Scenario: A page calls `getUpcomingEvents()`

- **WHEN** a `+page.server.ts` `load()` calls `getUpcomingEvents()`
- **THEN** the function issues a Drizzle query against the `events` table joined with `event_categories` and `categories`, filters rows where `events.startsAt >= now()`, sorts ascending by `events.startsAt`, and returns an array of `Event` objects each carrying a populated `categories: { id, name, slug }[]` field.

#### Scenario: A page calls `getEventBySlug("traditional-talam-masterclass")`

- **WHEN** a `+page.server.ts` `load()` calls `getEventBySlug("traditional-talam-masterclass")`
- **THEN** the function returns the matching row (with categories eager-loaded) or `undefined` when no row matches; the route's `error(404, ...)` translates `undefined` to a 404 response.

#### Scenario: A reviewer greps for the dummy service

- **WHEN** a reviewer greps the codebase for `dummy-events`
- **THEN** no matches appear — the file is deleted and the server barrel at `$lib/server/events/` re-exports the Drizzle-backed `db-events` module instead.

### Requirement: `Event` type uses an M2M `categories` array, not free-form label strings

The `Event` type at `src/lib/features/events/types.ts` SHALL define `categories: { id: string; name: string; slug: string }[]` as a non-optional field (an event has zero or more categories; the array is empty when the event has no categories assigned). The previous free-form `categoryLabel?: string` and `categorySecondary?: string` fields SHALL NOT exist on the type. The typed `category?: EventCategory` enum field SHALL be retained (it's the "primary category" used for the `EventCard` footer CTA label, distinct from the M2M display list).

#### Scenario: A consumer imports the `Event` type

- **WHEN** a route or component imports `type Event` from `$lib/features/events`
- **THEN** the type includes `categories: { id: string; name: string; slug: string }[]` and does NOT include `categoryLabel` or `categorySecondary`.

#### Scenario: A new event is added to the DB with two categories

- **WHEN** a developer inserts a row into the `events` table with two corresponding rows in `event_categories`
- **THEN** the next call to `getUpcomingEvents()` returns an `Event` with `categories.length === 2` and each entry has the correct `id`, `name`, and `slug`.

#### Scenario: An event with no categories is queried

- **WHEN** an event row has no corresponding `event_categories` rows
- **THEN** `getEventBySlug` returns an `Event` with `categories: []` and the `EventCard` renders no pills (graceful degradation per the existing partial-response rule).

### Requirement: `EventCard` category pills are clickable links to the filtered listing

The `EventCard` component SHALL render each `event.categories[i]` as an `<a href="/events?category={category.slug}">` element (where `{category.slug}` is URL-encoded). The pill's visual style SHALL match the existing pill treatment (the first category uses `bg-primary/10 text-primary rounded-full text-label-md`; the second uses `bg-secondary/10 text-secondary rounded-full text-label-md`; the pattern repeats for additional categories). The card's outer wrapper SHALL be a `<div>` (not an `<a>`) with one inner `<a>` covering the banner, title, and excerpt; this inner `<a>` SHALL have `href="/events/{event.slug}"`. The footer date row and CTA text SHALL be plain `<div>` / `<span>` elements (not links). No `<a>` SHALL be nested inside another `<a>`.

#### Scenario: A visitor clicks a category pill on a card

- **WHEN** a visitor clicks the first pill on an `EventCard` whose event has `categories: [{ slug: "workshop" }]`
- **THEN** the browser navigates to `/events?category=workshop` and the listing page filters to events tagged with the "workshop" category.

#### Scenario: A visitor middle-clicks a pill to open in a new tab

- **WHEN** a visitor middle-clicks (or right-clicks → "Open in new tab") a category pill
- **THEN** the browser opens `/events?category={slug}` in a new tab — the click is NOT swallowed by the card's outer body link (the pill is a sibling, not a child, of the body link).

#### Scenario: An event with no categories renders without pills

- **WHEN** an `EventCard` is rendered for an event with `categories: []`
- **THEN** the card renders the banner, title, excerpt, date row, and CTA, but no category pills are visible.

### Requirement: Event listing page filters by `?category=…`

The event listing page at `src/routes/events/+page.svelte` (loaded by the co-located `+page.server.ts`) SHALL read the `category` query param from the request URL. When the param is set to a known category slug, the page SHALL return only events whose joined categories include that slug (an event is included if any of its `categories[i].slug` matches the param). When the param is unset or empty, the page SHALL return all events as it does today. The data load SHALL also return `filter: { name, slug } | null` (the resolved category object when filtered, `null` when unfiltered) so the page can render the filter chip and adapt the `<svelte:head>` and `EmptyState` copy.

#### Scenario: A visitor opens `/events` with no filter

- **WHEN** the page is requested at `/events` with no query param
- **THEN** the page returns the full upcoming and past lists (all events) and `data.filter === null`; the page renders without the filter chip.

#### Scenario: A visitor opens `/events?category=workshop`

- **WHEN** the page is requested at `/events?category=workshop`
- **THEN** the data load filters `getUpcomingEvents()` and `getPastEvents()` to events whose `categories` array includes a category with `slug === "workshop"`; the data load returns `filter: { name: "Workshop", slug: "workshop" }`; the page renders only those events and surfaces the filter chip.

#### Scenario: A visitor opens `/events?category=does-not-exist`

- **WHEN** the page is requested at `/events?category=does-not-exist` and no category with that slug exists
- **THEN** the data load returns empty `upcoming` and `past` arrays and `filter: { name: "does-not-exist", slug: "does-not-exist" }`; the page renders the upcoming `EmptyState` with the unknown-slug name and omits the past section.

#### Scenario: The filter happens at the DB layer, not in the Svelte component

- **WHEN** the data load runs
- **THEN** the SQL query includes a WHERE clause on the joined `categories.slug`; the unfiltered list is never sent to the client when the param is set (verifiable by inspecting the SQL log or by the network response size being smaller when filtered).

### Requirement: Event listing page shows a removable filter chip when filtered

When the listing page data load returns `filter: { name, slug }` (i.e. the URL has `?category=…`), the page SHALL render a single filter chip at the top of the listing body. The chip SHALL read "Filter: {name} × Hapus filter" where "× Hapus filter" is an inline `<a href="/events">` styled as a quiet link (using the existing `.link-quiet` class from `src/routes/layout.css`). The chip SHALL be omitted when `data.filter === null`.

#### Scenario: A filtered listing page renders the chip

- **WHEN** the page is requested at `/events?category=workshop` and at least one event matches
- **THEN** the page renders a chip reading "Filter: Workshop × Hapus filter" with the "Hapus filter" link pointing at `/events` (clearing the filter).

#### Scenario: A visitor clicks "Hapus filter"

- **WHEN** a visitor clicks the "Hapus filter" link on the filter chip
- **THEN** the browser navigates to `/events` (no query param) and the page renders the unfiltered listing (all events, no chip).

#### Scenario: An unfiltered listing page omits the chip

- **WHEN** the page is requested at `/events` with no query param
- **THEN** the filter chip is not rendered — the page goes straight to the two section headings.

### Requirement: Filtered listing `<svelte:head>` and `EmptyState` copy adapt to the filter

When the listing page is filtered, the page SHALL adapt its `<svelte:head>` and the upcoming `EmptyState` copy: `<title>` becomes "Event {filter.name} — PKUBersua", `og:title` mirrors it, and the upcoming `EmptyState` description reads "Belum ada event '{filter.name}' — coba hapus filter atau pilih kategori lain." instead of the unfiltered message. The canonical URL SHALL stay at `${PUBLIC_SITE_URL}/events` (not the filtered URL) — the filter is a transient state, not a canonical landing page.

#### Scenario: A filtered listing's `<title>` reflects the filter

- **WHEN** the page is requested at `/events?category=workshop`
- **THEN** the `<title>` in the initial HTML response is "Event Workshop — PKUBersua" and the canonical link points at `${PUBLIC_SITE_URL}/events` (not the filtered URL).

#### Scenario: A filtered listing with no events shows the filter-aware `EmptyState`

- **WHEN** the page is requested at `/events?category=workshop` and no events match
- **THEN** the upcoming `EmptyState` description reads "Belum ada event 'Workshop' — coba hapus filter atau pilih kategori lain." and the past section is omitted.

### Requirement: `db-events` service also exports `getEventsByCategorySlug`, `getAllCategories`, and `getCategoryBySlug`

The `db-events.ts` module at `src/lib/server/events/` SHALL additionally export three query functions: `getEventsByCategorySlug(slug: string): Event[]` (returns all events — upcoming and past — whose categories include the given slug, sorted by `startsAt` ascending), `getAllCategories(): { id: string; name: string; slug: string }[]` (returns every category, sorted by `name` ascending), and `getCategoryBySlug(slug: string): { id: string; name: string; slug: string } | undefined` (returns a single category by slug, or `undefined`). The server barrel at `src/lib/server/events/index.ts` SHALL re-export all three.

#### Scenario: A reviewer imports the new service functions

- **WHEN** a route imports `getAllCategories` from `$lib/server/events`
- **THEN** TypeScript resolves the export from `db-events.ts` and the function is callable.

#### Scenario: A category with no events is returned by `getAllCategories`

- **WHEN** the database has a category with no events assigned
- **THEN** `getAllCategories()` still returns that category (it returns categories, not events; the caller decides how to use the result).

### Requirement: Dedicated event listing page at `/events`

The site SHALL expose a server-rendered event listing page at `src/routes/events/+page.svelte` (with a co-located `+page.server.ts` `load()` that calls `getUpcomingEvents()` and `getPastEvents()` from the server-only events service at `$lib/server/events/`). The page SHALL render two distinct sections in this order: an "Event Akan Datang" section (with `<h2 id="upcoming">`) listing upcoming events sorted ascending by `startsAt`, and an "Event Sebelumnya" section (with `<h2 id="past">`) listing past events sorted descending by `startsAt`. Each section SHALL render its events as a vertical list of `EventCard` components (the same component the homepage uses). The upcoming section SHALL render an `EmptyState` (from `$lib/components/ui/empty-state`) with the message "Belum ada event yang akan datang — pantau terus untuk kabar terbaru." when empty. The past section SHALL be omitted entirely from the page when empty. The page SHALL include in `<svelte:head>`: a unique `<title>` ("Event — PKUBersua"), a unique `meta description` ("Daftar event PKUBersua — kumpul, belajar, dan bersua di Pekanbaru."), a `link rel="canonical"` pointing at `${PUBLIC_SITE_URL}/events`, `og:title`, `og:description`, `og:type=website`, `og:url`, `og:site_name=PKUBersua`, and `og:locale=id_ID`. The page SHALL NOT embed JSON-LD (the structured `Event` schema lives on the per-event detail page only). The page SHALL be reachable without login and SHALL link each event card to `/events/{event.slug}` via the existing `EventCard` anchor.

#### Scenario: A visitor opens `/events` with at least one upcoming event and no past events

- **WHEN** the page is requested at `/events` and the upcoming events list is non-empty and the past events list is empty
- **THEN** the page renders the "Event Akan Datang" section with one `EventCard` per upcoming event in chronological order, the "Event Sebelumnya" section is omitted entirely from the page, the meta title is "Event — PKUBersua", and the meta description matches the spec.

#### Scenario: A visitor opens `/events` with both upcoming and past events

- **WHEN** the page is requested at `/events` and both lists are non-empty
- **THEN** the page renders both sections in order — upcoming first, past second — each as a vertical list of `EventCard`s, with `<h2 id="upcoming">` and `<h2 id="past">` headings, and the meta tags are present in the initial HTML response.

#### Scenario: A visitor opens `/events` with no upcoming events and at least one past event

- **WHEN** the page is requested at `/events` and the upcoming events list is empty and the past events list is non-empty
- **THEN** the "Event Akan Datang" section renders an `EmptyState` with the message "Belum ada event yang akan datang — pantau terus untuk kabar terbaru." and the "Event Sebelumnya" section renders the past events in reverse chronological order.

#### Scenario: A visitor opens `/events` with zero events in either section

- **WHEN** the page is requested at `/events` and both lists are empty
- **THEN** the page renders the "Event Akan Datang" section with the `EmptyState`, the "Event Sebelumnya" section is omitted entirely, and the page returns a 200 status with a valid (non-empty) HTML body.

#### Scenario: A visitor deep-links to `/events#upcoming`

- **WHEN** the page is requested at `/events#upcoming`
- **THEN** the browser scrolls to the `<h2 id="upcoming">` element after the page renders.

#### Scenario: A search engine crawls `/events`

- **WHEN** Google's structured-data validator parses `/events`
- **THEN** it finds a regular HTML page with the meta title, meta description, canonical URL, Open Graph tags, and Twitter Card tags; the page contains no JSON-LD `<script type="application/ld+json">` block.

### Requirement: Homepage preview reveals a "Lihat semua" link when past events are truncated

The homepage at `src/routes/+page.svelte` SHALL render a "Lihat semua" link inside the "Event Sebelumnya" section whenever the total count of past events exceeds 6 (i.e. the section is truncated). The link SHALL be a `<a href="/events">` styled as a quiet hairline-underline text link (the same `.link-quiet` class used for the footer "Events Calendar" link in `src/routes/layout.css`). The link SHALL be omitted from the homepage entirely when the total past-events count is 6 or fewer. The homepage preview SHALL continue to render at most 6 past `EventCard`s in the "Event Sebelumnya" section regardless of the total count.

#### Scenario: The homepage has 3 past events

- **WHEN** the homepage is requested and the total past-events count is 3
- **THEN** the "Event Sebelumnya" section renders 3 `EventCard`s and the "Lihat semua" link is not rendered.

#### Scenario: The homepage has 7 past events

- **WHEN** the homepage is requested and the total past-events count is 7
- **THEN** the "Event Sebelumnya" section renders the 6 most recent `EventCard`s and a "Lihat semua" link below them pointing to `/events`.

### Requirement: Event detail page links back to the listing

The event detail page at `src/routes/events/[slug]/+page.svelte` SHALL render a "Kembali ke semua event" link above the `EventDetailHero`. The link SHALL be a `<a href="/events">` styled as a quiet hairline-underline text link (the same `.link-quiet` class). The link SHALL be visible on all viewport sizes. The link SHALL always be rendered for every event detail page (no conditional omitted states are defined).

#### Scenario: A visitor opens an event detail page

- **WHEN** a visitor navigates to `/events/{slug}` for a known slug
- **THEN** the page renders a "Kembali ke semua event" link above the event hero, and clicking the link navigates to `/events` (the listing page).

#### Scenario: A visitor uses the back-link round-trip

- **WHEN** a visitor navigates `/` → `/events` → `/events/{slug}` and clicks the "Kembali ke semua event" link
- **THEN** the browser navigates to `/events` and the page renders the "Event Akan Datang" and "Event Sebelumnya" sections as defined in the "Dedicated event listing page at `/events`" requirement.

### Requirement: `Event` type optionally carries `registrationClosesAt`

The `Event` type at `src/lib/features/events/types.ts` SHALL add an optional `registrationClosesAt?: string` field (ISO-8601 string). When set and the current time is past this value, the event is no longer bookable. When unset, no registration deadline applies. The Drizzle row in the `events` table SHALL have a corresponding nullable `registrationClosesAt` column.

#### Scenario: A consumer imports the `Event` type

- **WHEN** a route or component imports `type Event` from `$lib/features/events`
- **THEN** the type includes `registrationClosesAt?: string` alongside the other optional fields.

#### Scenario: An event has no registration deadline

- **WHEN** an event's `registrationClosesAt` is `null` in the database
- **THEN** the `Event` returned by `getEventBySlug` has `registrationClosesAt === undefined` and the event is bookable up to its `startsAt`.

### Requirement: Event detail page's "Booking Sekarang" CTA is a real form action that collects per-event attendee name and phone, not a `mailto:` link

The event detail page SHALL render the "Booking Sekarang" CTA via the `EventBookingCta` component, which posts to the route's `actions.book` handler. The CTA SHALL NOT use `mailto:` for the booking flow (the mailto: pattern is removed). The booking form SHALL collect two text inputs from the user: `attendeeName` (required, the per-event attendee name) and `attendeePhone` (required, the per-event attendee phone). The attendee name SHALL default to the user's profile `displayName` and SHALL be editable per event (the same user can register for different events under different names). The CTA's disabled state SHALL reflect the event's bookability (upcoming status, `remainingSlots > 0`, no past `registrationClosesAt`). The previous mailto: behavior is **REMOVED** — the CTA no longer opens an email client.

#### Scenario: A visitor clicks "Booking Sekarang" on a bookable event

- **WHEN** a visitor clicks the "Booking Sekarang" button on a bookable event
- **THEN** the browser submits the form to `?/book`; the action creates a registration and redirects to the ticket page; no email client opens.

#### Scenario: The form pre-fills with the user's profile name and is editable

- **WHEN** an authenticated visitor views `/events/{slug}` for the first time
- **THEN** the "Nama Peserta" input is pre-filled with the user's profile `displayName`; the "No. HP" input is empty; the visitor can edit either field before submitting; the booking stores the entered (edited) name and phone in the registration row, not the profile values.

#### Scenario: The form rejects empty fields with per-field validation errors

- **WHEN** an authenticated visitor submits the booking form with an empty `attendeeName` or `attendeePhone`
- **THEN** the action returns `fail(400, { code: 'VALIDATION', message, attendeeName, attendeePhone })`; the page re-renders with the error message ("Nama wajib diisi." or "No. HP wajib diisi.") above the form; the previously-entered values are pre-filled in the form so the user can fix and re-submit.

### Requirement: Event detail page surfaces the registration deadline in the metadata

When the `events.registrationClosesAt` column is set, the event detail page SHALL show the registration deadline in the booking panel as a small meta line above the CTA (e.g. "Pendaftaran ditutup pada 20 Oktober 2026 pukul 23.59"). When the column is null, the meta line is omitted.

#### Scenario: An event with a registration deadline

- **WHEN** a visitor views `/events/{slug}` for an event with `registrationClosesAt = "2026-10-20T23:59:00+07:00"`
- **THEN** the booking panel renders a meta line "Pendaftaran ditutup pada 20 Oktober 2026 pukul 23.59" above the CTA.

#### Scenario: An event with no registration deadline

- **WHEN** a visitor views `/events/{slug}` for an event with `registrationClosesAt = null`
- **THEN** the booking panel does not render the deadline meta line; the CTA is bookable up to the event's `startsAt`.
