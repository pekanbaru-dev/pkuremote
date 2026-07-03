/**
 * Event type — a feature-layer superset of the `events` Drizzle row plus
 * the eager-loaded M2M `categories` array.
 *
 * - The Drizzle `events` table (in `db/schema/events.ts`) holds the row.
 * - The `categories` array is loaded via the `event_categories` join table
 *   and exposes each linked category's `id`, `name`, and `slug`.
 * - The optional typed `category` enum (separate from the M2M list) is the
 *   "primary category" used for the EventCard footer CTA label
 *   (`workshop` → "Book Now", `meetup` / `talk` → "RSVP", else "Register").
 *   It is independent from the M2M `categories` array and may not overlap
 *   with it; the two fields have different roles.
 */
export type EventStatus = "upcoming" | "live" | "past";

export type EventCategory = "workshop" | "talk" | "meetup" | "social" | "other";

export type EventCategoryRef = {
	id: string;
	name: string;
	slug: string;
};

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
	/** ISO-8601 string. When set and the current time is past this value,
	 *  the event is no longer bookable. When undefined, no registration
	 *  deadline applies (bookings accepted up to `startsAt`). */
	registrationClosesAt?: string;
	/** M2M list of categories this event is tagged with. Empty when the
	 *  event has no categories assigned. Always populated as an array
	 *  (never `undefined`) so callers can iterate without a guard. */
	categories: EventCategoryRef[];
};
