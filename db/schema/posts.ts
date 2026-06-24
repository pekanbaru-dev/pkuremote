import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';

export const posts = pgTable(
	'posts',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		authorId: uuid('author_id')
			.notNull()
			.references(() => profiles.id, { onDelete: 'restrict' }),
		excerpt: text('excerpt').notNull(),
		body: text('body').notNull(),
		publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
		publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
		authorIdIdx: index('posts_author_id_idx').on(table.authorId)
	})
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
