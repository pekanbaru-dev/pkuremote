import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { users, oauthAccounts, profiles } from "../../../../db/schema";
import { AUTH_PROVIDER, type OidcClaims } from "./oidc";

/** Normalize an email for storage/lookup/admin comparison: trim + lower-case. */
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/**
 * Derive the profile display name from the `name` claim, falling back to the
 * email's local part, then to "Pengguna" when that is empty.
 */
export function deriveDisplayName(name: string | null, normalizedEmail: string): string {
	const trimmed = name?.trim();
	if (trimmed) return trimmed;
	const localPart = normalizedEmail.split("@")[0] ?? "";
	return localPart.length > 0 ? localPart : "Pengguna";
}

/**
 * Resolve or create the identity for a verified OIDC sign-in, replacing the
 * former `handle_new_user` database trigger. The email claim is normalized
 * first and used for every lookup/insert. Match precedence:
 *
 *   1. `oauth_accounts` by `(provider, sub)` → reuse its user.
 *   2. else `users` by normalized email → link a new `oauth_accounts` row.
 *   3. else create `users` + `oauth_accounts` + `profiles`.
 *
 * Idempotent: a returning user's second sign-in creates no duplicate rows.
 * Runs in a single transaction.
 */
export async function provisionUser(claims: OidcClaims): Promise<{ id: string }> {
	const email = normalizeEmail(claims.email);
	const displayName = deriveDisplayName(claims.name, email);
	const avatarUrl = claims.picture;

	return db.transaction(async (tx) => {
		// 1. Existing linked account for this provider identity.
		const [existingAccount] = await tx
			.select({ userId: oauthAccounts.userId })
			.from(oauthAccounts)
			.where(
				and(eq(oauthAccounts.provider, AUTH_PROVIDER), eq(oauthAccounts.providerUid, claims.sub))
			)
			.limit(1);
		if (existingAccount) {
			// Back-fill a missing profile defensively; no-op if it already exists.
			await tx
				.insert(profiles)
				.values({ id: existingAccount.userId, displayName, avatarUrl })
				.onConflictDoNothing();
			return { id: existingAccount.userId };
		}

		// 2. Existing user with the same normalized email → link this provider.
		const [existingUser] = await tx
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (existingUser) {
			await tx
				.insert(oauthAccounts)
				.values({ provider: AUTH_PROVIDER, providerUid: claims.sub, userId: existingUser.id })
				.onConflictDoNothing();
			await tx
				.insert(profiles)
				.values({ id: existingUser.id, displayName, avatarUrl })
				.onConflictDoNothing();
			return { id: existingUser.id };
		}

		// 3. Brand-new identity: create all three rows.
		const [created] = await tx
			.insert(users)
			.values({ email, emailVerified: claims.emailVerified })
			.returning({ id: users.id });
		const userId = created.id;
		await tx
			.insert(oauthAccounts)
			.values({ provider: AUTH_PROVIDER, providerUid: claims.sub, userId });
		await tx.insert(profiles).values({ id: userId, displayName, avatarUrl });
		return { id: userId };
	});
}
