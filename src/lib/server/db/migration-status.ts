/**
 * Drizzle migration drift detection.
 *
 * Drizzle tracks migrations in two places that must agree: the committed
 * `db/migrations/meta/_journal.json` (which migration FILES exist) and the
 * `drizzle.__drizzle_migrations` table (which have actually RUN in this
 * database). The deploy does not apply migrations (DEPLOY.md), so an image can
 * ship code ahead of the schema — which is what caused the 2026-08-31 outage
 * (see issue #60). This module makes that state detectable.
 *
 * The two are joined on the timestamp: `__drizzle_migrations.created_at`
 * equals the journal entry's `when`, verified against the existing 0000 row in
 * production.
 */

/** One entry of `db/migrations/meta/_journal.json`. */
export type JournalEntry = { tag: string; when: number };

/**
 * The journal entries that have NOT been applied to a database, in journal
 * order.
 *
 * Membership is tested per-entry rather than against the newest applied
 * timestamp, so a gap in the middle is caught too — a database that was
 * hand-patched or restored from a partial backup can be missing an earlier
 * migration while having a later one. Applied timestamps with no journal entry
 * (a squashed or deleted migration file) are extra history, not drift, and are
 * ignored.
 */
export function pendingMigrations(entries: JournalEntry[], applied: number[]): string[] {
	const appliedSet = new Set(applied);
	return entries.filter((entry) => !appliedSet.has(entry.when)).map((entry) => entry.tag);
}
