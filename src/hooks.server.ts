import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/public";
import { env as privateEnv } from "$env/dynamic/private";
import { makeDevAdminUser, resolveDevLoginEmail } from "$lib/server/auth/dev-user";

// Authentication-guarded path prefixes. Matching unauthenticated requests are
// redirected to /login. This is an AUTH-only guard — it does not evaluate admin
// status; authorization for /admin/* is handled in src/routes/admin/+layout.server.ts.
const GUARDED_PREFIXES = ["/myprofile", "/admin"];

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(
		env.PUBLIC_SUPABASE_URL,
		env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					for (const { name, value, options } of cookiesToSet) {
						event.cookies.set(name, value, { ...options, path: options?.path ?? "/" });
					}
				}
			}
		}
	);

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === "content-range" || name === "x-supabase-api-version"
	});
};

// One-time warning so it's obvious in the dev server logs that real auth is
// being bypassed. `dev` is compiled to `false` in the production build.
let devLoginWarned = false;

const authGuard: Handle = async ({ event, resolve }) => {
	// DEV-ONLY: when running under the dev server with DEV_ADMIN_EMAIL set,
	// inject a synthetic user instead of reading the Supabase session. See
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
		const { user } = await event.locals.safeGetSession();
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

export const handle: Handle = sequence(supabase, authGuard);
