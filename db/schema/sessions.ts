import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * sessions — DB-backed sessions: an opaque, high-entropy token in an httpOnly
 * cookie, validated against this table on every request.
 *
 * `id` is a HASH of the opaque, high-entropy token held in the browser's
 * httpOnly cookie — never the raw token — so a database read cannot
 * reconstruct a live cookie. `expires_at` is set by the app to a fixed
 * absolute 6 hours after creation (not sliding); a lookup that finds an
 * expired row deletes it (delete-on-encounter). Deleting the user cascades.
 */
export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		userIdIdx: index("sessions_user_id_idx").on(table.userId)
	})
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
