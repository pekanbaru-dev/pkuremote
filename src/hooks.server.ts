import { type Handle, error, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { env as privateEnv } from "$env/dynamic/private";
import { makeDevAdminUser, resolveDevLoginEmail } from "$lib/server/auth/dev-user";
import { SESSION_COOKIE, resolveSessionUser } from "$lib/server/auth/session";
import { resolveSessionOutcome } from "$lib/server/auth/session-resolution";
import { logMigrationStatusOnBoot } from "$lib/server/db/migration-check";

// Authentication-guarded path prefixes. Matching unauthenticated requests are
// redirected to /login. This is an AUTH-only guard — it does not evaluate admin
// status; authorization for /admin/* is handled in src/routes/admin/+layout.server.ts.
// User-authenticated routes under /auth/* are guarded by src/routes/auth/+layout.server.ts
// (SvelteKit layouts do not run for +server.ts endpoints, so /auth/callback is unaffected).
const GUARDED_PREFIXES = ["/admin"];

// One-time warning so it's obvious in the dev server logs that real auth is
// being bypassed. `dev` is compiled to `false` in the production build.
let devLoginWarned = false;

// Verify once per process that the database has the migrations this build
// expects, and log loudly if not. Deliberately fire-and-forget: it must not
// delay or block serving (see logMigrationStatusOnBoot for why it does not
// halt the process). /healthz reports the same state for the deploy to fail on.
void logMigrationStatusOnBoot();

export const handle: Handle = async ({ event, resolve }) => {
	// Set when the session lookup itself failed (schema drift, DB down) as
	// opposed to the token simply being unknown. Guarded routes use this to
	// avoid bouncing users to a /login that cannot work either.
	let sessionUnavailable = false;

	// DEV-ONLY: when running under the dev server with DEV_ADMIN_EMAIL set,
	// inject a synthetic user instead of reading the session. See
	// $lib/server/auth/dev-user for the double-gated safety rationale.
	const devEmail = resolveDevLoginEmail(dev, privateEnv.DEV_ADMIN_EMAIL);
	if (devEmail) {
		if (!devLoginWarned) {
			console.warn(
				`[dev-login] Auth bypass active — signed in as "${devEmail}". Unset DEV_ADMIN_EMAIL to use real login.`
			);
			devLoginWarned = true;
		}
		event.locals.user = makeDevAdminUser(devEmail);
	} else {
		// Validate the session against the sessions table (not a remote auth
		// server). resolveSessionOutcome never throws: an exception here would
		// 500 EVERY route including /login, leaving users unable to recover
		// (see issue #61).
		const token = event.cookies.get(SESSION_COOKIE);
		const outcome = await resolveSessionOutcome(token, resolveSessionUser);

		switch (outcome.status) {
			case "authenticated":
				event.locals.user = outcome.user;
				break;
			case "invalid":
				// Genuinely unknown/expired token — clear the stale cookie
				// (resolveSessionUser also delete-on-encounters expired rows).
				event.cookies.delete(SESSION_COOKIE, { path: "/" });
				event.locals.user = null;
				break;
			case "unavailable":
				// The cookie may well be valid; we just cannot check right now.
				// Do NOT delete it, or a transient DB fault would permanently
				// sign out legitimate sessions.
				console.error(
					"[auth] session lookup failed — serving this request as anonymous.",
					outcome.cause
				);
				sessionUnavailable = true;
				event.locals.user = null;
				break;
			case "anonymous":
				event.locals.user = null;
				break;
		}
	}

	const isGuarded = GUARDED_PREFIXES.some(
		(prefix) => event.url.pathname === prefix || event.url.pathname.startsWith(`${prefix}/`)
	);
	if (!event.locals.user && isGuarded) {
		// When the session store is unreachable, redirecting to /login is a dead
		// end — signing in needs the same database. Say so instead of looping.
		if (sessionUnavailable) {
			error(503, "Layanan sesi sedang tidak tersedia. Coba lagi beberapa saat lagi.");
		}
		const target = event.url.pathname + event.url.search;
		redirect(302, `/login?redirect=${encodeURIComponent(target)}`);
	}

	return resolve(event);
};
