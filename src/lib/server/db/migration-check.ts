import { sql } from "drizzle-orm";
import journal from "../../../../db/migrations/meta/_journal.json";
import { db } from "./client";
import { pendingMigrations, type JournalEntry } from "./migration-status";

/**
 * Reads the live `drizzle.__drizzle_migrations` table and compares it against
 * the journal bundled into this build. The comparison itself lives in
 * `./migration-status` (pure, unit-tested); this file is the I/O around it.
 *
 * The journal is imported, not read from disk, so it travels inside the Docker
 * image and describes exactly the migrations this build expects.
 */

export type MigrationCheck =
	/** Schema matches the migrations this build expects. */
	| { status: "ok"; pending: string[] }
	/** Migrations exist in this build that have not been applied here. */
	| { status: "pending"; pending: string[] }
	/** Could not determine — the DB is unreachable or has no drizzle schema. */
	| { status: "unknown"; cause: unknown };

const journalEntries: JournalEntry[] = journal.entries.map((entry) => ({
	tag: entry.tag,
	when: entry.when
}));

/** The migration tags this build ships, in journal order. */
export function expectedMigrations(): string[] {
	return journalEntries.map((entry) => entry.tag);
}

/**
 * Compare the database's applied-migration log against this build's journal.
 * Never throws — an unreachable database yields `unknown`, so a caller can
 * report degraded health without taking the process down.
 */
export async function checkMigrations(): Promise<MigrationCheck> {
	try {
		const rows = await db.execute<{ created_at: string | number }>(
			sql`select created_at from drizzle.__drizzle_migrations`
		);
		// postgres-js returns bigint as a string; the journal uses numbers.
		const applied = Array.from(rows, (row) => Number(row.created_at)).filter(Number.isFinite);
		const pending = pendingMigrations(journalEntries, applied);
		return pending.length === 0 ? { status: "ok", pending } : { status: "pending", pending };
	} catch (cause) {
		return { status: "unknown", cause };
	}
}

/**
 * Run the check once at boot and log the result. Pending migrations are logged
 * as FATAL but do NOT stop the process: `docker compose up -d` replaces the
 * running container, so refusing to start would turn a partial degradation
 * into a guaranteed total outage. `/healthz` reports the same state for the
 * post-deploy smoke test to fail on (see issue #60).
 */
export async function logMigrationStatusOnBoot(): Promise<MigrationCheck> {
	const check = await checkMigrations();

	if (check.status === "pending") {
		console.error(
			`[migrations] FATAL: ${check.pending.length} migration(s) in this build have not been applied to the database: ${check.pending.join(", ")}. ` +
				`The app is running against an older schema and WILL return 500s. Apply them (see DEPLOY.md "Database migrations").`
		);
	} else if (check.status === "unknown") {
		console.error(
			"[migrations] Could not verify the applied-migration log; schema drift is undetected.",
			check.cause
		);
	} else {
		console.info(`[migrations] schema up to date (${check.pending.length} pending).`);
	}

	return check;
}
