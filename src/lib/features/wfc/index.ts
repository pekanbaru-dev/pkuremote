/**
 * Public surface for the WFC curator feature.
 *
 * Consumers SHALL import only from `$lib/features/wfc`.
 */
export type { Cafe, CafeAmenity, CafeBestHour, CafePolicy, CafeReview } from "./types.js";
export { default as WfcSection } from "./components/wfc-section.svelte";
export { default as WfcCafeDetail } from "./components/wfc-cafe-detail.svelte";
