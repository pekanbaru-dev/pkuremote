## 1. Core Implementation

- [x] 1.1 Update `getUpcomingEvents()` so it returns both `upcoming` and `live` events while preserving ascending `startsAt` ordering.
- [x] 1.2 Add a conditional accessible live-status badge to `event-card.svelte` for events with `status = "live"`.

## 2. Regression Coverage

- [x] 2.1 Add or update tests proving live events are included in the active-event query and rendered with the live badge.
- [x] 2.2 Run typecheck, lint, and the relevant unit/component tests; verify homepage, `/events`, category filtering, and sitemap behavior through the shared query path.
