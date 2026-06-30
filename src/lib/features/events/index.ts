/**
 * Public surface for the `events` feature.
 *
 * Consumers SHALL import only from `$lib/features/events`, never from the
 * nested `components/`, `services/`, or `types.ts` files. This is enforced
 * by the architecture convention documented in AGENTS.md.
 */
export type { Event, EventStatus, EventCategory } from "./types.ts";
export { getUpcomingEvents, getPastEvents, getEventBySlug } from "./services/dummy-events.ts";
export { buildEventJsonLd } from "./services/json-ld.ts";
export { default as EventCard } from "./components/event-card.svelte";
export { default as EventList } from "./components/event-list.svelte";
export { default as EventDetailHero } from "./components/event-detail-hero.svelte";
export { default as EventBookingCta } from "./components/event-booking-cta.svelte";
export { default as EventPriceBlock } from "./components/event-price-block.svelte";
export { default as EventQuotaMeter } from "./components/event-quota-meter.svelte";
