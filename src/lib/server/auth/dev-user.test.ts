import { describe, expect, it } from "vitest";
import { DEV_ADMIN_USER_ID, makeDevAdminUser, resolveDevLoginEmail } from "./dev-user";

describe("resolveDevLoginEmail", () => {
	it("returns the trimmed email when in dev and the var is set", () => {
		expect(resolveDevLoginEmail(true, "  admin@example.com  ")).toBe("admin@example.com");
	});

	it("fail-closes to null when NOT in dev, even if the var is set", () => {
		// This is the production safety property: a stray DEV_ADMIN_EMAIL in a
		// built/prod environment must never activate the bypass.
		expect(resolveDevLoginEmail(false, "admin@example.com")).toBeNull();
	});

	it("returns null in dev when the var is unset or blank", () => {
		expect(resolveDevLoginEmail(true, undefined)).toBeNull();
		expect(resolveDevLoginEmail(true, null)).toBeNull();
		expect(resolveDevLoginEmail(true, "   ")).toBeNull();
	});
});

describe("makeDevAdminUser", () => {
	it("builds an app user carrying the given email and the fixed id", () => {
		const user = makeDevAdminUser("admin@example.com");
		expect(user.id).toBe(DEV_ADMIN_USER_ID);
		expect(user.email).toBe("admin@example.com");
		expect(user.displayName).toBe("Dev Admin");
		expect(user.avatarUrl).toBeNull();
	});
});
