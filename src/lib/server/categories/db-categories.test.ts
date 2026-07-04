import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import { CategoryWriteError, validateCategoryInput } from "./db-categories";

describe("validateCategoryInput", () => {
	it("accepts a valid category", () => {
		expect(() => validateCategoryInput({ name: "Workshop", slug: "workshop" })).not.toThrow();
	});

	it("rejects a blank name", () => {
		try {
			validateCategoryInput({ name: "  ", slug: "workshop" });
			expect.unreachable();
		} catch (e) {
			expect((e as CategoryWriteError).field).toBe("name");
		}
	});

	it("rejects a malformed slug", () => {
		try {
			validateCategoryInput({ name: "Workshop", slug: "Work Shop" });
			expect.unreachable();
		} catch (e) {
			expect((e as CategoryWriteError).code).toBe("VALIDATION");
			expect((e as CategoryWriteError).field).toBe("slug");
		}
	});
});
