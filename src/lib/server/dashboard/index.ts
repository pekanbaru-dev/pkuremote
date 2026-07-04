/**
 * Server-only dashboard metrics barrel. NOT safe for client-side import —
 * pulls in the Drizzle client.
 */
export {
	getDashboardMetrics,
	computeFillPercent,
	type DashboardMetrics,
	type DashboardRecentRegistration,
	type DashboardUpcomingEvent
} from "./db-dashboard.ts";
