import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * users — the app-owned identity record. Auth/identity data only: email,
 * verification, creation time; the app-facing display record lives in
 * `profiles`, which shares this table's `id` (1:1), so downstream FKs
 * (`registrations.user_id`, `posts.author_id` → `profiles.id`) point at a
 * stable identity.
 *
 * `email` is stored NORMALIZED (trimmed + lower-cased) by the OIDC callback,
 * and the `UNIQUE` constraint enforces case-insensitive uniqueness on that
 * normalized value: the same mailbox in different casing (`Ayu@Pku.dev` vs
 * `ayu@pku.dev`) cannot create two rows.
 */
export const users = pgTable("users", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
