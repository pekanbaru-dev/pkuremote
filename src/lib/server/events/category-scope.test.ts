import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => {
	const orderBy = vi.fn();
	const where = vi.fn(() => ({ orderBy }));
	const from = vi.fn(() => ({ where }));
	const select = vi.fn(() => ({ from }));
	const eq = vi.fn((_column: unknown, value: string) => ({ kind: "eq", value }));
	const or = vi.fn((...conditions: unknown[]) => ({ kind: "or", conditions }));
	return { eq, from, orderBy, or, select, where };
});

vi.mock("$lib/server/db/client", () => ({ db: { select: dbMocks.select } }));
vi.mock("drizzle-orm", async () => {
	const actual = await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
	return { ...actual, eq: dbMocks.eq, or: dbMocks.or };
});

import { getCategoriesForScope } from "./db-events";

describe("getCategoriesForScope", () => {
	it("returns shared and content-specific categories", async () => {
		dbMocks.orderBy.mockResolvedValueOnce([
			{ id: "c1", name: "All", slug: "all" },
			{ id: "c2", name: "Workshop", slug: "workshop" }
		]);

		const result = await getCategoriesForScope("event");

		expect(dbMocks.eq).toHaveBeenNthCalledWith(1, expect.anything(), "both");
		expect(dbMocks.eq).toHaveBeenNthCalledWith(2, expect.anything(), "event");
		expect(dbMocks.or).toHaveBeenCalledWith(
			{ kind: "eq", value: "both" },
			{ kind: "eq", value: "event" }
		);
		expect(result).toEqual([
			{ id: "c1", name: "All", slug: "all" },
			{ id: "c2", name: "Workshop", slug: "workshop" }
		]);
	});
});
