import { describe, expect, it, vi } from "vitest";

// The service module imports the Drizzle client, which reads env at
// access time; stub the env module so the import graph loads under Node.
vi.mock("$env/dynamic/private", () => ({ env: {} }));

import {
	EventWriteError,
	computeRemainingSlots,
	diffCategoryIds,
	isUniqueViolation,
	validateEventInput,
	type EventWriteInput
} from "./db-event-writes";

function baseInput(overrides: Partial<EventWriteInput> = {}): EventWriteInput {
	return {
		title: "Rust Workshop",
		slug: "rust-workshop",
		startsAt: new Date("2026-08-01T09:00:00.000Z"),
		endsAt: null,
		location: "PKU Hub",
		excerpt: "Belajar Rust.",
		body: "Materi lengkap.",
		bannerUrl: null,
		status: "upcoming",
		quota: 50,
		priceNormal: 100000,
		pricePromo: 80000,
		category: "workshop",
		registrationClosesAt: null,
		categoryIds: [],
		...overrides
	};
}

describe("validateEventInput", () => {
	it("accepts a valid payload", () => {
		expect(() => validateEventInput(baseInput())).not.toThrow();
	});

	it("rejects a blank title", () => {
		try {
			validateEventInput(baseInput({ title: "  " }));
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).code).toBe("VALIDATION");
			expect((e as EventWriteError).field).toBe("title");
		}
	});

	it("rejects a malformed slug", () => {
		try {
			validateEventInput(baseInput({ slug: "Not A Slug" }));
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).field).toBe("slug");
		}
	});

	it("rejects an invalid status enum", () => {
		try {
			validateEventInput(baseInput({ status: "draft" as EventWriteInput["status"] }));
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).field).toBe("status");
		}
	});

	it("rejects an invalid primary category enum", () => {
		try {
			validateEventInput(baseInput({ category: "party" as EventWriteInput["category"] }));
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).field).toBe("category");
		}
	});

	it("rejects a non-positive quota", () => {
		try {
			validateEventInput(baseInput({ quota: 0 }));
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).field).toBe("quota");
		}
	});

	it("rejects pricePromo >= priceNormal", () => {
		try {
			validateEventInput(baseInput({ priceNormal: 100, pricePromo: 100 }));
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).code).toBe("VALIDATION");
			expect((e as EventWriteError).field).toBe("pricePromo");
		}
	});

	it("rejects endsAt before startsAt", () => {
		try {
			validateEventInput(
				baseInput({
					startsAt: new Date("2026-08-01T10:00:00.000Z"),
					endsAt: new Date("2026-08-01T09:00:00.000Z")
				})
			);
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).field).toBe("endsAt");
		}
	});
});

describe("computeRemainingSlots", () => {
	it("returns the full quota when nothing is booked", () => {
		expect(computeRemainingSlots({ newQuota: 50, oldQuota: null, oldRemaining: null })).toBe(50);
	});

	it("returns null when the new quota is null", () => {
		expect(computeRemainingSlots({ newQuota: null, oldQuota: 50, oldRemaining: 10 })).toBeNull();
	});

	it("raising quota preserves the booked count (40 booked, 50→60 ⇒ 20)", () => {
		expect(computeRemainingSlots({ newQuota: 60, oldQuota: 50, oldRemaining: 10 })).toBe(20);
	});

	it("rejects a new quota below the booked count (40 booked, 50→30)", () => {
		try {
			computeRemainingSlots({ newQuota: 30, oldQuota: 50, oldRemaining: 10 });
			expect.unreachable();
		} catch (e) {
			expect((e as EventWriteError).code).toBe("VALIDATION");
			expect((e as EventWriteError).field).toBe("quota");
		}
	});
});

describe("diffCategoryIds", () => {
	it("computes adds and removes from the current set", () => {
		const { toAdd, toRemove } = diffCategoryIds(["a", "b"], ["b", "c"]);
		expect(toAdd).toEqual(["c"]);
		expect(toRemove).toEqual(["a"]);
	});

	it("is a no-op when the sets match", () => {
		const { toAdd, toRemove } = diffCategoryIds(["a", "b"], ["b", "a"]);
		expect(toAdd).toEqual([]);
		expect(toRemove).toEqual([]);
	});
});

describe("isUniqueViolation", () => {
	it("detects a Postgres 23505 error (slug collision)", () => {
		expect(isUniqueViolation({ code: "23505" })).toBe(true);
	});

	it("ignores other errors", () => {
		expect(isUniqueViolation({ code: "23503" })).toBe(false);
		expect(isUniqueViolation(new Error("boom"))).toBe(false);
		expect(isUniqueViolation(null)).toBe(false);
	});
});
