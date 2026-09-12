## Why

Events marked `live` currently disappear from every public listing even though the admin UI allows that status. This hides events at the moment they are most relevant to visitors and is a small, self-contained bug worth fixing now.

## What Changes

- Treat `upcoming` and `live` events as active events in the shared public event query.
- Keep active events visible on the homepage, `/events`, category-filtered listings, and the dynamic sitemap.
- Show a clear live-status badge on event cards.
- Add regression coverage for live-event retrieval and card rendering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `events`: public event listings and cards must include and identify events with `status = "live"`.

## Impact

- `src/lib/server/events/db-events.ts` shared read query.
- `src/lib/features/events/components/event-card.svelte` and its component test.
- Existing homepage, event listing, category filtering, and sitemap consumers receive live events automatically.
- No database schema, migration, or new dependency changes.
