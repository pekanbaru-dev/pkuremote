/**
 * Helpers for classifying database errors by their Postgres error code.
 *
 * Drizzle (>= 0.45) wraps every driver error in a `DrizzleQueryError` whose
 * message is `Failed query: …` and whose `.cause` holds the real `postgres`
 * error — the one carrying `.code` (e.g. "23505"). The wrapper itself has no
 * `.code`, so reading it off the top-level error silently misses every
 * constraint violation. These helpers walk the `.cause` chain instead.
 */

/** SQLSTATE codes we branch on. */
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";

/**
 * Return the Postgres SQLSTATE code for a thrown DB error, unwrapping drizzle's
 * `DrizzleQueryError` (and any further nesting) via `.cause`. Returns
 * `undefined` when no code is found in the chain.
 */
export function pgErrorCode(err: unknown): string | undefined {
	let current: unknown = err;
	for (let depth = 0; depth < 5 && current != null; depth++) {
		const code = (current as { code?: unknown }).code;
		if (typeof code === "string") return code;
		current = (current as { cause?: unknown }).cause;
	}
	return undefined;
}

/** True when the error is a Postgres unique-constraint violation (23505). */
export function isUniqueViolation(err: unknown): boolean {
	return pgErrorCode(err) === PG_UNIQUE_VIOLATION;
}

/** True when the error is a Postgres foreign-key violation (23503). */
export function isForeignKeyViolation(err: unknown): boolean {
	return pgErrorCode(err) === PG_FOREIGN_KEY_VIOLATION;
}
