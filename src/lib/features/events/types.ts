/**
 * Event type — strict superset of the `events` DB row in db/schema/events.ts.
 *
 * Required fields mirror the DB schema. Optional fields (banner, status,
 * quota, prices, category) are supplied by the dummy data service and let
 * the UI render a richer page without requiring a schema migration. A real
 * backend that returns only the DB row will see the optional fields as
 * `undefined` and the UI degrades gracefully.
 */
export type EventStatus = "upcoming" | "live" | "past";

export type EventCategory = "workshop" | "talk" | "meetup" | "social" | "other";

export type Event = {
	id: string;
	slug: string;
	title: string;
	startsAt: string;
	endsAt?: string;
	location: string;
	excerpt: string;
	body: string;
	bannerUrl?: string;
	status: EventStatus;
	quota?: number;
	remainingSlots?: number;
	priceNormal?: number;
	pricePromo?: number;
	category?: EventCategory;
	/** Free-form category label (max 16 chars) shown as a primary-tinted pill
	 *  on the event card. Distinct from the typed `category` enum — the pill
	 *  text is operator-controlled copy. */
	categoryLabel?: string;
	/** Free-form secondary category label (max 16 chars) shown as a
	 *  secondary-tinted pill. */
	categorySecondary?: string;
};
