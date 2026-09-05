import { describe, expect, it, vi } from "vitest";
import { DEFAULT_REDIRECT, safeRedirectTarget } from "./redirect";

describe("safeRedirectTarget", () => {
	it("falls back to /auth/myprofile when raw is null", () => {
		expect(safeRedirectTarget(null)).toBe("/auth/myprofile");
	});

	it("falls back to /auth/myprofile when raw is undefined", () => {
		expect(safeRedirectTarget(undefined)).toBe("/auth/myprofile");
	});

	it("falls back to /auth/myprofile when raw is empty", () => {
		expect(safeRedirectTarget("")).toBe("/auth/myprofile");
	});

	it("honors a same-origin path", () => {
		expect(safeRedirectTarget("/events")).toBe("/events");
		expect(safeRedirectTarget("/events?foo=bar")).toBe("/events?foo=bar");
		expect(safeRedirectTarget("/path/with/slashes")).toBe("/path/with/slashes");
	});

	it("rejects a protocol-relative URL", () => {
		expect(safeRedirectTarget("//evil.com/pwn")).toBe("/auth/myprofile");
		expect(safeRedirectTarget("//evil.com")).toBe("/auth/myprofile");
	});

	it("rejects a backslash-prefixed path that browsers normalize to a protocol-relative URL", () => {
		expect(safeRedirectTarget("/\\evil.com/pwn")).toBe("/auth/myprofile");
		expect(safeRedirectTarget("/\\evil.com")).toBe("/auth/myprofile");
	});

	it("rejects an absolute URL", () => {
		expect(safeRedirectTarget("https://evil.com/pwn")).toBe("/auth/myprofile");
		expect(safeRedirectTarget("http://localhost/pwn")).toBe("/auth/myprofile");
	});

	it("rejects a relative path that does not start with /", () => {
		expect(safeRedirectTarget("javascript:alert(1)")).toBe("/auth/myprofile");
		expect(safeRedirectTarget("myprofile")).toBe("/auth/myprofile");
	});

	it("exports DEFAULT_REDIRECT as /auth/myprofile", () => {
		expect(DEFAULT_REDIRECT).toBe("/auth/myprofile");
	});
});

// Suppress unused-import warning for vi — kept for future tests
void vi;
