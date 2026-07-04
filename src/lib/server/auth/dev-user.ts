import type { User } from "@supabase/supabase-js";

/**
 * DEV-ONLY local login bypass.
 *
 * When the app runs under the Vite dev server AND `DEV_ADMIN_EMAIL` is set,
 * `hooks.server.ts` skips the Supabase session lookup and injects the synthetic
 * user built here as `locals.user`. This exists so an admin can work on the
 * `/admin` panel locally without a working Google OAuth round-trip.
 *
 * Safety: the bypass is double-gated. `dev` (from `$app/environment`) is
 * statically `false` in the adapter-node production build, so the whole branch
 * is dead-code-eliminated there; `resolveDevLoginEmail` fail-closes on top of
 * that. A stray `DEV_ADMIN_EMAIL` in a built/prod environment can therefore
 * never activate this.
 *
 * Note: the synthetic id is NOT a row in Supabase `auth.users`, so
 * profile-bound flows (booking, `/myprofile`) that FK to `profiles`/`auth.users`
 * won't fully work under the bypass — it targets admin browsing. To exercise
 * admin gating, set `DEV_ADMIN_EMAIL` to an address that is also in
 * `ADMIN_EMAILS` (that allow-list is what `requireAdmin` checks).
 */

/**
 * Fixed id for the dev-login user. A valid, non-nil UUID (GoTrue rejects the
 * all-zero UUID), distinct from the seed author (`…0001`). Run
 * `pnpm db:seed-dev-admin` once to provision a real auth.users + profiles row
 * at this id so profile-bound flows (booking, /myprofile) work under the bypass.
 */
export const DEV_ADMIN_USER_ID = "00000000-0000-0000-0000-0000000000de";

/**
 * Return the dev-login email ONLY when running under the dev server and a
 * non-empty `DEV_ADMIN_EMAIL` is set; `null` otherwise. Pure and fail-closed:
 * `isDev === false` always yields `null`, whatever the env holds.
 */
export function resolveDevLoginEmail(
	isDev: boolean,
	email: string | undefined | null
): string | null {
	if (!isDev) return null;
	const trimmed = email?.trim();
	return trimmed ? trimmed : null;
}

/** Build a synthetic Supabase-shaped user for the dev-login bypass. */
export function makeDevAdminUser(email: string): User {
	return {
		id: DEV_ADMIN_USER_ID,
		aud: "authenticated",
		role: "authenticated",
		email,
		app_metadata: { provider: "dev" },
		user_metadata: { full_name: "Dev Admin", email },
		created_at: "1970-01-01T00:00:00.000Z"
	};
}
