import { describe, expect, it, vi } from "vitest";

// The env-reading helpers (isAdmin/requireAdmin) resolve `$env/dynamic/private`
// at call time; mock it with a fixed allow-list for those cases.
vi.mock("$env/dynamic/private", () => ({
	env: { ADMIN_EMAILS: "admin@pku.dev, Boss@PKU.dev" }
}));

import { isAdmin, isEmailAdmin, parseAdminEmails, requireAdmin } from "./admin";

const asLocals = (email: string | null) => ({ user: email ? { email } : null }) as App.Locals;

describe("parseAdminEmails", () => {
	it("returns an empty set for unset/blank/separators-only values (fail closed)", () => {
		expect(parseAdminEmails(undefined).size).toBe(0);
		expect(parseAdminEmails(null).size).toBe(0);
		expect(parseAdminEmails("").size).toBe(0);
		expect(parseAdminEmails(" , , ").size).toBe(0);
	});

	it("parses a single email", () => {
		expect([...parseAdminEmails("ayu@pku.dev")]).toEqual(["ayu@pku.dev"]);
	});

	it("parses multiple emails and trims surrounding whitespace", () => {
		expect([...parseAdminEmails("ayu@pku.dev, budi@pku.dev , citra@pku.dev")]).toEqual([
			"ayu@pku.dev",
			"budi@pku.dev",
			"citra@pku.dev"
		]);
	});

	it("lowercases entries", () => {
		expect([...parseAdminEmails("Ayu@PKU.dev")]).toEqual(["ayu@pku.dev"]);
	});
});

describe("isEmailAdmin", () => {
	const set = parseAdminEmails("ayu@pku.dev, budi@pku.dev");

	it("matches a listed email", () => {
		expect(isEmailAdmin("ayu@pku.dev", set)).toBe(true);
	});

	it("matches case-insensitively and ignores surrounding whitespace", () => {
		expect(isEmailAdmin(" AYU@pku.dev ", set)).toBe(true);
	});

	it("rejects a non-listed email", () => {
		expect(isEmailAdmin("dedi@pku.dev", set)).toBe(false);
	});

	it("rejects null/undefined/empty", () => {
		expect(isEmailAdmin(null, set)).toBe(false);
		expect(isEmailAdmin(undefined, set)).toBe(false);
		expect(isEmailAdmin("", set)).toBe(false);
	});
});

describe("isAdmin (env-backed)", () => {
	it("is true for a listed user (case-insensitive)", () => {
		expect(isAdmin(asLocals("admin@pku.dev"))).toBe(true);
		expect(isAdmin(asLocals("BOSS@pku.dev"))).toBe(true);
	});

	it("is false for a non-listed or absent user", () => {
		expect(isAdmin(asLocals("nope@pku.dev"))).toBe(false);
		expect(isAdmin(asLocals(null))).toBe(false);
	});
});

describe("requireAdmin", () => {
	it("does not throw for an admin", () => {
		expect(() => requireAdmin(asLocals("admin@pku.dev"))).not.toThrow();
	});

	it("throws a redirect for a non-admin", () => {
		try {
			requireAdmin(asLocals("nope@pku.dev"));
			expect.unreachable("expected requireAdmin to redirect");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(303);
			expect((e as { status: number; location: string }).location).toBe("/");
		}
	});
});
