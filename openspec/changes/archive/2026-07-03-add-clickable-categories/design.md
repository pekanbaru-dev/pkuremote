## Context

The events feature is the public-facing backbone of PKUBersua: homepage preview, dedicated listing, detail page with booking. The UI already renders a rich `Event` shape (banner, status, quota, pricing, categories) but the data layer is a hardcoded TypeScript array in `src/lib/features/events/services/dummy-events.ts`, and the underlying `events` table in Supabase is a 7-column stub. Categories are free-form strings (`categoryLabel`, `categorySecondary`) on each event — they can't be queried, shared across events, or filtered as a first-class concept. The Drizzle infrastructure is in place (`src/lib/server/db/client.ts`, `db/schema/`, migrations), so wiring events to Supabase is a matter of expanding the schema and rewriting the service functions.

The user goal: make each category pill on the event card clickable, and have it filter the event archive at `/events?category=…`. The minimal implementation also needs to make categories queryable, which means lifting them into their own table with an M2M join to events — keeping free-form strings on the event wouldn't let the database filter efficiently. So the change is a coordinated three-part move: (1) schema (events columns + categories + event_categories), (2) service (dummy → Drizzle queries), (3) UI (pills become links, listing gains a filter chip).

## Goals / Non-Goals

**Goals:**

- Wire the events feature to Supabase via Drizzle so the listing, homepage, and detail page all read from the DB instead of a hardcoded array.
- Introduce `categories` as a first-class entity with a many-to-many relation to events via `event_categories`.
- Expand the `events` table to carry the full shape the UI already renders (`slug`, `endsAt`, `bannerUrl`, `status`, `quota`, `remainingSlots`, `priceNormal`, `pricePromo`, `category`).
- Make every category pill on the `EventCard` a real `<a href="/events?category={slug}">` link.
- Make the listing page read `?category=…` and filter at the DB layer; render a removable filter chip when filtered; adapt the `EmptyState` copy and `<svelte:head>` for the filter context.
- Keep the same `Event` type API for callers (the field names `categoryLabel` / `categorySecondary` change to `categories[]`, but every existing callsite is updated in the same change).
- Ship a Drizzle migration and an updated seed so `pnpm db:migrate && pnpm db:seed` brings up a working dev environment.

**Non-Goals:**

- No admin UI for managing categories or events (that's a separate change — there's a `Panel Admin` GitHub issue #20 open for it).
- No filter persistence (no "save my filter" cookies / localStorage).
- No multi-select filters (only one category at a time for now).
- No full-text search on the listing (filter by category only; the rest of the search field stays as homepage chrome).
- No rewrite of the `posts` or `announcements` features — the Supabase wiring is events-only in this change.
- No RLS / per-user authorization changes on the new tables (the project reads events as the public anon role; writes happen via the seed script with the service role).
- No new SEO surface — the filtered listing is intentionally not a canonical URL; the canonical stays at `/events` (the filter is a transient state).

## Decisions

### Decision: M2M via a join table, not a JSONB column on `events`

The category list per event is a real many-to-many (a "Workshop" event could also be "Hands-on"; a "Business" event could also be "Networking"). Modeling it as a join table gives us: referential integrity, indexed lookups ("find all events tagged 'workshop'"), and clean updates (changing a category name updates one row, not N events). The downside is one extra table and one more query (with a join), but the events dataset is tiny and the join is eager-loaded once per page load.

**Alternatives considered:**

- _JSONB array column on `events` (e.g. `category_slugs: text[]`)_. Rejected: no referential integrity, can't easily rename a category without scanning all events, and Postgres array queries are slower than join queries for this access pattern.
- _Comma-separated string column on `events`_. Rejected: no integrity, no indexing, no clean migration to a proper schema later.
- _A single `category_id` FK on `events` (one-to-many)_. Rejected: doesn't model the real "an event can have multiple categories" relationship.

### Decision: Keep the typed `category` enum on `events` alongside the M2M `categories` list

The `EventCard`'s footer CTA label ("Book Now" / "RSVP" / "Register") is derived from a typed enum, not from the free-form M2M categories. The enum drives UX (the action verb), the M2M list drives display (the pills) and filter (the archive). Keeping them separate avoids overloading the M2M `slug` with a typed-enum role, and lets a future admin pick a "primary category" for CTA without restructuring the M2M relation. They're independent fields.

**Alternatives considered:**

- _Drop the typed enum, derive the CTA from the first M2M category by sort order_. Rejected: couples UX behavior to data ordering, which is fragile.
- _Drop the M2M list, just use the typed enum + a label_. Rejected: doesn't model M2M; can't filter by free-form label.

### Decision: Filter at the DB layer, not in the Svelte component

The listing's `+page.server.ts` `load()` reads `url.searchParams.get("category")` and returns a filtered result. The Svelte component receives `{ upcoming, past, filter: { name, slug } | null }` and renders. The HTML response is server-rendered for the filtered view (no client-side filter flicker, no JS required for the filter to work). The DB query is a single statement with a join, not N+1.

**Alternatives considered:**

- _Filter in the Svelte component after fetching all events_. Rejected: the dataset could grow large; sending every event to the client for client-side filtering wastes bandwidth and doesn't scale.
- _Filter via a separate `+server.ts` endpoint + client-side fetch_. Rejected: extra round-trip and adds JS dependency to a feature that should work without JS.

### Decision: Filter chip is a small text + inline link, not a button group

The filter chip reads "Filter: {category.name} × Hapus filter" where the "× Hapus filter" is an `<a href="/events">` (an inline text link with a `×` glyph). It mirrors the quiet editorial tone of the site's other affordances (the `.link-quiet` class). A button group with "All / Workshop / Networking" tabs was considered but rejected: it implies a richer filtering UI than the current change delivers, and a future change can add it without rework.

**Alternatives considered:**

- _A horizontal pill bar of all categories above the listing_. Rejected: scope creep; the change is "make pills clickable + filter", not "build a category sidebar".
- _A `<select>` dropdown of categories_. Rejected: hides the available categories; a pill bar is more discoverable.

### Decision: EventCard outer `<a>` becomes a `<div>` with one inner `<a>` for the body

To make the pills real `<a>` elements without nested `<a>`s (which is invalid HTML and breaks browsers), the card structure becomes: a `<div>` outer wrapper, a single inner `<a>` covering the banner + title + excerpt (the "main" click target), the pills as their own `<a>`s above the inner link in document order, and the date row + CTA as plain `<div>`s / `<span>`s below. The footer CTA is intentionally NOT a link — keeping the card to 2-3 navigable elements (body, primary pill, secondary pill) instead of 4 (body, primary pill, secondary pill, CTA) avoids "where does this click go?" confusion. The CTA is decorative; the booking action lives on the detail page.

**Alternatives considered:**

- _Keep the outer `<a>`, use `<button>` for pills with `onclick` navigation + `stopPropagation`_. Rejected: hacky, breaks middle-click / right-click "open in new tab" on pills, and SvelteKit's `<a>` prefetch is lost.
- _Make the entire card a `<div>` with no primary click target, only the pills + title are links_. Rejected: loses the "click anywhere on the card" UX; a visitor who clicks the banner expects to go to the detail page.

### Decision: Service is `$lib/server/db`-backed; components are server-rendered

The new `db-events.ts` service imports from `$lib/server/db` (the Drizzle client), which is server-only. All call sites are already in `+page.server.ts` files (the listing loader, the detail loader, the homepage's `+page.svelte` which calls the service at module top-level — which works because the homepage is fully server-rendered). No new client-side data fetching. The homepage calls `getUpcomingEvents()` at module load; this still works because the homepage renders on the server.

Wait — the homepage `+page.svelte` runs at module load time. If the service is now async (DB query), the homepage's module-load call would need to become async. Let me think about this.

Actually, looking at the homepage:

```ts
const events = getUpcomingEvents();
```

If `getUpcomingEvents()` becomes async (returns a Promise), this breaks. The fix: move the data fetch to a `+page.server.ts` `load()` and read it from `data.events` in the `+page.svelte`. This is the same pattern as the listing page. So the homepage also gets a `+page.server.ts` in this change.

**Refined sub-decision:** the homepage `+page.svelte` migrates to using `data.events` from a co-located `+page.server.ts` `load()`. The module-load call goes away. This is a small, well-contained refactor that the events service migration makes necessary.

### Decision: Categories and event_categories migrations are generated, not hand-written

`pnpm db:generate` produces a SQL file capturing the column additions and the two new tables. The migration file is committed alongside the schema changes. This is the project's existing pattern (per AGENTS.md: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`).

### Decision: Seed the 6 categories in a deterministic order

The seed script inserts 6 categories (`Workshop`, `Hands-on`, `Culture`, `Festival`, `Business`, `Networking`) in a fixed order, then inserts the 3 events, then inserts 6 join rows (2 per event). The seed uses `onConflictDoNothing` so re-running is idempotent. The `slug` values are the URL-safe lowercase form of the `name` (kebab-case for multi-word).

## Risks / Trade-offs

- **Supabase must be reachable from the dev environment for the listing to show events.** A developer who runs `pnpm dev` without first running `pnpm db:migrate && pnpm db:seed` will see an empty listing and a possibly-failing DB query. → Mitigation: add a one-line "First-time setup" note to the README pointing to the migration + seed steps. The empty listing already renders the `EmptyState`, so the page is not broken — just empty. A future change can add a `pnpm db:setup` script.
- **The homepage's module-load call to `getUpcomingEvents()` becomes async; the homepage gains a `+page.server.ts`.** This is a small refactor but it changes the homepage's data flow. → Mitigation: the new pattern is identical to the listing page's pattern, which is already in production. The refactor is mechanical (move the call into `+page.server.ts`, read from `data.events` in the `+page.svelte`).
- **Two columns on the same table have related data (`category` enum and `categories[]` M2M) which could drift.** An admin (future change) must keep them in sync. → Mitigation: add a check constraint at the DB level? Overkill for now. Document the relationship in `db/schema/events.ts` with a comment: `category` is the "primary category for CTA" and `categories` is the M2M list for display/filter. They may overlap but are independent fields. A future admin UI will surface both with a clear "primary" indicator.
- **The Drizzle migration is generated; if the schema and migration drift in code review, the DB will mismatch.** → Mitigation: the project's existing review process checks that `pnpm db:generate` output is committed alongside the schema changes. The Drizzle docs are explicit about this. No new risk.
- **The filter chip's "× Hapus filter" link uses `href="/events"` (a relative URL).** If a future change makes the listing page locale-prefixed (e.g. `/id/events`), this link would need to be locale-aware. → Mitigation: out of scope for this change; the site is not localized today. A future i18n change can revisit.
- **The `events` table's `status` column is stored (not derived).** An admin (or a future change) must keep it in sync with `startsAt` / `endsAt` vs the current time. → Mitigation: for now, the seed sets the status explicitly. A future change can add a Postgres trigger or a server-side check to auto-derive `status` from `startsAt` / `endsAt`. The events spec already documents that `status` is "derived from `startsAt`/`endsAt` vs the current time but allowed to be set explicitly" — the explicit form is what we ship.
- **Eager-loading `categories` on every event query adds a join.** → Negligible at this scale (3 events). A future change with hundreds of events can add a data loader (e.g. Dataloader) or denormalize the categories into the event row.
- **The 6 seed categories encode the editorial framing the dummy data already had.** If the operator later wants to re-categorize the events, they have to update the seed + re-run it (not just edit a config). → Mitigation: a future admin UI is the right answer. For now, "edit the seed" is acceptable.

## Migration Plan

This is a non-destructive additive change. No destructive migration of the `events` table (the new columns are nullable except `slug` and `status`, both of which get defaults in the seed).

**Deploy steps:**

1. Merge the change to `main`. CI runs `pnpm check` → `pnpm lint` → `pnpm test:unit -- --run` → `pnpm test:e2e` → `pnpm build`.
2. In the dev Supabase project: `pnpm db:migrate` (applies the Drizzle migration: new events columns + new `categories` + new `event_categories` tables).
3. `pnpm db:seed` (inserts 3 events, 6 categories, 6 join rows).
4. Production: same steps against the prod Supabase project, plus a `pnpm build` before deploying.
5. Verify in a browser: `/` shows 3 event cards with pills, clicking a pill goes to `/events?category=…` and shows only matching events, the filter chip's "Hapus filter" returns to `/events` and shows all events.

**Rollback strategy:**

- The Drizzle migration can be rolled back with `pnpm db:migrate` (down migration) or by manually dropping the new tables and columns. The dummy-events file is deleted, not renamed — a rollback would need to restore the dummy service from git history.
- A revert of the merge commit restores the previous state (hardcoded dummy data, no filter, no categories). This is the safest rollback path.

**No DNS changes. No new env vars. No dependency changes.**

## Open Questions

- _Should the `events` table's `status` column be derived or stored? \_Currently stored (per the seed); a future change can add a trigger to derive it. The spec allows both._ → Resolved: stored in the seed; derivation is a future change.
- _Should the filter be a single category (as in the proposal) or multi-select?_ → Single for now. Multi-select is a future change.
- _Should the `Event.type.ts` `Event` type stay a hand-written type, or be derived from the Drizzle schema?_ → Hand-written superset (the Drizzle `$inferSelect` gives the row shape; the `categories[]` is loaded by the service and added). The type lives in `types.ts` and the service's return type is the source of truth.
- _Should the homepage's "Event Sebelumnya" section use the new filter (so a visitor on the homepage can click a pill to see all "Workshop" events)?_ → Yes, the change makes pills clickable on the homepage too (it's the same `EventCard` component). No additional work needed.
- _Should the `category` typed enum on `events` be a Postgres `text` column with a CHECK constraint, or a native `enum` type?_ → `text` with a CHECK constraint is simpler and easier to evolve (adding a new category is a single ALTER, not a new enum value + migration). Use `text` + `CHECK (category IN ('workshop', 'talk', 'meetup', 'social', 'other'))`.
