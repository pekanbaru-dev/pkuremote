import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import {
	CategoryWriteError,
	createCategory,
	updateCategory,
	validateCategoryInput
} from "./db-categories";
import type { CategoryScope } from "../../../../db/schema";

const dbMocks = vi.hoisted(() => {
	const returning = vi.fn();
	const values = vi.fn(() => ({ returning }));
	const insert = vi.fn(() => ({ values }));
	const set = vi.fn(() => ({ where: vi.fn(() => ({ returning })) }));
	const update = vi.fn(() => ({ set }));
	const deleteCategory = vi.fn();
	return { deleteCategory, insert, returning, set, update, values };
});

vi.mock("$lib/server/db/client", () => ({
	db: {
		insert: dbMocks.insert,
		update: dbMocks.update,
		delete: dbMocks.deleteCategory
	}
}));

describe("validateCategoryInput", () => {
	it("accepts a valid category", () => {
		expect(() => validateCategoryInput({ name: "Workshop", slug: "workshop" })).not.toThrow();
	});

	it.each(["both", "article", "event"] as const)("accepts the %s scope", (scope) => {
		expect(() =>
			validateCategoryInput({ name: "Workshop", slug: "workshop", scope })
		).not.toThrow();
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

	it("rejects an unknown scope", () => {
		try {
			validateCategoryInput({
				name: "Workshop",
				slug: "workshop",
				scope: "invalid" as CategoryScope
			});
			expect.unreachable();
		} catch (e) {
			expect((e as CategoryWriteError).code).toBe("VALIDATION");
			expect((e as CategoryWriteError).field).toBe("scope");
		}
	});
});

describe("category scope persistence", () => {
	it("defaults new categories to both scopes", async () => {
		dbMocks.returning.mockResolvedValueOnce([{ id: "c1" }]);

		await createCategory({ name: "Workshop", slug: "workshop" });

		expect(dbMocks.values).toHaveBeenCalledWith({
			name: "Workshop",
			slug: "workshop",
			scope: "both"
		});
	});

	it("updates scope without touching content relationships", async () => {
		dbMocks.returning.mockResolvedValueOnce([{ id: "c1" }]);

		await updateCategory("c1", { name: "Workshop", slug: "workshop", scope: "event" });

		expect(dbMocks.set).toHaveBeenCalledWith({
			name: "Workshop",
			slug: "workshop",
			scope: "event"
		});
		expect(dbMocks.deleteCategory).not.toHaveBeenCalled();
	});
});
