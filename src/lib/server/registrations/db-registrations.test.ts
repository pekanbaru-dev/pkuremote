import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import { getRegistrationErrorMessage } from "./db-registrations";

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
