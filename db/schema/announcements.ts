import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const announcements = pgTable(
	"announcements",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		title: text("title").notNull(),
		body: text("body").notNull(),
		publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		publishedAtIdx: index("announcements_published_at_idx").on(table.publishedAt)
	})
);

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
