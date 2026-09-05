import { pgTable, uuid, text, timestamp, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles";
import { categories } from "./categories";

export const postStatusEnum = pgEnum("post_status", [
	"draft",
	"in_review",
	"published",
	"archived",
	"rejected"
]);

export const posts = pgTable(
	"posts",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		title: text("title").notNull(),
		slug: text("slug").notNull(),
		authorId: uuid("author_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "restrict" }),
		excerpt: text("excerpt").notNull(),
		body: text("body").notNull(),
		coverImageUrl: text("cover_image_url"),
		categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
		tags: text("tags")
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),
		status: postStatusEnum("status").notNull().default("draft"),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
		reviewedBy: uuid("reviewed_by").references(() => profiles.id, { onDelete: "set null" }),
		reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
		reviewNote: text("review_note"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		slugIdx: uniqueIndex("posts_slug_idx").on(table.slug),
		publishedAtIdx: index("posts_published_at_idx").on(table.publishedAt),
		authorIdIdx: index("posts_author_id_idx").on(table.authorId),
		statusIdx: index("posts_status_idx").on(table.status)
	})
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
