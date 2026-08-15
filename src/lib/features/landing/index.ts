/**
 * Public surface for the `landing` feature (client-safe).
 *
 * Consumers SHALL import only from `$lib/features/landing`, never from the
 * nested `components/` files directly.
 */
export { default as HeroSection } from "./components/hero-section.svelte";
export type { HeroSectionProps } from "./components/hero-section.svelte";

export { default as CategoryTiles } from "./components/category-tiles.svelte";

export { default as EventsSection } from "./components/events-section.svelte";
export type { EventsSectionProps } from "./components/events-section.svelte";

export { default as CommunitiesSection } from "./components/communities-section.svelte";
export type { CommunitiesSectionProps } from "./components/communities-section.svelte";

export { default as ArticlesSection } from "./components/articles-section.svelte";

export { default as PartnersCta } from "./components/partners-cta.svelte";
export type { PartnersCatProps } from "./components/partners-cta.svelte";
