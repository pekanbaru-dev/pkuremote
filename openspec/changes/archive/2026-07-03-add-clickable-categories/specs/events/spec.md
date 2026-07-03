## ADDED Requirements

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

The `Event` type at `src/lib/features/events/types.ts` SHALL define `categories: { id: string; name: string; slug: string }[]` as a non-optional field (an event has zero or more categories; the array is empty when the event has no categories assigned). The previous free-form `categoryLabel?: string` and `categorySecondary?: string` fields SHALL be removed. The typed `category?: EventCategory` enum field SHALL be retained (it's the "primary category" used for the `EventCard` footer CTA label, distinct from the M2M display list).

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
