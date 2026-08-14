import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userRoleEnum = pgEnum("user_role", ["user", "editor", "admin"]);

/**
 * profiles — the app-facing display record, 1:1 with `users` via a shared
 * primary key (`profiles.id === users.id`), exactly mirroring the former
 * `profiles.id → auth.users.id` shape so `registrations`/`posts` FKs are
 * unaffected. Provisioned in the OIDC callback (no DB trigger). No Row Level
 * Security — access control lives in `$lib/server/` and `hooks.server.ts`.
 *
 * `role` controls editorial access: 'user' (default) can write drafts,
 * 'editor' can review and publish, 'admin' has full access.
 */
export const profiles = pgTable("profiles", {
	id: uuid("id")
		.primaryKey()
		.references(() => users.id, { onDelete: "cascade" }),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	role: userRoleEnum("role").notNull().default("user"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
