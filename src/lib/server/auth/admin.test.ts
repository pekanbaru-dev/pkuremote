import { describe, expect, it } from "vitest";
import {
	isAdmin,
	isEditor,
	requireAdmin,
	requireEditor,
	parseAdminEmails,
	isEmailAdmin
} from "./admin";

// Helper: build a minimal App.Locals with the given role (or no user)
const asLocals = (role: "user" | "editor" | "admin" | null): App.Locals =>
	({
		user: role
			? {
					id: "00000000-0000-0000-0000-000000000001",
					email: "test@pku.dev",
					displayName: "Test User",
					avatarUrl: null,
					role
				}
			: null
	}) as App.Locals;

// ---------------------------------------------------------------------------
// isAdmin — DB-backed role
// ---------------------------------------------------------------------------

describe("isAdmin", () => {
	it("is true for role=admin", () => {
		expect(isAdmin(asLocals("admin"))).toBe(true);
	});

	it("is false for role=editor", () => {
		expect(isAdmin(asLocals("editor"))).toBe(false);
	});

	it("is false for role=user", () => {
		expect(isAdmin(asLocals("user"))).toBe(false);
	});

	it("is false when user is null", () => {
		expect(isAdmin(asLocals(null))).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// isEditor
// ---------------------------------------------------------------------------

describe("isEditor", () => {
	it("is true for role=editor", () => {
		expect(isEditor(asLocals("editor"))).toBe(true);
	});

	it("is true for role=admin (admin implies editor)", () => {
		expect(isEditor(asLocals("admin"))).toBe(true);
	});

	it("is false for role=user", () => {
		expect(isEditor(asLocals("user"))).toBe(false);
	});

	it("is false when user is null", () => {
		expect(isEditor(asLocals(null))).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// requireAdmin
// ---------------------------------------------------------------------------

describe("requireAdmin", () => {
	it("does not throw for role=admin", () => {
		expect(() => requireAdmin(asLocals("admin"))).not.toThrow();
	});

	it("throws a 303 redirect for role=editor", () => {
		try {
			requireAdmin(asLocals("editor"));
			expect.unreachable("expected requireAdmin to redirect");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(303);
			expect((e as { status: number; location: string }).location).toBe("/");
		}
	});

	it("throws a 303 redirect for role=user", () => {
		try {
			requireAdmin(asLocals("user"));
			expect.unreachable("expected requireAdmin to redirect");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(303);
		}
	});

	it("throws a 303 redirect for null user", () => {
		try {
			requireAdmin(asLocals(null));
			expect.unreachable("expected requireAdmin to redirect");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(303);
		}
	});
});

// ---------------------------------------------------------------------------
// requireEditor
// ---------------------------------------------------------------------------

describe("requireEditor", () => {
	it("does not throw for role=editor", () => {
		expect(() => requireEditor(asLocals("editor"))).not.toThrow();
	});

	it("does not throw for role=admin", () => {
		expect(() => requireEditor(asLocals("admin"))).not.toThrow();
	});

	it("throws a 303 redirect for role=user", () => {
		try {
			requireEditor(asLocals("user"));
			expect.unreachable("expected requireEditor to redirect");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(303);
			expect((e as { status: number; location: string }).location).toBe("/");
		}
	});

	it("throws a 303 redirect for null user", () => {
		try {
			requireEditor(asLocals(null));
			expect.unreachable("expected requireEditor to redirect");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(303);
		}
	});
});

// ---------------------------------------------------------------------------
// Legacy helpers (retained for backward compat, deprecated)
// ---------------------------------------------------------------------------

describe("parseAdminEmails (legacy)", () => {
	it("returns an empty set for unset/blank/separators-only values", () => {
		expect(parseAdminEmails(undefined).size).toBe(0);
		expect(parseAdminEmails(null).size).toBe(0);
		expect(parseAdminEmails("").size).toBe(0);
		expect(parseAdminEmails(" , , ").size).toBe(0);
	});

	it("parses and lowercases multiple emails", () => {
		expect([...parseAdminEmails("Ayu@pku.dev, BUDI@pku.dev")]).toEqual([
			"ayu@pku.dev",
			"budi@pku.dev"
		]);
	});
});

describe("isEmailAdmin (legacy)", () => {
	const set = parseAdminEmails("ayu@pku.dev");

	it("matches a listed email case-insensitively", () => {
		expect(isEmailAdmin("AYU@pku.dev", set)).toBe(true);
	});

	it("rejects unlisted email", () => {
		expect(isEmailAdmin("other@pku.dev", set)).toBe(false);
	});

	it("rejects null/undefined/empty", () => {
		expect(isEmailAdmin(null, set)).toBe(false);
		expect(isEmailAdmin(undefined, set)).toBe(false);
		expect(isEmailAdmin("", set)).toBe(false);
	});
});
