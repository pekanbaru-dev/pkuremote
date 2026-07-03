## Context

The PKUBersua site already ships event code at `src/lib/features/events/` (the `Event` type, `dummy-events.ts` service with `getUpcomingEvents` / `getPastEvents` / `getEventBySlug`, and six Svelte components — `EventCard`, `EventList`, `EventDetailHero`, `EventBookingCta`, `EventPriceBlock`, `EventQuotaMeter`) and the detail route at `src/routes/events/[slug]/+page.svelte` with its co-located `+page.server.ts` loader. The events capability spec at `openspec/specs/events/spec.md` already codifies the data shape, the homepage preview, the detail page, the price / quota / booking behavior, the `EmptyState` rule, and the folder layout. The two GitHub issues this change closes (#3 and #4) are partially met: the detail page satisfies all of #4, but the dedicated `/events` listing page (issue #3's "Navigasi — Pengunjung dapat membuka halaman detail event" plus the homepage spec's "Lihat semua" deep-link and the footer "Events Calendar" link) is missing — the link `href="/events"` on `src/routes/+page.svelte:565` currently 404s.

This change is small and surgical: one new route pair (`+page.svelte` + `+page.server.ts`), a back-link on the existing detail page, a "Lihat semua" reveal on the homepage preview, a delta spec, and tests. No new components, no new services, no new SEO infrastructure, no new dependencies.

## Goals / Non-Goals

**Goals:**

- Ship a server-rendered `/events` listing page that mirrors the homepage's "Event Akan Datang" / "Event Sebelumnya" sectioning, deep-linkable via `<h2 id="…">` anchors, and reachable from the homepage preview's "Lihat semua" link and the footer "Events Calendar" link.
- Lock down the existing detail page against issue #4's ACs via the spec delta (it already meets them; the delta makes the behavior testable and reviewable).
- Add a quiet "Kembali ke semua event" hairline link on the detail page so the round-trip `/events` → `/events/{slug}` → `/events` is one click.
- Reveal the homepage "Lihat semua" link the moment past events are truncated to 6 — the threshold is wired but invisible until the data grows past 3.
- Stay within the `src/lib/features/events/` slice (no new components; reuse `EventList`, `EventCard`, and `EmptyState`).

**Non-Goals:**

- No filtering, search, or category tabs on the listing page (the spec calls for a quiet bulletin, not a filterable archive; a future change can add them).
- No pagination on the listing page — the dummy dataset is 3 events today and the `events` table won't outgrow a single page in the foreseeable future; if it does, a future change can add it.
- No JSON-LD on the listing (Schema.org `Event` is per-event on the detail page; a `ItemList` schema is not warranted at this scale).
- No backend integration (the listing uses the same `dummy-events.ts` service as the detail page and homepage).
- No new `Event` type fields (the listing consumes the existing `startsAt` ordering — no new "isArchived" or "isFeatured" flag).
- No changes to the booking flow (`mailto:` stays as-is), the brand palette, the typography, or the site-wide layout.

## Decisions

### Decision: Reuse the homepage's "Event Akan Datang" / "Event Sebelumnya" composition on the listing page

The listing page reuses the same `EventList` + `EventCard` + `EmptyState` pattern the homepage uses, so the two surfaces feel like one bulletin — the listing is "the full edition" of the homepage preview, not a separate UI. Section ordering, sort order (upcoming ascending, past descending), and the omit-when-empty rule for the past section are all identical.

**Alternatives considered:**

- _Single "Semua event" chronological list_. Rejected: the spec and the homepage both split on "Akan Datang" / "Sebelumnya" and the editorial tone reads better with the two sections; a single interleaved list buries the upcoming events below stale ones.
- _Grid layout (`grid-cols-1 desktop:grid-cols-2`)_. Rejected: the existing `EventList` is a vertical `<ul>` and the editorial brief is "quiet bulletin, not a marketing grid"; a 2-column grid competes with the EventCard's banner.

### Decision: Section anchors are stable `id` attributes on the `<h2>`, not URL params

The listing page uses `<h2 id="upcoming">` and `<h2 id="past">` so deep links from social posts, the homepage, and the footer can target `/events#upcoming` and `/events#past` directly. URL params (`/events?section=past`) were rejected because they require JS to scroll on load and don't degrade to a meaningful URL when shared.

### Decision: The listing is server-rendered, not client-rendered

`src/routes/events/+page.server.ts` calls `getUpcomingEvents()` and `getPastEvents()` in the `load()` and returns both arrays; the `+page.svelte` renders the result. Server-rendering is mandatory because the events spec already requires SSR for the detail page (for SEO and JSON-LD); the listing shares the same constraint and the same loader pattern, so the two routes feel like one surface.

**Alternatives considered:**

- _Client-rendered with `+page.ts` (universal load)_. Rejected: the listing would be empty in the initial HTML, hurting SEO and LCP, and would diverge from the detail page's SSR pattern.
- _Shared `+layout.server.ts` for `/events/*` that pre-fetches both events and the slug's event_. Rejected: over-engineering — the detail page already does its own slug-based load and the listing doesn't need the per-slug lookup; two flat loaders is the simpler shape.

### Decision: "Lihat semua" threshold is `past.length > 6` on the homepage

The homepage's past-events preview truncates to 6 cards and shows a "Lihat semua" link only when more than 6 exist. The threshold is wired but currently invisible because the dummy data has 3 past-eligible events. A small `{#if past.length > 6}` block on the homepage is the only change to `+page.svelte` beyond the footer link (which is already correct).

### Decision: Back-link is a quiet hairline-underline text link, not a back button

The detail page adds a `<a href="/events">← Kembali ke semua event</a>` above the hero, styled with the existing `.link-quiet` class from `src/routes/layout.css` (the same treatment used for the footer "Events Calendar" link). A back button or chevron icon was rejected as out-of-register with the editorial tone; the brief is "content is the hero, chrome recedes."

### Decision: Listing `<svelte:head>` mirrors the detail page's meta pattern, no new helper

The listing page duplicates the `<title>`, `meta description`, `og:`, and Twitter Card tags inline in `<svelte:head>` — same pattern as `src/routes/events/[slug]/+page.svelte:21-38`, no shared `seo()` helper. A `seo()` helper is a clean refactor but is out of scope for this change (a future change can extract it once a third route needs it; extracting now would be a YAGNI-driven half-finished abstraction).

**Alternatives considered:**

- _Extract `$lib/server/seo.ts` with a `buildEventPageSeo(event)` and `buildListingPageSeo(counts)` helper now_. Rejected: the two callsites are short and the abstraction wouldn't earn its keep until a third page needs the same meta.
- _Inline `<svelte:head>` with no comment_. Rejected: the detail page's pattern is non-obvious (canonical via `PUBLIC_SITE_URL` baked at build time) and the listing should reference the detail page so future maintainers find both together.

### Decision: No `EmptyState` for the past section (omitted entirely when empty)

Matches the existing homepage and `events` spec: when `getPastEvents()` returns `[]`, the past section is omitted entirely (no heading, no `EmptyState`, no apology) so a brand-new site doesn't apologize for an empty history. The upcoming section's `EmptyState` is also reused from `$lib/components/ui/empty-state`.

## Risks / Trade-offs

- **Two pages can drift in copy/structure** if the homepage preview and the listing diverge over time. → Both consume the same `getUpcomingEvents()` / `getPastEvents()` services and the same `EventList` / `EventCard` components; the only per-page variation is the "Lihat semua" link and the `EmptyState` copy. A shared `EventSection` component could be extracted in a future change, but for two callsites the inline duplication is clearer.
- **`PUBLIC_SITE_URL` is the only env-var in the listing's `<svelte:head>`** and it's baked at build time via the Docker `ARG`. → Same as the detail page, so the listing inherits the existing configuration; no new env vars, no new risk.
- **The "Lihat semua" link is invisible until past events exceed 6** so the change has no visible homepage diff today. → That's the intended behavior per the spec ("at most 6 events shown and a 'Lihat semua' link to `/events` if more exist"). The threshold wiring is testable via a unit test that injects a longer past-events array.
- **The listing's sort order is fixed (upcoming ascending, past descending)** with no user override. → Matches the editorial brief (quiet, sorted, non-interactive) and the existing homepage. A future change can add sort controls.
- **The detail page's "Kembali ke semua event" link assumes the user came from `/events`** but is shown unconditionally. → Acceptable: the link is a labeled text affordance, not a back button (which would imply history-based navigation); a visitor who arrived via direct URL can use the link to discover the full listing.
- **No JSON-LD on the listing means Google sees the listing as a regular page, not a structured event list.** → Acceptable at this scale (3 events, no SEO ask for a `ItemList` schema). A future change can add `ItemList` JSON-LD when the dataset grows or when a "Browse all events" rich result becomes a goal.

## Migration Plan

The change is purely additive: one new route pair, one new link on an existing route, one new spec file, and tests. There is no destructive migration.

**Deploy steps:**

1. Merge the change to `main`.
2. CI runs `pnpm check` → `pnpm lint` → `pnpm test` (unit + e2e).
3. Production build via the existing `Dockerfile` and `docker-compose.prod.yml`; no new env vars.
4. Verify `https://pkubersua.com/events` returns 200 with both sections in the HTML response.
5. Verify the homepage "Events Calendar" footer link resolves to `/events` and the round-trip `/events` → `/events/{slug}` → `/events` works.

**Rollback strategy:**

The change is a single PR that can be reverted via `git revert`. No database migrations, no DNS changes, no dependency upgrades. If the listing page is found to have a regression, reverting the merge restores the previous 404-on-`/events` behavior (the footer link would 404, which is the pre-change state).

**No data migration, no schema migration, no env-var migration.**

## Open Questions

- _Should the "Lihat semua" threshold be `> 6` or `≥ 6`?_ The current spec says "at most 6 events shown and a 'Lihat semua' link to `/events` if more exist" which reads as `> 6` (the link only appears when truncation actually happened). The homepage test will pin this.
- _Should the listing page omit the upcoming `EmptyState` if there are only past events and no upcoming?_ The current homepage behavior is to show the `EmptyState` ("Belum ada event yang akan datang") in that case, and the listing mirrors that. If a future change wants the listing to feel more archive-like (past-only with no upcoming messaging), it can override.
- _Should the "Kembali ke semua event" link be inside the hero (above the banner) or in a separate breadcrumb row?_ The current plan puts it above the hero in a quiet hairline row. A breadcrumb (`Beranda / Event / Traditional Talam Masterclass`) was considered but rejected as out-of-register for the editorial tone. Open to revisiting if usability testing shows visitors get lost.
