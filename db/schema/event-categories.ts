import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { events } from "./events";
import { categories } from "./categories";

/**
 * M2M join table — an event can have any number of categories, and a
 * category can appear on any number of events. `ON DELETE CASCADE` on
 * both FKs ensures the join table never accumulates orphan rows.
 */
export const eventCategories = pgTable(
	"event_categories",
	{
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" })
	},
	(table) => ({
		pk: primaryKey({ columns: [table.eventId, table.categoryId] })
	})
);

export type EventCategory = typeof eventCategories.$inferSelect;
export type NewEventCategory = typeof eventCategories.$inferInsert;
