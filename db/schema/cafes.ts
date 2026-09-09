import {
	pgTable,
	uuid,
	text,
	integer,
	doublePrecision,
	boolean,
	jsonb,
	timestamp,
	index,
	check
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export type CafeBestHour = [string, string];
export type CafeAmenity = [string, string];
export type CafePolicy = [string, string, "ok" | "warn"];
export type CafeReview = [string, string, string];

export const cafes = pgTable(
	"cafes",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		slug: text("slug").notNull().unique(),
		name: text("name").notNull(),
		score: integer("score").notNull().default(0),
		occupancy: text("occupancy").notNull(),
		distance: text("distance").notNull(),
		price: text("price").notNull(),
		closing: text("closing").notNull(),
		fit: text("fit").notNull(),
		wfcCategory: text("wfc_category").notNull().default("wfc-friendly"),
		imageUrl: text("image_url"),
		address: text("address").notNull(),
		latitude: doublePrecision("latitude").notNull(),
		longitude: doublePrecision("longitude").notNull(),
		wifi: text("wifi").notNull(),
		outlets: text("outlets").notNull(),
		atmosphere: text("atmosphere").notNull(),
		duration: text("duration").notNull(),
		tagline: text("tagline").notNull(),
		liveStatus: text("live_status").notNull(),
		liveNote: text("live_note").notNull(),
		tags: jsonb("tags").$type<string[]>().notNull().default([]),
		bestHours: jsonb("best_hours").$type<CafeBestHour[]>().notNull().default([]),
		amenities: jsonb("amenities").$type<CafeAmenity[]>().notNull().default([]),
		policies: jsonb("policies").$type<CafePolicy[]>().notNull().default([]),
		reviews: jsonb("reviews").$type<CafeReview[]>().notNull().default([]),
		published: boolean("published").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		slugIdx: index("cafes_slug_idx").on(table.slug),
		scoreCheck: check("cafes_score_check", sql`${table.score} BETWEEN 0 AND 100`),
		categoryCheck: check(
			"cafes_category_check",
			sql`${table.wfcCategory} IN ('wfc-friendly', 'meetup-friendly', 'quick-visit')`
		)
	})
);

export type CafeRow = typeof cafes.$inferSelect;
export type NewCafeRow = typeof cafes.$inferInsert;
