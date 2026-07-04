/**
 * Server-only events service barrel.
 *
 * Re-exports the Drizzle-backed data-access functions for `+page.server.ts`
 * and `+server.ts` files. NOT safe for client-side import — pulls in
 * `$lib/server/db` (the Drizzle client) and the `postgres` driver.
 */
export {
	getUpcomingEvents,
	getPastEvents,
	getAllEvents,
	getEventById,
	getEventBySlug,
	getEventsByCategorySlug,
	getAllCategories,
	getCategoryBySlug
} from "./db-events.ts";

export {
	createEvent,
	updateEvent,
	deleteEvent,
	validateEventInput,
	computeRemainingSlots,
	diffCategoryIds,
	isUniqueViolation,
	EventWriteError,
	type EventWriteErrorCode,
	type EventWriteInput
} from "./db-event-writes.ts";

export { parseEventFormData, type ParsedEventForm } from "./event-form.ts";
