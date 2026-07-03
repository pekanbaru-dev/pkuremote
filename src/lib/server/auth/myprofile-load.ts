import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { profiles, type Profile } from "../../../../db/schema";

export type MyProfileResult = {
	user: { id: string; email: string | null };
	profile: Profile | null;
};

/**
 * Load the signed-in user's profile. Returns `profile: null` if the trigger
 * hasn't yet provisioned the row, or if the database query fails — never
 * throws, so the page can render a "Profile unavailable" notice.
 */
export async function loadMyProfile(
	userId: string,
	email: string | null | undefined
): Promise<MyProfileResult> {
	const user = { id: userId, email: email ?? null };

	let profile: Profile | null;
	try {
		const [row] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
		profile = row ?? null;
	} catch (err) {
		console.error("Failed to load profile", err);
		profile = null;
	}

	return { user, profile };
}
