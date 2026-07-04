import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isNavItemActive } from "./nav";

describe("NAV_ITEMS", () => {
	it("lists Dashboard and Events with hrefs and icons", () => {
		expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/admin", "/admin/events"]);
		expect(NAV_ITEMS.every((i) => i.label && i.icon)).toBe(true);
	});
});

describe("isNavItemActive", () => {
	it("marks the Dashboard (root) active only on the exact /admin path", () => {
		expect(isNavItemActive("/admin", "/admin")).toBe(true);
		expect(isNavItemActive("/admin/events", "/admin")).toBe(false);
		expect(isNavItemActive("/admin/events/new", "/admin")).toBe(false);
	});

	it("marks a section active on its exact path and nested children", () => {
		expect(isNavItemActive("/admin/events", "/admin/events")).toBe(true);
		expect(isNavItemActive("/admin/events/new", "/admin/events")).toBe(true);
		expect(isNavItemActive("/admin/events/abc/edit", "/admin/events")).toBe(true);
	});

	it("does not match a sibling path that merely shares a prefix", () => {
		expect(isNavItemActive("/admin/eventsomething", "/admin/events")).toBe(false);
	});

	it("does not mark a section active on an unrelated path", () => {
		expect(isNavItemActive("/admin", "/admin/events")).toBe(false);
	});
});
