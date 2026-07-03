import { describe, expect, it, vi } from "vitest";
import { DEFAULT_REDIRECT, safeRedirectTarget } from "./redirect";

describe("safeRedirectTarget", () => {
	it("falls back to /myprofile when raw is null", () => {
		expect(safeRedirectTarget(null)).toBe("/myprofile");
	});

	it("falls back to /myprofile when raw is undefined", () => {
		expect(safeRedirectTarget(undefined)).toBe("/myprofile");
	});

	it("falls back to /myprofile when raw is empty", () => {
		expect(safeRedirectTarget("")).toBe("/myprofile");
	});

	it("honors a same-origin path", () => {
		expect(safeRedirectTarget("/events")).toBe("/events");
		expect(safeRedirectTarget("/events?foo=bar")).toBe("/events?foo=bar");
		expect(safeRedirectTarget("/path/with/slashes")).toBe("/path/with/slashes");
	});

	it("rejects a protocol-relative URL", () => {
		expect(safeRedirectTarget("//evil.com/pwn")).toBe("/myprofile");
		expect(safeRedirectTarget("//evil.com")).toBe("/myprofile");
	});

	it("rejects a backslash-prefixed path that browsers normalize to a protocol-relative URL", () => {
		expect(safeRedirectTarget("/\\evil.com/pwn")).toBe("/myprofile");
		expect(safeRedirectTarget("/\\evil.com")).toBe("/myprofile");
	});

	it("rejects an absolute URL", () => {
		expect(safeRedirectTarget("https://evil.com/pwn")).toBe("/myprofile");
		expect(safeRedirectTarget("http://localhost/pwn")).toBe("/myprofile");
	});

	it("rejects a relative path that does not start with /", () => {
		expect(safeRedirectTarget("javascript:alert(1)")).toBe("/myprofile");
		expect(safeRedirectTarget("myprofile")).toBe("/myprofile");
	});

	it("exports DEFAULT_REDIRECT as /myprofile", () => {
		expect(DEFAULT_REDIRECT).toBe("/myprofile");
	});
});

// Suppress unused-import warning for vi — kept for future tests
void vi;
