import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/**
 * oauth_accounts — one row per external identity linked to a user (the OIDC
 * `sub` stored as `provider_uid`). `(provider, provider_uid)` is UNIQUE so a
 * given provider identity resolves to exactly one user; deleting the user
 * cascades. Provisioning matches on `(provider, provider_uid)` first, then
 * links by normalized email, then creates.
 */
export const oauthAccounts = pgTable(
	"oauth_accounts",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		provider: text("provider").notNull(),
		providerUid: text("provider_uid").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		providerUidUnique: uniqueIndex("oauth_accounts_provider_provider_uid_unique").on(
			table.provider,
			table.providerUid
		),
		userIdIdx: index("oauth_accounts_user_id_idx").on(table.userId)
	})
);

export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert;
