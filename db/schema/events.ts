import { pgTable, uuid, text, timestamp, integer, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Events table — the canonical event row.
 *
 * The `category` column is the typed enum used for the EventCard's footer
 * CTA label (`workshop` → "Book Now", `meetup` / `talk` → "RSVP", else
 * "Register"). It is INDEPENDENT from the M2M `categories` relation
 * (a free-form list driven by the `event_categories` join table) — the
 * `category` column is the "primary category" for UX, the M2M list is
 * for display/filter. The two may overlap but are not required to.
 */
export const events = pgTable(
	"events",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		slug: text("slug").notNull().unique(),
		title: text("title").notNull(),
		startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
		endsAt: timestamp("ends_at", { withTimezone: true }),
		location: text("location").notNull(),
		excerpt: text("excerpt").notNull(),
		body: text("body").notNull(),
		bannerUrl: text("banner_url"),
		status: text("status").notNull().default("upcoming"),
		quota: integer("quota"),
		remainingSlots: integer("remaining_slots"),
		priceNormal: integer("price_normal"),
		pricePromo: integer("price_promo"),
		category: text("category"),
		registrationClosesAt: timestamp("registration_closes_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		startsAtIdx: index("events_starts_at_idx").on(table.startsAt),
		slugIdx: index("events_slug_idx").on(table.slug),
		statusCheck: check("events_status_check", sql`${table.status} IN ('upcoming', 'live', 'past')`),
		categoryCheck: check(
			"events_category_check",
			sql`${table.category} IN ('workshop', 'talk', 'meetup', 'social', 'other') OR ${table.category} IS NULL`
		),
		remainingSlotsCheck: check(
			"events_remaining_slots_check",
			sql`${table.remainingSlots} IS NULL OR ${table.remainingSlots} >= 0`
		),
		quotaCheck: check("events_quota_check", sql`${table.quota} IS NULL OR ${table.quota} > 0`),
		pricePromoCheck: check(
			"events_price_promo_check",
			sql`${table.pricePromo} IS NULL OR ${table.priceNormal} IS NULL OR ${table.pricePromo} < ${table.priceNormal}`
		)
	})
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
