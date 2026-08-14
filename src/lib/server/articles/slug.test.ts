import { describe, expect, it } from "vitest";
import { generateSlug } from "./slug";

// generateUniqueSlug requires a DB connection so it is tested via integration
// tests (not included here). generateSlug is a pure function and fully testable.

describe("generateSlug", () => {
	it("lowercases the title", () => {
		expect(generateSlug("Hello World")).toBe("hello-world");
	});

	it("replaces spaces with dashes", () => {
		expect(generateSlug("cara membuat rendang")).toBe("cara-membuat-rendang");
	});

	it("strips non-alphanumeric characters", () => {
		expect(generateSlug("Hello, World! (2026)")).toBe("hello-world-2026");
	});

	it("collapses multiple dashes", () => {
		expect(generateSlug("hello   world")).toBe("hello-world");
	});

	it("trims leading and trailing dashes", () => {
		expect(generateSlug("  hello world  ")).toBe("hello-world");
	});

	it("handles Indonesian characters and common punctuation", () => {
		expect(generateSlug("Cara Membuat Kue Bolu — Resep Tradisional")).toBe(
			"cara-membuat-kue-bolu-resep-tradisional"
		);
	});

	it("returns empty string for empty input", () => {
		expect(generateSlug("")).toBe("");
	});

	it("returns empty string for whitespace-only input", () => {
		expect(generateSlug("   ")).toBe("");
	});

	it("handles numeric titles", () => {
		expect(generateSlug("10 Tips untuk Developer")).toBe("10-tips-untuk-developer");
	});

	it("handles already-slugified input unchanged", () => {
		expect(generateSlug("cara-membuat-rendang")).toBe("cara-membuat-rendang");
	});

	it("strips underscores (replaced by dash)", () => {
		expect(generateSlug("hello_world")).toBe("hello-world");
	});
});
