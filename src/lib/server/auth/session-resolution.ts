import type { SessionUser } from "./session";

/**
 * The four distinguishable results of trying to resolve a request's session,
 * kept free of SvelteKit/cookie I/O so it is unit-testable (`hooks.server.ts`
 * does the cookie reads/deletes and the redirect).
 *
 * The important distinction is `invalid` vs `unavailable`: both mean "no user
 * for this request", but only `invalid` justifies clearing the cookie. Treating
 * an unreachable database as an invalid token would permanently sign out
 * legitimate sessions over a transient outage.
 */
export type SessionOutcome =
	/** No session cookie was sent — an ordinary anonymous request. */
	| { status: "anonymous" }
	/** The token resolved to a live session. */
	| { status: "authenticated"; user: SessionUser }
	/** The token is unknown or expired — safe to clear the cookie. */
	| { status: "invalid" }
	/** The lookup itself failed (schema drift, DB down). Keep the cookie. */
	| { status: "unavailable"; cause: unknown };

/**
 * Classify a request's session without ever throwing.
 *
 * `hooks.server.ts` runs for EVERY request, so an exception escaping it 500s
 * the entire site — including `/login`, leaving users with no way to recover
 * (see issue #61). This function converts any lookup failure into an
 * `unavailable` outcome the caller can degrade on.
 */
export async function resolveSessionOutcome(
	token: string | undefined,
	resolve: (token: string) => Promise<SessionUser | null>
): Promise<SessionOutcome> {
	if (!token) return { status: "anonymous" };

	try {
		const user = await resolve(token);
		return user ? { status: "authenticated", user } : { status: "invalid" };
	} catch (cause) {
		return { status: "unavailable", cause };
	}
}
