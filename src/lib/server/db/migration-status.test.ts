import { describe, expect, it } from "vitest";
import { pendingMigrations, type JournalEntry } from "./migration-status";

// The repo's real journal shape, abbreviated.
const JOURNAL: JournalEntry[] = [
	{ tag: "0000_natural_quasimodo", when: 1783447286423 },
	{ tag: "0001_nifty_garia", when: 1786728760197 },
	{ tag: "0002_article_metadata", when: 1786728760200 }
];

describe("pendingMigrations", () => {
	it("reports nothing pending when every journal entry has been applied", () => {
		const applied = JOURNAL.map((e) => e.when);

		expect(pendingMigrations(JOURNAL, applied)).toEqual([]);
	});

	it("reports every migration as pending against an empty database", () => {
		expect(pendingMigrations(JOURNAL, [])).toEqual([
			"0000_natural_quasimodo",
			"0001_nifty_garia",
			"0002_article_metadata"
		]);
	});

	it("reproduces the 2026-08-31 outage: only 0000 applied", () => {
		// This is exactly the state production was found in — one row in
		// drizzle.__drizzle_migrations while the image needed all three.
		expect(pendingMigrations(JOURNAL, [1783447286423])).toEqual([
			"0001_nifty_garia",
			"0002_article_metadata"
		]);
	});

	it("detects a gap in the middle, not just an unapplied tail", () => {
		// A hand-applied or partially-restored database can skip one. Comparing
		// only against the newest applied timestamp would miss this.
		expect(pendingMigrations(JOURNAL, [1783447286423, 1786728760200])).toEqual([
			"0001_nifty_garia"
		]);
	});

	it("ignores applied timestamps that no longer have a journal entry", () => {
		// e.g. a squashed or removed migration file. Extra history is not drift.
		expect(pendingMigrations(JOURNAL, [...JOURNAL.map((e) => e.when), 1999999999999])).toEqual([]);
	});

	it("preserves journal order in the reported list", () => {
		const shuffledApplied = [1786728760200, 1783447286423];

		expect(pendingMigrations(JOURNAL, shuffledApplied)).toEqual(["0001_nifty_garia"]);
	});

	it("treats an empty journal as nothing pending", () => {
		expect(pendingMigrations([], [])).toEqual([]);
	});
});
