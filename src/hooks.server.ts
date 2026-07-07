import { type Handle, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { env as privateEnv } from "$env/dynamic/private";
import { makeDevAdminUser, resolveDevLoginEmail } from "$lib/server/auth/dev-user";
import { SESSION_COOKIE, resolveSessionUser } from "$lib/server/auth/session";

// Authentication-guarded path prefixes. Matching unauthenticated requests are
// redirected to /login. This is an AUTH-only guard — it does not evaluate admin
// status; authorization for /admin/* is handled in src/routes/admin/+layout.server.ts.
const GUARDED_PREFIXES = ["/myprofile", "/admin"];

// One-time warning so it's obvious in the dev server logs that real auth is
// being bypassed. `dev` is compiled to `false` in the production build.
let devLoginWarned = false;

export const handle: Handle = async ({ event, resolve }) => {
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
		// server). An unknown/expired session yields a null user; a stale cookie
		// is cleared (resolveSessionUser also delete-on-encounters expired rows).
		const token = event.cookies.get(SESSION_COOKIE);
		const user = token ? await resolveSessionUser(token) : null;
		if (token && !user) {
			event.cookies.delete(SESSION_COOKIE, { path: "/" });
		}
		event.locals.user = user;
	}

	const isGuarded = GUARDED_PREFIXES.some(
		(prefix) => event.url.pathname === prefix || event.url.pathname.startsWith(`${prefix}/`)
	);
	if (!event.locals.user && isGuarded) {
		const target = event.url.pathname + event.url.search;
		redirect(302, `/login?redirect=${encodeURIComponent(target)}`);
	}

	return resolve(event);
};
