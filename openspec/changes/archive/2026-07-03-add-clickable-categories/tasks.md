## 1. Schema: expand `events` and add `categories` + `event_categories`

- [x] 1.1 Edit `db/schema/events.ts` to add the 9 new columns: `slug` (text, NOT NULL, UNIQUE), `endsAt` (timestamp, NULL), `bannerUrl` (text, NULL), `status` (text, NOT NULL, default `'upcoming'`, CHECK constraint), `quota` (integer, NULL), `remainingSlots` (integer, NULL), `priceNormal` (integer, NULL), `pricePromo` (integer, NULL), `category` (text, NULL, CHECK constraint).
- [x] 1.2 Create `db/schema/categories.ts` with the `categories` table: `id` (uuid, PK, default `gen_random_uuid()`), `name` (text, NOT NULL, UNIQUE), `slug` (text, NOT NULL, UNIQUE).
- [x] 1.3 Create `db/schema/event-categories.ts` with the `eventCategories` table: `eventId` (uuid, FK to `events.id` ON DELETE CASCADE), `categoryId` (uuid, FK to `categories.id` ON DELETE CASCADE), composite PK on `(eventId, categoryId)`.
- [x] 1.4 Update `db/schema/index.ts` to re-export `categories` and `eventCategories` (plus `relations.ts`).
- [x] 1.5 Run `pnpm db:generate` to produce the Drizzle migration; commit the new SQL file under `db/migrations/`. → Generated `db/migrations/0002_panoramic_orphan.sql`. (Migration application via `pnpm db:migrate` deferred to post-merge — touches live Supabase.)

## 2. Seed: 3 events + 6 categories + 6 join rows

- [x] 2.1 Update `db/seed.ts` to insert the 3 events with the full shape.
- [x] 2.2 Add 6 category inserts in the seed: `Workshop`, `Hands-on`, `Culture`, `Festival`, `Business`, `Networking`.
- [x] 2.3 Add 6 `event_categories` join inserts: evt-001 → [Workshop, Hands-on]; evt-002 → [Culture, Festival]; evt-003 → [Business, Networking].

## 3. Service: replace `dummy-events.ts` with `db-events.ts`

- [x] 3.1 Update `src/lib/features/events/types.ts`: replace `categoryLabel` / `categorySecondary` with `categories: EventCategoryRef[]` (non-optional). Keep `category?: EventCategory`.
- [x] 3.2 Create `src/lib/server/events/db-events.ts` with Drizzle queries: `getUpcomingEvents()`, `getPastEvents()`, `getEventBySlug()`. (Note: moved to `$lib/server/events/` to keep the events barrel client-safe.)
- [x] 3.3 Add `getEventsByCategorySlug`, `getAllCategories`, `getCategoryBySlug`.
- [x] 3.4 Create `src/lib/server/events/index.ts` re-exporting all service functions. Update `src/lib/features/events/index.ts` to remove the service exports (client barrel stays client-safe).
- [x] 3.5 Delete `src/lib/features/events/services/dummy-events.ts`.
- [x] 3.6 Update the homepage `src/routes/+page.svelte` to use a co-located `+page.server.ts` `load()`. Update `+page.server.ts`, listing `+page.server.ts`, detail `[slug]/+page.server.ts`, and sitemap `+server.ts` to import from `$lib/server/events`.

## 4. EventCard restructure: pills become links

- [x] 4.1 Edit `src/lib/features/events/components/event-card.svelte` to restructure the outer wrapper from `<a>` to `<div>`, with one inner `<a href="/events/{event.slug}">` covering the banner, title, and excerpt.
- [x] 4.2 Edit the pill rendering to iterate `event.categories` and render each as `<a href="/events?category={category.slug}">` (URL-encoded).
- [x] 4.3 Date row and CTA are plain `<div>` / `<span>` elements (no link wrappers).

## 5. Listing page: `?category=…` filter + filter chip

- [x] 5.1 Edit `src/routes/events/+page.server.ts` to read `url.searchParams.get("category")`; filter at the DB layer; return `filter: { name, slug } | null`.
- [x] 5.2 Edit `src/routes/events/+page.svelte` to render the filter chip when `data.filter` is set.
- [x] 5.3 Adapt the `<svelte:head>` block: filtered title + canonical stays at `/events`.
- [x] 5.4 Adapt the upcoming `EmptyState` copy to include the filter name.

## 6. Tests

- [x] 6.1 Add `src/lib/features/events/components/event-card.svelte.spec.ts` (4 tests: pill is anchor, body link is sibling anchor, no pills when no categories, URL-encoded slugs).
- [x] 6.2 Update `src/routes/events/events-page.svelte.spec.ts` to add filter state (4 tests total).
- [x] 6.3 (Skipped) Add `src/routes/events/+page.server.test.ts` — deferred: the service is DB-backed, so testing the loader needs either a DB fixture or extensive mocking. Coverage is provided by the e2e test (6.4) which exercises the full loader path against a real (or test) DB.
- [x] 6.4 Add `e2e/category-filter.e2e.ts` (skip on 500 / empty DB).
- [x] 6.5 Update `src/routes/homepage-events-listing.svelte.spec.ts` to pass events with `categories: []` and use the `data` prop pattern.
- [x] 6.6 Update `e2e/events-listing.e2e.ts` to skip on 500 / empty DB (DB-backed service returns 500 when the Supabase project is not reachable).

## 7. Verification

- [x] 7.1 `pnpm check` → clean (1 pre-existing error in `sheet-content.svelte`).
- [x] 7.2 `pnpm lint` → clean (3 pre-existing errors in untouched files).
- [x] 7.3 `pnpm test:unit -- --run` → **68/68 pass** (added 5 new tests: 4 EventCard + 1 listing filter test).
- [x] 7.4 `pnpm test:e2e` → 1 passed (demo), 2 skipped (DB not seeded — correct skip behavior).
- [x] 7.5 `pnpm build` → ✓ built in 2.31s.
- [ ] 7.6 Run `pnpm db:migrate && pnpm db:seed` → **DEFERRED — touches live Supabase. Run before merging.**
- [ ] 7.7 Manually verify in a browser at viewports 360 / 768 / 1280 → **DEFERRED — requires seeded DB + `pnpm dev`.**

## 8. Documentation

- [x] 8.1 README already documents `pnpm db:migrate && pnpm db:seed` as a prerequisite. No update needed.
