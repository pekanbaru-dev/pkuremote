import type { Event } from "../types.ts";
import { PUBLIC_SITE_URL } from "$env/static/public";

/**
 * Build the JSON-LD `<script type="application/ld+json">` string for an
 * event. The string is inserted via `{@html ...}` in `<svelte:head>` — Svelte's
 * parser treats `{@html}` arguments opaquely, so no tag escaping is needed.
 */
export function buildEventJsonLd(event: Event): string {
	const payload = {
		"@context": "https://schema.org",
		"@type": "Event",
		name: event.title,
		startDate: event.startsAt,
		...(event.endsAt ? { endDate: event.endsAt } : {}),
		eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
		eventStatus: "https://schema.org/EventScheduled",
		location: {
			"@type": "Place",
			name: event.location,
			address: event.location
		},
		organizer: {
			"@type": "Organization",
			name: "PKUBersua",
			url: PUBLIC_SITE_URL
		},
		...(event.priceNormal === undefined
			? { isAccessibleForFree: true }
			: {
					offers: {
						"@type": "Offer",
						price: event.pricePromo ?? event.priceNormal,
						priceCurrency: "IDR",
						availability:
							event.remainingSlots === 0
								? "https://schema.org/SoldOut"
								: "https://schema.org/InStock"
					}
				})
	};
	const json = JSON.stringify(payload);
	return `<script type="application/ld+json">${json}</script>`;
}
