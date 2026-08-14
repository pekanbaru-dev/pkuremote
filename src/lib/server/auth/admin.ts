import { redirect } from "@sveltejs/kit";

/**
 * Whether the request's validated user is an administrator.
 *
 * Reads `locals.user.role` which is loaded from `profiles.role` in
 * `resolveSessionUser` — no extra DB query per request.
 *
 * Previously this checked the `ADMIN_EMAILS` env allow-list. That seam has
 * now been fulfilled: role is the single source of truth in the DB.
 */
export function isAdmin(locals: App.Locals): boolean {
	return locals.user?.role === "admin";
}

/**
 * Whether the request's validated user is an editor or administrator.
 * Editors can review and publish articles; admins have full access.
 */
export function isEditor(locals: App.Locals): boolean {
	return locals.user?.role === "editor" || locals.user?.role === "admin";
}

/**
 * Assert administrator access, or redirect. Redirects an authenticated but
 * non-admin user to `/`. Assumes authentication was already enforced upstream
 * (see `GUARDED_PREFIXES` in `hooks.server.ts`, which redirects unauthenticated
 * `/admin/*` requests to `/login`), so it handles only the
 * authenticated-but-not-authorized case.
 */
export function requireAdmin(locals: App.Locals): void {
	if (!isAdmin(locals)) {
		redirect(303, "/");
	}
}

/**
 * Assert editor (or admin) access, or redirect. Used to gate
 * `/admin/articles` routes that editors need but regular users do not.
 */
export function requireEditor(locals: App.Locals): void {
	if (!isEditor(locals)) {
		redirect(303, "/");
	}
}

// ---------------------------------------------------------------------------
// Legacy helpers retained for existing tests. No longer used by runtime code.
// Will be removed in a follow-up cleanup change once tests are updated.
// ---------------------------------------------------------------------------

/**
 * @deprecated Use `isAdmin(locals)` instead. Kept for test compatibility.
 */
export function parseAdminEmails(raw: string | null | undefined): Set<string> {
	if (!raw) return new Set();
	return new Set(
		raw
			.split(",")
			.map((entry) => entry.trim().toLowerCase())
			.filter((entry) => entry.length > 0)
	);
}

/**
 * @deprecated Use `isAdmin(locals)` instead. Kept for test compatibility.
 */
export function isEmailAdmin(email: string | null | undefined, adminEmails: Set<string>): boolean {
	if (!email) return false;
	return adminEmails.has(email.trim().toLowerCase());
}
