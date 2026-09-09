import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import { parseCafeFormData } from "./db-cafes";

describe("parseCafeFormData", () => {
	it("accepts the published value submitted by the admin checkbox", () => {
		const formData = new FormData();
		formData.set("published", "true");

		expect(parseCafeFormData(formData).input.published).toBe(true);
	});

	it("keeps unchecked cafes unpublished", () => {
		expect(parseCafeFormData(new FormData()).input.published).toBe(false);
	});
	it("keeps review metadata in the order shown by the detail page", () => {
		const formData = new FormData();
		formData.set("reviews", "Nadia | 2 hari lalu | WiFi stabil.");
		formData.set("scoreDetails", "WiFi | 96");

		expect(parseCafeFormData(formData).input.reviews).toEqual([
			["Nadia", "2 hari lalu", "WiFi stabil."]
		]);
		expect(parseCafeFormData(formData).input.scoreDetails).toEqual([["WiFi", 96]]);
	});
});
