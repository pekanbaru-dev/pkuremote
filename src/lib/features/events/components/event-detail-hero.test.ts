import { describe, expect, it } from "vitest";
import { formatDateLong } from "./event-detail-hero.svelte";

describe("formatDateLong (WIB timezone)", () => {
	// Force the runtime to a non-WIB locale so the `timeZone: "Asia/Jakarta"`
	// option is the only thing keeping the result in WIB. Without that option
	// the formatter would render 12.00 in a UTC server (the original bug).
	const originalTZ = process.env.TZ;

	it.each([
		// [iso, expected wall-clock in WIB (Asia/Jakarta, +07:00)]
		["2026-10-24T19:00:00+07:00", "Sabtu, 24 Oktober 2026 pukul 19.00"],
		["2026-11-02T19:00:00+07:00", "Senin, 2 November 2026 pukul 19.00"],
		["2026-11-15T18:00:00+07:00", "Minggu, 15 November 2026 pukul 18.00"]
	])("renders %s as %s in WIB regardless of server TZ", (iso, expected) => {
		process.env.TZ = "UTC";
		expect(formatDateLong(iso)).toBe(expected);
		process.env.TZ = "America/New_York";
		expect(formatDateLong(iso)).toBe(expected);
		process.env.TZ = "Asia/Tokyo";
		expect(formatDateLong(iso)).toBe(expected);
	});

	it("does not drift when the server is in UTC", () => {
		process.env.TZ = "UTC";
		// 2026-10-24T19:00 in WIB is 12:00 in UTC; the old code rendered
		// "12.00 WIB" on a UTC server. The fix must produce 19.00.
		expect(formatDateLong("2026-10-24T19:00:00+07:00")).toContain("19.00");
		expect(formatDateLong("2026-10-24T19:00:00+07:00")).not.toContain("12.00");
		process.env.TZ = originalTZ;
	});
});
