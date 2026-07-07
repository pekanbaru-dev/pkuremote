/**
 * Events service — reads from the `events` table via Drizzle,
 * with categories eager-loaded through the `event_categories` join.
 *
 * Replaces the previous hardcoded `services/dummy-events.ts`. Callers
 * (`+page.server.ts` files and the homepage) get the same `Event` shape
 * they did before; the data source is now the database.
 */
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { events, eventCategories, categories } from "../../../../db/schema";
import type { Event, EventCategoryRef } from "../../features/events/types.ts";

type EventRow = typeof events.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;

function toIso(d: Date | string | null | undefined): string | undefined {
	if (d == null) return undefined;
	if (typeof d === "string") return d;
	return d.toISOString();
}

function rowToEvent(row: EventRow, cats: EventCategoryRef[]): Event {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		startsAt: row.startsAt.toISOString(),
		endsAt: toIso(row.endsAt),
		location: row.location,
		excerpt: row.excerpt,
		body: row.body,
		bannerUrl: row.bannerUrl ?? undefined,
		status: row.status as Event["status"],
		quota: row.quota ?? undefined,
		remainingSlots: row.remainingSlots ?? undefined,
		priceNormal: row.priceNormal ?? undefined,
		pricePromo: row.pricePromo ?? undefined,
		category: (row.category as Event["category"]) ?? undefined,
		registrationClosesAt: toIso(row.registrationClosesAt),
		categories: cats
	};
}

/**
 * Load the joined `categories` array for a set of event ids, returning a
 * Map keyed by event id. Events with no categories are absent from the
 * map; the caller is responsible for defaulting to `[]`.
 */
async function loadCategoriesForEvents(
	eventIds: string[]
): Promise<Map<string, EventCategoryRef[]>> {
	const out = new Map<string, EventCategoryRef[]>();
	if (eventIds.length === 0) return out;

	const joinRows = await db
		.select({
			eventId: eventCategories.eventId,
			id: categories.id,
			name: categories.name,
			slug: categories.slug
		})
		.from(eventCategories)
		.innerJoin(categories, eq(categories.id, eventCategories.categoryId))
		.where(inArray(eventCategories.eventId, eventIds));

	for (const row of joinRows) {
		const list = out.get(row.eventId) ?? [];
		list.push({ id: row.id, name: row.name, slug: row.slug });
		out.set(row.eventId, list);
	}
	return out;
}

/**
 * Return all events whose `startsAt` is in the future, sorted ascending
 * (soonest first), each carrying an eager-loaded `categories` array.
 */
export async function getUpcomingEvents(): Promise<Event[]> {
	const rows: EventRow[] = await db
		.select()
		.from(events)
		.where(eq(events.status, "upcoming"))
		.orderBy(asc(events.startsAt));

	const catMap = await loadCategoriesForEvents(rows.map((r) => r.id));
	return rows.map((r) => rowToEvent(r, catMap.get(r.id) ?? []));
}

/**
 * Return all events whose `startsAt` is in the past, sorted descending
 * (most recent first), each carrying an eager-loaded `categories` array.
 */
export async function getPastEvents(): Promise<Event[]> {
	const rows: EventRow[] = await db
		.select()
		.from(events)
		.where(eq(events.status, "past"))
		.orderBy(desc(events.startsAt));

	const catMap = await loadCategoriesForEvents(rows.map((r) => r.id));
	return rows.map((r) => rowToEvent(r, catMap.get(r.id) ?? []));
}

/**
 * Return every event (all statuses), sorted by `startsAt` descending (most
 * recent first), each carrying its eager-loaded `categories`. Used by the
 * admin event-management list, which spans upcoming, live, and past events.
 */
export async function getAllEvents(): Promise<Event[]> {
	const rows: EventRow[] = await db.select().from(events).orderBy(desc(events.startsAt));
	const catMap = await loadCategoriesForEvents(rows.map((r) => r.id));
	return rows.map((r) => rowToEvent(r, catMap.get(r.id) ?? []));
}

/**
 * Look up a single event by its id. Returns `undefined` when not found; the
 * admin edit route translates that to a 404.
 */
export async function getEventById(id: string): Promise<Event | undefined> {
	const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1);
	if (!row) return undefined;
	const catMap = await loadCategoriesForEvents([row.id]);
	return rowToEvent(row, catMap.get(row.id) ?? []);
}

/**
 * Look up a single event by its slug. Returns `undefined` when not found;
 * the route's `+page.server.ts` translates that to a 404.
 */
export async function getEventBySlug(slug: string): Promise<Event | undefined> {
	const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
	if (!row) return undefined;
	const catMap = await loadCategoriesForEvents([row.id]);
	return rowToEvent(row, catMap.get(row.id) ?? []);
}

/**
 * Return every event (upcoming and past) whose joined categories include
 * the given slug, sorted ascending by `startsAt`. An event matches when
 * ANY of its `categories[i].slug` equals the param.
 */
export async function getEventsByCategorySlug(slug: string): Promise<Event[]> {
	const matched = await db
		.select({ id: events.id })
		.from(events)
		.innerJoin(eventCategories, eq(eventCategories.eventId, events.id))
		.innerJoin(categories, eq(categories.id, eventCategories.categoryId))
		.where(eq(categories.slug, slug));

	const ids: string[] = matched.map((m: { id: string }) => m.id);
	if (ids.length === 0) return [];

	const rows: EventRow[] = await db
		.select()
		.from(events)
		.where(inArray(events.id, ids))
		.orderBy(asc(events.startsAt));

	const catMap = await loadCategoriesForEvents(rows.map((r) => r.id));
	return rows.map((r) => rowToEvent(r, catMap.get(r.id) ?? []));
}

/**
 * Return every category, sorted by `name` ascending.
 */
export async function getAllCategories(): Promise<EventCategoryRef[]> {
	const rows: CategoryRow[] = await db
		.select({ id: categories.id, name: categories.name, slug: categories.slug })
		.from(categories)
		.orderBy(asc(categories.name));
	return rows;
}

/**
 * Look up a single category by its slug. Returns `undefined` when not found.
 */
export async function getCategoryBySlug(slug: string): Promise<EventCategoryRef | undefined> {
	const [row] = await db
		.select({ id: categories.id, name: categories.name, slug: categories.slug })
		.from(categories)
		.where(eq(categories.slug, slug))
		.limit(1);
	return row;
}
