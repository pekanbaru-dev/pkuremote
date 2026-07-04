import { requireAdmin } from "$lib/server/auth/admin";
import type { LayoutServerLoad } from "./$types";

/**
 * Authorization gate for the whole /admin route group. Authentication is
 * already enforced by GUARDED_PREFIXES in hooks.server.ts (unauthenticated
 * requests are redirected to /login); here we redirect authenticated
 * non-admins to /. The validated user is passed down for the admin chrome.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return { user: locals.user };
};
