## ADDED Requirements

### Requirement: Dedicated event listing page at `/events`

The site SHALL expose a server-rendered event listing page at `src/routes/events/+page.svelte` (with a co-located `+page.server.ts` `load()` that calls `getUpcomingEvents()` and `getPastEvents()` from the server-only events service at `$lib/server/events/`). The page SHALL render two distinct sections in this order: an "Event Akan Datang" section (with `<h2 id="upcoming">`) listing upcoming events sorted ascending by `startsAt`, and an "Event Sebelumnya" section (with `<h2 id="past">`) listing past events sorted descending by `startsAt`. Each section SHALL render its events as a vertical list of `EventCard` components (the same component the homepage uses). The upcoming section SHALL render an `EmptyState` (from `$lib/components/ui/empty-state`) with the message "Belum ada event yang akan datang — pantau terus untuk kabar terbaru." when empty. The past section SHALL be omitted entirely from the page when empty. The page SHALL include in `<svelte:head>`: a unique `<title>` ("Event — PKUBersua"), a unique `meta description` ("Daftar event PKUBersua — kumpul, belajar, dan bersua di Pekanbaru."), a `link rel="canonical"` pointing at `${PUBLIC_SITE_URL}/events`, `og:title`, `og:description`, `og:type=website`, `og:url`, `og:site_name=PKUBersua`, and `og:locale=id_ID`. The page SHALL NOT embed JSON-LD (the structured `Event` schema lives on the per-event detail page only). The page SHALL be reachable without login and SHALL link each event card to `/events/{event.slug}` via the existing `EventCard` anchor.

#### Scenario: A visitor opens `/events` with at least one upcoming event and no past events

- **WHEN** the page is requested at `/events` and `getUpcomingEvents()` returns at least one event and `getPastEvents()` returns zero events
- **THEN** the page renders the "Event Akan Datang" section with one `EventCard` per upcoming event in chronological order, the "Event Sebelumnya" section is omitted entirely from the page, the meta title is "Event — PKUBersua", and the meta description matches the spec.

#### Scenario: A visitor opens `/events` with both upcoming and past events

- **WHEN** the page is requested at `/events` and both `getUpcomingEvents()` and `getPastEvents()` return at least one event each
- **THEN** the page renders both sections in order — upcoming first, past second — each as a vertical list of `EventCard`s, with `<h2 id="upcoming">` and `<h2 id="past">` headings, and the meta tags are present in the initial HTML response.

#### Scenario: A visitor opens `/events` with no upcoming events and at least one past event

- **WHEN** the page is requested at `/events` and `getUpcomingEvents()` returns zero events and `getPastEvents()` returns at least one event
- **THEN** the "Event Akan Datang" section renders an `EmptyState` with the message "Belum ada event yang akan datang — pantau terus untuk kabar terbaru." and the "Event Sebelumnya" section renders the past events in reverse chronological order.

#### Scenario: A visitor opens `/events` with zero events in either section

- **WHEN** the page is requested at `/events` and both `getUpcomingEvents()` and `getPastEvents()` return empty arrays
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

The event detail page at `src/routes/events/[slug]/+page.svelte` SHALL render a "Kembali ke semua event" link above the `EventDetailHero`. The link SHALL be a `<a href="/events">` styled as a quiet hairline-underline text link (the same `.link-quiet` class). The link SHALL be visible on all viewport sizes. The link SHALL be omitted only when the event is being viewed in a context where the back navigation does not apply (no such context is defined today; the link SHALL always be rendered for every event detail page).

#### Scenario: A visitor opens an event detail page

- **WHEN** a visitor navigates to `/events/{slug}` for a known slug
- **THEN** the page renders a "Kembali ke semua event" link above the event hero, and clicking the link navigates to `/events` (the listing page).

#### Scenario: A visitor uses the back-link round-trip

- **WHEN** a visitor navigates `/` → `/events` → `/events/{slug}` and clicks the "Kembali ke semua event" link
- **THEN** the browser navigates to `/events` and the page renders the "Event Akan Datang" and "Event Sebelumnya" sections as defined in the "Dedicated event listing page at `/events`" requirement.
