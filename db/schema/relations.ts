import { relations } from "drizzle-orm";
import { events } from "./events";
import { eventCategories } from "./event-categories";
import { categories } from "./categories";

export const eventsRelations = relations(events, ({ many }) => ({
	eventCategories: many(eventCategories)
}));

export const eventCategoriesRelations = relations(eventCategories, ({ one }) => ({
	event: one(events, {
		fields: [eventCategories.eventId],
		references: [events.id]
	}),
	category: one(categories, {
		fields: [eventCategories.categoryId],
		references: [categories.id]
	})
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	eventCategories: many(eventCategories)
}));
