import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { posts } from "./posts";

/**
 * post_slug_redirects — stores old slugs when a published post's slug is
 * changed. The public blog route checks this table on 404 and issues a 301
 * redirect to the current slug, keeping backlinks and SEO intact.
 *
 * Cascade-deletes when the parent post is deleted, so stale redirects never
 * accumulate for removed content.
 */
export const postSlugRedirects = pgTable(
	"post_slug_redirects",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		oldSlug: text("old_slug").notNull(),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		oldSlugIdx: uniqueIndex("post_slug_redirects_old_slug_idx").on(table.oldSlug)
	})
);

export type PostSlugRedirect = typeof postSlugRedirects.$inferSelect;
export type NewPostSlugRedirect = typeof postSlugRedirects.$inferInsert;
