## Why

GitHub issues [#3](https://github.com/pekanbaru-dev/pkuremote/issues/3) "View Available Events" and [#4](https://github.com/pekanbaru-dev/pkuremote/issues/4) "View Event Details" define two public-facing event features. The detail page at `/events/[slug]` exists and is covered by the `events` capability spec, and the homepage already renders an "Event Akan Datang" / "Event Sebelumnya" preview, but there is no dedicated `/events` listing page — the footer "Events Calendar" link and the spec-mandated "Lihat semua" deep-link both 404. The change introduces the missing listing page and locks down the detail page against issue #4's acceptance criteria, so both issues can be closed and the events feature has a single, testable home on the site.

## What Changes

- **Add a dedicated event listing route** at `src/routes/events/+page.svelte` (with a co-located `+page.server.ts` for SSR data loading) that renders the full upcoming and past event lists with deep-linkable section anchors. This is the page the homepage "Lihat semua" link and the footer "Events Calendar" link resolve to. Includes: per-section `<h2 id="…">` anchors, the same `EventCard` used on the homepage, an `EmptyState` for the upcoming section, and an omit-when-empty rule for the past section (mirrors the homepage behavior so the two surfaces feel like one).
- **Add per-page SEO for the listing** — unique `<title>`, `meta description`, canonical URL, and `og:`/Twitter Card tags via the existing `$lib/server/seo` helper. No JSON-LD on the listing (the schema is per-event on the detail page, not a list-of-events collection).
- **Verify and lock down the event detail page** at `/events/[slug]` against issue #4's acceptance criteria: banner, name, description, date/time, location, price (normal / promo strikethrough / "GRATIS" label), quota + remaining slots with progress bar, "Booking Sekarang" CTA (sticky panel on desktop, floating action button on mobile), and disabled state with "Kuota penuh" label when `remainingSlots = 0`. The existing implementation already covers all of these; the spec deltas codify them as testable requirements.
- **Add a "back to events" affordance** on the detail page — a quiet hairline-underline link above the hero returning the visitor to `/events` (preserves the editorial restraint: no chrome, no back button, just a labeled text link).
- **Update the homepage** to expose the spec's "Lihat semua" link whenever past events are truncated to 6 on the homepage preview. With 3 dummy events today the link stays hidden, but the threshold is wired so the listing page is reachable as soon as the data grows. The footer "Events Calendar" link is already correct.
- **Add an events spec delta** at `openspec/changes/add-events-list-and-detail/specs/events/spec.md` capturing the new listing-page requirements and pinning the detail-page ACs.
- **Verification**: `pnpm check`, `pnpm lint`, `pnpm test:unit -- --run`; one new Playwright test that navigates `/` → footer "Events Calendar" → listing → first event card → `/events/{slug}` and asserts the back-link round-trip; a second unit test that mounts the listing page in two states (with and without past events) and asserts the omit-when-empty behavior.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `events`: Adds a dedicated listing page requirement (full upcoming + past sections, deep-link anchors, SEO meta, "Lihat semua" threshold on the homepage preview) and a detail-page back-link affordance. The existing data shape, dummy service, components, and barrel exports stay stable; only the route and the spec requirements change.

## Impact

- **Routes (new):**
  - `src/routes/events/+page.svelte` — listing page markup.
  - `src/routes/events/+page.server.ts` — SSR loader calling `getUpcomingEvents()` and `getPastEvents()`.
- **Routes (modified):**
  - `src/routes/events/[slug]/+page.svelte` — add a "Kembali ke semua event" link above the hero.
  - `src/routes/+page.svelte` — wire the "Lihat semua" link to the new `/events` route when past events are truncated; existing footer link is unchanged.
- **Spec:**
  - `openspec/changes/add-events-list-and-detail/specs/events/spec.md` — new delta with two new requirements (`Dedicated event listing page` and `Event detail page links back to the listing`).
- **Components reused (no new components):** `EventCard`, `EventList`, `EmptyState` (`$lib/components/ui/empty-state`). No new primitives; no new shadcn-svelte installs.
- **Services reused (no new service):** `getUpcomingEvents` and `getPastEvents` from `$lib/features/events` are sufficient — the listing just consumes them both.
- **SEO helper reused:** the existing `<svelte:head>` patterns from `src/routes/events/[slug]/+page.svelte` (or `$lib/server/seo` if present) are mirrored; no new SEO infrastructure.
- **Public surface:** `/events` becomes a real, indexable page; `sitemap.xml` already lists `/events/[slug]` entries and is unchanged. No domain or DNS impact.
- **No new runtime dependencies.**
- **Out of repo:** none.
- **Closes:** GitHub issues #3 and #4.
