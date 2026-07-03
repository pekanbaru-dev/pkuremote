/**
 * Public surface for the `events` feature (client-safe).
 *
 * Consumers SHALL import only from `$lib/features/events` for the
 * component / type public API. The data-access service is server-only
 * (it imports from `$lib/server/db`) and is re-exported from
 * `$lib/server/events` for `+page.server.ts` / `+server.ts` callers.
 */
export type { Event, EventStatus, EventCategory, EventCategoryRef } from "./types.ts";
export { buildEventJsonLd, buildLandingJsonLd } from "./services/json-ld.ts";
export { default as EventCard } from "./components/event-card.svelte";
export { default as EventList } from "./components/event-list.svelte";
export { default as EventDetailHero } from "./components/event-detail-hero.svelte";
export { default as EventBookingCta } from "./components/event-booking-cta.svelte";
export { default as EventPriceBlock } from "./components/event-price-block.svelte";
export { default as EventQuotaMeter } from "./components/event-quota-meter.svelte";
