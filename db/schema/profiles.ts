import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * profiles — the app-facing display record, 1:1 with `users` via a shared
 * primary key (`profiles.id === users.id`), exactly mirroring the former
 * `profiles.id → auth.users.id` shape so `registrations`/`posts` FKs are
 * unaffected. Provisioned in the OIDC callback (no DB trigger). No Row Level
 * Security — access control lives in `$lib/server/` and `hooks.server.ts`.
 */
export const profiles = pgTable("profiles", {
	id: uuid("id")
		.primaryKey()
		.references(() => users.id, { onDelete: "cascade" }),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
