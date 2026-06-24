import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const events = pgTable(
	'events',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		title: text('title').notNull(),
		startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
		location: text('location').notNull(),
		excerpt: text('excerpt').notNull(),
		body: text('body').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		startsAtIdx: index('events_starts_at_idx').on(table.startsAt)
	})
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
