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
	getEventBySlug,
	getEventsByCategorySlug,
	getAllCategories,
	getCategoryBySlug
} from "./db-events.ts";
