import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => {
	const orderBy = vi.fn();
	const where = vi.fn();
	const innerJoin = vi.fn(() => ({ where }));
	const from = vi
		.fn()
		.mockImplementationOnce(() => ({ where }))
		.mockImplementationOnce(() => ({ innerJoin }));
	const select = vi.fn(() => ({ from }));
	const inArray = vi.fn((_column: unknown, values: unknown[]) => ({
		kind: "inArray",
		values
	}));

	return { from, inArray, orderBy, select, where };
});

vi.mock("$lib/server/db/client", () => ({ db: { select: dbMocks.select } }));
vi.mock("drizzle-orm", async () => {
	const actual = await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
	return { ...actual, inArray: dbMocks.inArray };
});

import { getUpcomingEvents } from "./db-events";

function makeRow(overrides: Record<string, unknown> = {}) {
	return {
		id: "e1",
		slug: "e1",
		title: "Talam Masterclass",
		startsAt: new Date("2026-10-24T12:00:00.000Z"),
		endsAt: null,
		location: "Pekanbaru",
		excerpt: "An excerpt for testing.",
		body: "Body for testing.",
		bannerUrl: null,
		status: "upcoming",
		quota: null,
		remainingSlots: null,
		priceNormal: null,
		pricePromo: null,
		category: null,
		registrationClosesAt: null,
		createdAt: new Date("2026-10-01T12:00:00.000Z"),
		...overrides
	};
}

describe("getUpcomingEvents", () => {
	it("includes upcoming and live events in the active listing query", async () => {
		const rows = [
			makeRow({ id: "upcoming", status: "upcoming" }),
			makeRow({ id: "live", status: "live" })
		];
		dbMocks.orderBy.mockResolvedValueOnce(rows);
		dbMocks.where
			.mockImplementationOnce(() => ({ orderBy: dbMocks.orderBy }))
			.mockImplementationOnce(() => []);

		const result = await getUpcomingEvents();

		expect(dbMocks.inArray).toHaveBeenNthCalledWith(1, expect.anything(), ["upcoming", "live"]);
		expect(result.map((event) => event.status)).toEqual(["upcoming", "live"]);
	});
});
