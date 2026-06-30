import type { Event } from "../types.ts";
import { PUBLIC_SITE_URL } from "$env/static/public";

/**
 * Build the JSON-LD `<script type="application/ld+json">` string for an
 * event. The script tag is built as a string and inserted into `<svelte:head>`
 * via `{@html ...}`. The opening `<script` is escaped to `<\u003cscript`
 * to prevent the Svelte parser from closing the outer `<script>` block.
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
	const safeOpen = '<\\u003cscript type="application/ld+json">';
	const safeClose = "<\\u003c/script>";
	return safeOpen + json + safeClose;
}
