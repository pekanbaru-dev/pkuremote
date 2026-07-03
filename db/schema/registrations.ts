import { pgTable, uuid, text, timestamp, uniqueIndex, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles";
import { events } from "./events";

/**
 * Registrations table — a logged-in user's booking for an event.
 *
 * A user can register for the same event at most once (enforced by the
 * unique composite on `(userId, eventId)`); the `registrationNumber`
 * unique constraint backs the short, human-readable ticket id printed
 * on the user's ticket page and at the door.
 */
export const registrations = pgTable(
	"registrations",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		registrationNumber: text("registration_number").notNull().unique(),
		attendeeName: text("attendee_name").notNull(),
		attendeePhone: text("attendee_phone").notNull(),
		status: text("status").notNull().default("confirmed"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		userEventUnique: uniqueIndex("registrations_user_id_event_id_unique").on(
			table.userId,
			table.eventId
		),
		userIdIdx: index("registrations_user_id_idx").on(table.userId),
		eventIdIdx: index("registrations_event_id_idx").on(table.eventId),
		statusCheck: check(
			"registrations_status_check",
			sql`${table.status} IN ('confirmed', 'cancelled', 'attended', 'no_show')`
		)
	})
);

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
