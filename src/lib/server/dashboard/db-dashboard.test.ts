import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import { computeFillPercent } from "./db-dashboard";

describe("computeFillPercent", () => {
	it("computes booked ÷ quota as a rounded percentage (40/100 ⇒ 40)", () => {
		expect(computeFillPercent(100, 40)).toBe(40);
	});

	it("rounds to the nearest whole percent (1/3 ⇒ 33)", () => {
		expect(computeFillPercent(3, 1)).toBe(33);
	});

	it("returns null when there are no quota-bearing events (Σquota = 0)", () => {
		expect(computeFillPercent(0, 0)).toBeNull();
	});

	it("returns null for a negative or non-finite quota sum rather than dividing", () => {
		expect(computeFillPercent(-5, 2)).toBeNull();
		expect(computeFillPercent(Number.NaN, 2)).toBeNull();
	});

	it("reports a full house as 100%", () => {
		expect(computeFillPercent(50, 50)).toBe(100);
	});
});
