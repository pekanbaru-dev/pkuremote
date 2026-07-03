import { pgTable, uuid, text, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable(
	"categories",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		name: text("name").notNull().unique(),
		slug: text("slug").notNull().unique()
	},
	(table) => ({
		slugIdx: index("categories_slug_idx").on(table.slug)
	})
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
