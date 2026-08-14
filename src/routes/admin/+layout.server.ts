import { requireAdmin, requireEditor } from "$lib/server/auth/admin";
import type { LayoutServerLoad } from "./$types";

/**
 * Authorization gate for the whole /admin route group. Authentication is
 * already enforced by GUARDED_PREFIXES in hooks.server.ts (unauthenticated
 * requests are redirected to /login); here we redirect authenticated
 * non-admins/non-editors to /.
 *
 * Routes under /admin/articles are accessible to editors AND admins.
 * All other /admin routes require admin role.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isArticlesRoute = url.pathname.startsWith("/admin/articles");
	if (isArticlesRoute) {
		requireEditor(locals);
	} else {
		requireAdmin(locals);
	}
	return { user: locals.user };
};
