## Context

The database-backed `getUpcomingEvents()` service currently filters strictly on `events.status = "upcoming"`. The homepage, `/events`, category-filtered listings, and `sitemap.xml` all consume that service, so a `live` event is omitted from each surface. The `Event` type and admin workflow already support the `live` status.

## Goals / Non-Goals

**Goals:**

- Make `live` events visible anywhere active/upcoming events are listed.
- Keep active events sorted by `startsAt`.
- Give visitors a clear visual and accessible indication that an event is currently live.
- Add regression coverage without changing the database schema.

**Non-Goals:**

- No new event status or automatic status calculation.
- No separate live-events section or new route.
- No changes to past-event behavior, booking behavior, or admin status controls.

## Decisions

- Extend the existing `getUpcomingEvents()` query to select both `upcoming` and `live` statuses. This keeps the fix in the shared server boundary and automatically covers the homepage, listing page, category filtering, and sitemap. A separate `getLiveEvents()` query would duplicate loading and ordering logic; route-level filtering would leave other consumers inconsistent.
- Keep one active-events collection and order it by ascending `startsAt`. This is the smallest behavior change and preserves the current listing contract. A dedicated section could better emphasize live events but would require additional route data, markup, and layout decisions.
- Render the live indicator in `event-card.svelte` only when `event.status === "live"`, using existing project status/badge styling and an accessible text label. Non-live cards remain visually unchanged.
- Cover the data behavior with a service/query regression test where the existing test harness supports it, and cover the card behavior with the existing component test suite. The acceptance path also checks homepage and `/events` consumers because they share the service.

## Risks / Trade-offs

- [Risk] A live event may appear in the same section as upcoming events rather than at the top. → [Mitigation] Preserve chronological ordering now; a dedicated live section can be proposed separately if product wants stronger emphasis.
- [Risk] The shared query affects sitemap membership as well as visible listings. → [Mitigation] Include a sitemap regression check and treat the added live URL as intentional public behavior.
- [Risk] Existing tests may mock database access in a way that makes a direct service test expensive. → [Mitigation] Keep the implementation change limited to the existing query and add the narrowest reliable regression coverage around the affected consumer.

## Migration Plan

No database migration is required. Deploy the application code, then verify an event with `status = "live"` appears on `/`, `/events`, its category-filtered URL, and `/sitemap.xml`. Rollback is a code revert if needed.

## Open Questions

None for this fix.
