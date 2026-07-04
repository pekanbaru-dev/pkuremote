import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import {
	getRegistrationErrorMessage,
	isCheckinStatus,
	tallyRegistrationCounts
} from "./db-registrations";

describe("getRegistrationErrorMessage", () => {
	it("maps PROFILE_MISSING to a friendly, specific message (not the generic fallback)", () => {
		const msg = getRegistrationErrorMessage("PROFILE_MISSING");
		expect(msg).toContain("login ulang");
		expect(msg).not.toBe("Gagal melakukan booking — coba lagi.");
	});

	it("still maps a known code and falls back for an unknown one", () => {
		expect(getRegistrationErrorMessage("EVENT_SOLD_OUT")).toContain("penuh");
		expect(getRegistrationErrorMessage("SOMETHING_ELSE")).toBe(
			"Gagal melakukan booking — coba lagi."
		);
	});
});

describe("isCheckinStatus", () => {
	it("accepts the check-in states", () => {
		expect(isCheckinStatus("confirmed")).toBe(true);
		expect(isCheckinStatus("attended")).toBe(true);
		expect(isCheckinStatus("no_show")).toBe(true);
	});

	it("rejects cancelled and unknown statuses (so they can't be checked in)", () => {
		expect(isCheckinStatus("cancelled")).toBe(false);
		expect(isCheckinStatus("bogus")).toBe(false);
		expect(isCheckinStatus("")).toBe(false);
	});
});

describe("tallyRegistrationCounts", () => {
	it("counts by status and totals", () => {
		const counts = tallyRegistrationCounts([
			{ status: "confirmed" },
			{ status: "confirmed" },
			{ status: "attended" },
			{ status: "cancelled" },
			{ status: "no_show" }
		]);
		expect(counts).toEqual({ confirmed: 2, attended: 1, no_show: 1, cancelled: 1, total: 5 });
	});

	it("is all-zero for no registrations", () => {
		expect(tallyRegistrationCounts([])).toEqual({
			confirmed: 0,
			attended: 0,
			no_show: 0,
			cancelled: 0,
			total: 0
		});
	});
});
