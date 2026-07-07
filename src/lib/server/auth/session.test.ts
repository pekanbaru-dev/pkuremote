import { describe, expect, it } from "vitest";
import {
	hashSessionToken,
	generateSessionToken,
	isSessionExpired,
	SESSION_TTL_MS
} from "./session";

describe("hashSessionToken", () => {
	it("returns a hash distinct from the raw token (not stored in plaintext)", () => {
		const token = "raw-secret-token";
		const hash = hashSessionToken(token);
		expect(hash).not.toBe(token);
		expect(hash).toMatch(/^[0-9a-f]{64}$/); // sha256 hex
	});

	it("is deterministic for the same token", () => {
		expect(hashSessionToken("abc")).toBe(hashSessionToken("abc"));
	});

	it("differs for different tokens", () => {
		expect(hashSessionToken("abc")).not.toBe(hashSessionToken("abd"));
	});
});

describe("generateSessionToken", () => {
	it("produces a high-entropy token that is not reused", () => {
		const a = generateSessionToken();
		const b = generateSessionToken();
		expect(a).not.toBe(b);
		expect(a.length).toBeGreaterThanOrEqual(32);
	});
});

describe("isSessionExpired", () => {
	const now = new Date("2026-01-01T00:00:00Z");

	it("treats a past expiry as expired", () => {
		expect(isSessionExpired(new Date(now.getTime() - 1000), now)).toBe(true);
	});

	it("treats the exact expiry instant as expired", () => {
		expect(isSessionExpired(new Date(now.getTime()), now)).toBe(true);
	});

	it("treats a future (within-TTL) expiry as valid", () => {
		expect(isSessionExpired(new Date(now.getTime() + SESSION_TTL_MS), now)).toBe(false);
	});
});
