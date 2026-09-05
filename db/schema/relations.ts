import { relations } from "drizzle-orm";
import { events } from "./events";
import { eventCategories } from "./event-categories";
import { categories } from "./categories";
import { posts } from "./posts";
import { postSlugRedirects } from "./post-slug-redirects";
import { profiles } from "./profiles";

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
	eventCategories: many(eventCategories),
	posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(profiles, {
		fields: [posts.authorId],
		references: [profiles.id],
		relationName: "author"
	}),
	reviewer: one(profiles, {
		fields: [posts.reviewedBy],
		references: [profiles.id],
		relationName: "reviewer"
	}),
	category: one(categories, {
		fields: [posts.categoryId],
		references: [categories.id]
	}),
	slugRedirects: many(postSlugRedirects)
}));

export const postSlugRedirectsRelations = relations(postSlugRedirects, ({ one }) => ({
	post: one(posts, {
		fields: [postSlugRedirects.postId],
		references: [posts.id]
	})
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
	authoredPosts: many(posts, { relationName: "author" }),
	reviewedPosts: many(posts, { relationName: "reviewer" })
}));
