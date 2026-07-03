## Why

The events feature today reads from a hardcoded TypeScript array in `src/lib/features/events/services/dummy-events.ts` and the `events` DB table is a minimal stub (only `id`, `title`, `startsAt`, `location`, `excerpt`, `body`, `createdAt`) — it doesn't even have `slug`, `endsAt`, `bannerUrl`, or any pricing/quota fields the UI already renders. Visitors want to filter the event archive by category, but categories are just free-form strings on the dummy data (`categoryLabel`, `categorySecondary`) and can't be queried or shared across events.

The change wires events to Supabase end-to-end, introduces categories as a first-class entity with a many-to-many relation to events, expands the `events` table to carry the full shape the UI already uses, and makes each category pill on the event card a real link that filters the listing at `/events?category={slug}`.

## What Changes

### Schema (Drizzle, in `db/schema/`)

- **Expand the `events` table** to carry the full shape the UI renders. New columns: `slug` (text, unique, not null), `ends_at` (timestamp nullable), `banner_url` (text nullable), `status` (text not null, default `'upcoming'`), `quota` (integer nullable), `remaining_slots` (integer nullable), `price_normal` (integer nullable, IDR), `price_promo` (integer nullable, IDR), `category` (text nullable, the typed enum used for CTA selection: `'workshop' | 'talk' | 'meetup' | 'social' | 'other'`). The `id`, `title`, `startsAt`, `location`, `excerpt`, `body`, `createdAt` columns stay as-is.
- **Add a `categories` table** (`db/schema/categories.ts`): `id` (uuid, PK, default `gen_random_uuid()`), `name` (text, not null, unique), `slug` (text, not null, unique). Six categories seeded: `Workshop` (`workshop`), `Hands-on` (`hands-on`), `Culture` (`culture`), `Festival` (`festival`), `Business` (`business`), `Networking` (`networking`).
- **Add an `event_categories` join table** (`db/schema/event-categories.ts`): `event_id` (uuid, FK to `events.id` on delete cascade), `category_id` (uuid, FK to `categories.id` on delete cascade), composite primary key on `(event_id, category_id)`. Many-to-many: an event can have any number of categories, a category can appear on any number of events.
- **Generate a new Drizzle migration** capturing the column additions and the two new tables.

### Seed (`db/seed.ts`)

- **Seed the 3 events** with the same data the dummy service had: "Traditional Talam Masterclass" (2026-10-24, slug `traditional-talam-masterclass`, Culinary, 25k IDR, 30 quota / 12 remaining), "Riau Heritage Night" (2026-11-02, free, 60 / 24), "Local Business Mixer" (2026-11-15, 15k, 50 / 17).
- **Seed the 6 categories** and the join rows: evt-001 → `[Workshop, Hands-on]`, evt-002 → `[Culture, Festival]`, evt-003 → `[Business, Networking]`. The seed remains idempotent (uses `onConflictDoNothing` and a deterministic ordering).

### Service layer (`src/lib/features/events/`)

- **Replace `services/dummy-events.ts`** with `services/db-events.ts` that queries Supabase via the Drizzle client at `$lib/server/db`. Functions (same signatures, so callers don't change): `getUpcomingEvents()` (events whose `startsAt >= now`, sorted ascending), `getPastEvents()` (events whose `startsAt < now`, sorted descending), `getEventBySlug(slug)`. New functions: `getEventsByCategorySlug(slug)`, `getAllCategories()`, `getCategoryBySlug(slug)`. Each function eagerly loads the event's `categories` via a join so the UI gets the full shape in one round-trip.
- **Update `types.ts`**: replace `categoryLabel?: string` and `categorySecondary?: string` with `categories: { id: string; name: string; slug: string }[]`. Keep the typed `category?: EventCategory` enum for the CTA selection (it's the "primary category" used for the `Book Now` / `RSVP` / `Register` button label, distinct from the free-form M2M list). The `Event` type in `types.ts` becomes a superset of the Drizzle `$inferSelect` type plus the loaded `categories` array.
- **Update the barrel** (`index.ts`) to export the new service functions. Drop the dummy service export.

### EventCard (`src/lib/features/events/components/event-card.svelte`)

- **Restructure the outer wrapper** from a single `<a href="/events/{slug}">` to a `<div>` with one inner `<a>` covering the banner + title + excerpt. This lets the pills and the date row be sibling navigable elements without nested `<a>`s. The footer CTA stays as text (not a link — preserves the existing "Book Now" / "RSVP" / "Register" affordance without making every card a 4-link card).
- **Pills iterate `event.categories`**. Each pill is an `<a href="/events?category={category.slug}">` styled identically to today (`bg-primary/10` or `bg-secondary/10`, `rounded-full`, `text-label-md`). When the event has no categories, no pills render (graceful degradation per the existing partial-response rule).
- **CTA label** still derives from `event.category` (the typed enum): `workshop` → "Book Now", `meetup`/`talk` → "RSVP", otherwise "Register".

### Listing page (`src/routes/events/`)

- **Server-side filtering**: `+page.server.ts` reads `url.searchParams.get("category")` and, when set, returns only events whose joined categories include that slug. The HTML response is server-rendered for the filtered view (no client-side flicker). When unset, behavior matches today.
- **Filter chip**: when `?category=…` is set, a chip renders above the listing body reading "Filter: {category.name} × Hapus filter". The "× Hapus filter" portion is an inline `<a href="/events">`. The chip is omitted when the param is not set.
- **Empty state copy adapts to the filter**: when the filter yields zero events, the upcoming section's `EmptyState` reads "Belum ada event '{category.name}' — coba hapus filter atau pilih kategori lain." Past section is omitted when empty (unchanged).
- **`<svelte:head>` updates** with the filter context: `og:title` becomes "Event {category.name} — PKUBersua" when filtered (the canonical URL still points at `${PUBLIC_SITE_URL}/events` — the filtered view is a transient state, not a canonical landing page).

### Tests

- **Update `src/lib/features/events/components/event-card.test.ts`** (new): two tests — pill is an anchor with the right `href` to the filtered listing, the body link is a separate anchor with `href="/events/{slug}"`.
- **Update `src/routes/events/events-page.svelte.spec.ts`** with a third state: when `data.filteredCategory = { name: "Workshop", slug: "workshop" }` is passed, the page renders the filter chip and only matching events.
- **Update `src/routes/events/+page.server.test.ts`** (new, server project): the load function returns only events whose categories include the requested slug; returns the unfiltered lists when the param is missing; returns `{ filter: null }` when unfiltered.
- **Update `e2e/category-filter.e2e.ts`** (new): round-trip — `/` → first card pill → `/events?category={slug}` → filter chip "Hapus filter" → `/events` → unfiltered listing. The existing `e2e/events-listing.e2e.ts` stays unchanged (it doesn't click a pill).
- **Update the existing `event-detail-hero.test.ts`** if it asserts on the `Event` type shape (it only tests `formatDateLong` — no change needed).

### Verification

- `pnpm check`, `pnpm lint`, `pnpm test:unit -- --run`, `pnpm test:e2e`, `pnpm build`. Manual: run `pnpm db:migrate && pnpm db:seed` against the dev Supabase project, then `pnpm dev` and click a pill to confirm the round-trip in a real browser.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `events`: (1) The `Event` type shape changes — `categoryLabel` / `categorySecondary` free-form strings are replaced by a `categories: { id, name, slug }[]` M2M array; the typed `category` enum is retained for CTA selection. (2) The data source moves from a hardcoded TypeScript array to a Supabase (Drizzle) query. (3) The events table gains the missing columns (`slug`, `endsAt`, `bannerUrl`, `status`, `quota`, `remainingSlots`, `priceNormal`, `pricePromo`, `category`). (4) The `EventCard` pills become clickable links to the filtered listing. (5) The listing page gains a `?category=…` query param and a removable filter chip. (6) New service functions: `getEventsByCategorySlug`, `getAllCategories`, `getCategoryBySlug`.
- `drizzle-integration`: gains two new tables (`categories`, `event_categories`) and 9 new columns on `events`. The schema export and the migration history both update.

## Impact

- **Schema (new + modified):**
  - `db/schema/events.ts` — 9 new columns; primary key and existing columns unchanged.
  - `db/schema/categories.ts` — new file.
  - `db/schema/event-categories.ts` — new file.
  - `db/schema/index.ts` — re-export the two new tables.
  - `db/migrations/0000_*.sql` … `db/migrations/NNNN_*.sql` — one new migration (Drizzle generates it; we commit the file).
- **Seed (modified):**
  - `db/seed.ts` — insert 3 events, 6 categories, 6 join rows; keep idempotent.
- **Feature service (modified):**
  - `src/lib/features/events/types.ts` — `categories: { id, name, slug }[]` replaces `categoryLabel` / `categorySecondary`; `category?: EventCategory` retained.
  - `src/lib/features/events/services/dummy-events.ts` — deleted.
  - `src/lib/features/events/services/db-events.ts` — new file, Drizzle queries.
  - `src/lib/features/events/index.ts` — export new service functions; drop dummy export.
- **Components (modified):**
  - `src/lib/features/events/components/event-card.svelte` — outer `<a>` → `<div>`, pills become `<a>`s to filtered listing.
- **Routes (modified):**
  - `src/routes/events/+page.server.ts` — read `url.searchParams.get("category")`, filter at the DB, return `filter` and `filteredCategory` in the data load.
  - `src/routes/events/+page.svelte` — render the filter chip when `data.filter` is set, adapt `<svelte:head>` and `EmptyState` copy.
- **Routes (unmodified):**
  - `src/routes/events/[slug]/+page.svelte` — no change; the back-link from the previous change still works. The detail page reads `event.categories` via the same service function.
  - `src/routes/+page.svelte` (homepage) — no change; the homepage calls `getUpcomingEvents()` and the new shape still includes `categories` for the pills.
- **Tests (new + modified):**
  - `src/lib/features/events/components/event-card.test.ts` — new.
  - `src/routes/events/events-page.svelte.spec.ts` — modify to add filter state.
  - `src/routes/events/+page.server.test.ts` — new.
  - `e2e/category-filter.e2e.ts` — new.
  - `src/routes/homepage-events-listing.svelte.spec.ts` — keep; the homepage's `getPastEvents` mock still works (it returns `Event[]` with the new shape).
- **Spec:**
  - `openspec/changes/add-clickable-categories/specs/events/spec.md` — delta for: new `categories` schema, M2M relation, pill-as-link, filter param, filter chip, updated `Event` type shape.
  - `openspec/changes/add-clickable-categories/specs/drizzle-integration/spec.md` — delta for: new tables and new events columns.
- **Public surface:** `/events` gains an optional `?category=…` query param. No new routes, no new public endpoints. SEO: the filtered view is intentionally transient — the canonical URL stays `${PUBLIC_SITE_URL}/events` (filtered views are not indexable as their own canonical page).
- **Dependencies:** no new packages — Drizzle and postgres-js are already installed.
- **Out of repo:** no env-var changes; the existing `DATABASE_URL` is used.
- **Risk:** the Supabase project must be migrated (`pnpm db:migrate`) and seeded (`pnpm db:seed`) before the dev server will show events. A README snippet or a single `pnpm db:setup` script is a small follow-up to land alongside this change.
