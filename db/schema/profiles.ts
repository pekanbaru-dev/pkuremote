import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "../auth-ref";

export const profiles = pgTable("profiles", {
	id: uuid("id")
		.primaryKey()
		.references(() => authUsers.id, { onDelete: "cascade" })
		.default(sql`gen_random_uuid()`),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
