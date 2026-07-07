import { describe, expect, it } from "vitest";
import { normalizeEmail, deriveDisplayName } from "./provision";

describe("normalizeEmail", () => {
	it("trims surrounding whitespace and lower-cases", () => {
		expect(normalizeEmail("  Ayu@Pku.dev  ")).toBe("ayu@pku.dev");
	});

	it("is idempotent on an already-normalized value", () => {
		expect(normalizeEmail("ayu@pku.dev")).toBe("ayu@pku.dev");
	});
});

describe("deriveDisplayName", () => {
	it("uses the name claim when present", () => {
		expect(deriveDisplayName("Rina Aulia", "rina@example.com")).toBe("Rina Aulia");
	});

	it("trims the name claim", () => {
		expect(deriveDisplayName("  Rina  ", "rina@example.com")).toBe("Rina");
	});

	it("falls back to the email local part when the name is null or blank", () => {
		expect(deriveDisplayName(null, "rina@example.com")).toBe("rina");
		expect(deriveDisplayName("   ", "rina@example.com")).toBe("rina");
	});

	it("falls back to 'Pengguna' when there is no local part", () => {
		expect(deriveDisplayName(null, "@example.com")).toBe("Pengguna");
	});
});
