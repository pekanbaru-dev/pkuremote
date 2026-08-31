import { describe, expect, it, vi } from "vitest";
import { resolveSessionOutcome } from "./session-resolution";
import type { SessionUser } from "./session";

const USER: SessionUser = {
	id: "11111111-1111-1111-1111-111111111111",
	email: "ayu@pku.dev",
	displayName: "Ayu",
	avatarUrl: null,
	role: "user"
};

describe("resolveSessionOutcome", () => {
	it("reports anonymous without calling the resolver when there is no token", async () => {
		const resolver = vi.fn();

		const outcome = await resolveSessionOutcome(undefined, resolver);

		expect(outcome).toEqual({ status: "anonymous" });
		expect(resolver).not.toHaveBeenCalled();
	});

	it("reports the user when the token resolves", async () => {
		const outcome = await resolveSessionOutcome("raw-token", async () => USER);

		expect(outcome).toEqual({ status: "authenticated", user: USER });
	});

	it("reports invalid when the token is unknown or expired", async () => {
		const outcome = await resolveSessionOutcome("stale-token", async () => null);

		expect(outcome).toEqual({ status: "invalid" });
	});

	it("reports unavailable, carrying the cause, when the lookup throws", async () => {
		const cause = new Error('column "profiles.role" does not exist');

		const outcome = await resolveSessionOutcome("raw-token", async () => {
			throw cause;
		});

		expect(outcome).toEqual({ status: "unavailable", cause });
	});
});

describe("session outcome consequences", () => {
	// The two properties that turned a missing column into a total outage.
	// See issue #61.

	it("distinguishes a genuinely invalid token from an unreachable database", async () => {
		// Both yield no user, but only ONE of them justifies clearing the cookie:
		// a transient DB failure must not sign out a legitimate session.
		const invalid = await resolveSessionOutcome("stale", async () => null);
		const unavailable = await resolveSessionOutcome("good", async () => {
			throw new Error("connection refused");
		});

		expect(invalid.status).toBe("invalid");
		expect(unavailable.status).toBe("unavailable");
	});

	it("never propagates the lookup failure to the caller", async () => {
		// The whole point: hooks.server.ts must not see an exception, because an
		// exception there 500s EVERY route, including /login.
		await expect(
			resolveSessionOutcome("raw-token", async () => {
				throw new Error("boom");
			})
		).resolves.toMatchObject({ status: "unavailable" });
	});
});
