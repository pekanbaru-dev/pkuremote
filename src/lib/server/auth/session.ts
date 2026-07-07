import { createHash, randomBytes } from "node:crypto";
import { eq, lte } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { sessions, users, profiles } from "../../../../db/schema";

/** Name of the httpOnly cookie carrying the opaque session token. */
export const SESSION_COOKIE = "session";

/** Fixed absolute session lifetime: 6 hours (not sliding — see design D4). */
export const SESSION_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Hash a session token for storage. The raw token lives only in the browser
 * cookie; the `sessions.id` column stores this hash, so a database read cannot
 * reconstruct a live cookie. SHA-256 is sufficient because the token is a
 * 256-bit CSPRNG value (no slow hash needed — there is nothing to brute-force).
 */
export function hashSessionToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

/** Generate a new opaque, high-entropy session token (raw; goes in the cookie). */
export function generateSessionToken(): string {
	return randomBytes(32).toString("base64url");
}

/** Whether a session with `expiresAt` is expired relative to `now`. */
export function isSessionExpired(expiresAt: Date, now: Date = new Date()): boolean {
	return expiresAt.getTime() <= now.getTime();
}

export type SessionUser = {
	id: string;
	email: string;
	displayName: string | null;
	avatarUrl: string | null;
};

/**
 * Create a session for `userId` with a fixed 6-hour expiry. Returns the RAW
 * token (store in the cookie) and the expiry; only the token's hash is
 * persisted.
 */
export async function createSession(
	userId: string,
	now: Date = new Date()
): Promise<{ token: string; expiresAt: Date }> {
	const token = generateSessionToken();
	const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
	await db.insert(sessions).values({ id: hashSessionToken(token), userId, expiresAt });
	return { token, expiresAt };
}

/**
 * Resolve the app user from a raw cookie token, or `null` if the session is
 * unknown or expired. An expired row is deleted on encounter (delete-on-
 * encounter). Joins `users` (email) and `profiles` (display name, avatar).
 */
export async function resolveSessionUser(
	token: string,
	now: Date = new Date()
): Promise<SessionUser | null> {
	const id = hashSessionToken(token);
	const [row] = await db
		.select({
			userId: sessions.userId,
			expiresAt: sessions.expiresAt,
			email: users.email,
			displayName: profiles.displayName,
			avatarUrl: profiles.avatarUrl
		})
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.userId))
		.leftJoin(profiles, eq(profiles.id, sessions.userId))
		.where(eq(sessions.id, id))
		.limit(1);

	if (!row) return null;
	if (isSessionExpired(row.expiresAt, now)) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return null;
	}

	return {
		id: row.userId,
		email: row.email,
		displayName: row.displayName ?? null,
		avatarUrl: row.avatarUrl ?? null
	};
}

/** Delete the session identified by a raw cookie token (sign-out). */
export async function deleteSession(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, hashSessionToken(token)));
}

/**
 * Best-effort bulk cleanup of expired sessions. Optional — delete-on-encounter
 * (in `resolveSessionUser`) is the primary mechanism; this is available for a
 * periodic sweep if `sessions` bloat is ever observed.
 */
export async function sweepExpiredSessions(now: Date = new Date()): Promise<void> {
	await db.delete(sessions).where(lte(sessions.expiresAt, now));
}
