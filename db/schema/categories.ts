import { pgTable, uuid, text, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const CATEGORY_SCOPES = ["both", "article", "event"] as const;
export type CategoryScope = (typeof CATEGORY_SCOPES)[number];

export const categories = pgTable(
	"categories",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		name: text("name").notNull().unique(),
		slug: text("slug").notNull().unique(),
		scope: text("scope").notNull().default("both")
	},
	(table) => ({
		slugIdx: index("categories_slug_idx").on(table.slug),
		scopeCheck: check("categories_scope_check", sql`${table.scope} IN ('both', 'article', 'event')`)
	})
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
