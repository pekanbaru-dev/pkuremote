import { json } from "@sveltejs/kit";
import { checkMigrations, expectedMigrations } from "$lib/server/db/migration-check";
import type { RequestHandler } from "./$types";

/**
 * Deploy/monitoring health check. Reports whether the database schema matches
 * the migrations this build expects, so a deploy that shipped code ahead of the
 * schema can be caught immediately instead of surfacing as scattered 500s hours
 * later (see issue #60).
 *
 * Returns 503 when migrations are pending or the log cannot be read, so
 * `curl -f` in the deploy workflow fails the job. Counts only — the pending
 * tags are logged server-side rather than exposed on a public endpoint.
 */
export const GET: RequestHandler = async () => {
	const check = await checkMigrations();
	const expected = expectedMigrations().length;

	const healthy = check.status === "ok";
	const body = {
		status: healthy ? "ok" : "degraded",
		migrations: {
			status: check.status,
			expected,
			pending: check.status === "unknown" ? null : check.pending.length
		}
	};

	return json(body, {
		status: healthy ? 200 : 503,
		headers: { "cache-control": "no-store" }
	});
};
