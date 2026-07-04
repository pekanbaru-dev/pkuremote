/**
 * Server-only dashboard metrics service. Computes its figures with aggregate
 * SQL (COUNT/SUM) plus two small `LIMIT`ed list queries — it never pulls whole
 * tables into memory. Lives under `src/lib/server/` so SvelteKit keeps it out
 * of the client bundle; invoked only from the admin-gated `/admin` load.
 *
 * `computeFillPercent` is pure (no I/O) so the zero-quota guard is unit-tested
 * without a database.
 */
import { asc, count, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { events, registrations } from "../../../../db/schema";

/** Registration statuses that count as an active booking. */
const ACTIVE_STATUSES = ["confirmed", "attended"] as const;

export type DashboardRecentRegistration = {
	id: string;
	attendeeName: string;
	eventId: string;
	eventTitle: string;
	createdAt: string;
};

export type DashboardUpcomingEvent = {
	id: string;
	title: string;
	startsAt: string;
};

export type DashboardMetrics = {
	totalEvents: number;
	upcomingEvents: number;
	activeRegistrations: number;
	/** Overall capacity fill as a whole percentage, or `null` when there are no
	 *  quota-bearing events (avoids a meaningless divide-by-zero). */
	capacityFill: number | null;
	recentRegistrations: DashboardRecentRegistration[];
	upcomingList: DashboardUpcomingEvent[];
};

/**
 * Overall capacity fill = `Σ(booked) ÷ Σ(quota)` as a rounded percentage.
 * Returns `null` when `Σ(quota)` is zero (no quota-bearing events) so the UI
 * can render a neutral placeholder instead of dividing by zero. Pure.
 */
export function computeFillPercent(sumQuota: number, sumBooked: number): number | null {
	if (!Number.isFinite(sumQuota) || sumQuota <= 0) return null;
	return Math.round((sumBooked / sumQuota) * 100);
}

/** Compute the admin dashboard metrics with aggregate + `LIMIT`ed queries. */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
	const [totalRow] = await db.select({ value: count() }).from(events);
	const [upcomingRow] = await db
		.select({ value: count() })
		.from(events)
		.where(eq(events.status, "upcoming"));
	const [regsRow] = await db
		.select({ value: count() })
		.from(registrations)
		.where(inArray(registrations.status, [...ACTIVE_STATUSES]));

	// Capacity across quota-bearing events only. `remainingSlots` is non-null
	// whenever `quota` is (the create/booking paths keep that invariant), but
	// coalesce defensively so a stray null can't null out the whole sum.
	const [capacityRow] = await db
		.select({
			sumQuota: sql<string>`coalesce(sum(${events.quota}), 0)`,
			sumBooked: sql<string>`coalesce(sum(${events.quota} - coalesce(${events.remainingSlots}, ${events.quota})), 0)`
		})
		.from(events)
		.where(isNotNull(events.quota));

	const recentRows = await db
		.select({
			id: registrations.id,
			attendeeName: registrations.attendeeName,
			createdAt: registrations.createdAt,
			eventId: events.id,
			eventTitle: events.title
		})
		.from(registrations)
		.innerJoin(events, eq(events.id, registrations.eventId))
		.where(inArray(registrations.status, [...ACTIVE_STATUSES]))
		.orderBy(desc(registrations.createdAt))
		.limit(5);

	const upcomingRows = await db
		.select({ id: events.id, title: events.title, startsAt: events.startsAt })
		.from(events)
		.where(eq(events.status, "upcoming"))
		.orderBy(asc(events.startsAt))
		.limit(5);

	return {
		totalEvents: totalRow?.value ?? 0,
		upcomingEvents: upcomingRow?.value ?? 0,
		activeRegistrations: regsRow?.value ?? 0,
		capacityFill: computeFillPercent(
			Number(capacityRow?.sumQuota ?? 0),
			Number(capacityRow?.sumBooked ?? 0)
		),
		recentRegistrations: recentRows.map((r) => ({
			id: r.id,
			attendeeName: r.attendeeName,
			eventId: r.eventId,
			eventTitle: r.eventTitle,
			createdAt: r.createdAt.toISOString()
		})),
		upcomingList: upcomingRows.map((e) => ({
			id: e.id,
			title: e.title,
			startsAt: e.startsAt.toISOString()
		}))
	};
}
