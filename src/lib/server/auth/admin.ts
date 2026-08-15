import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

/**
 * Whether the request's validated user is an administrator.
 *
 * Reads `locals.user.role` which is loaded from `profiles.role` in
 * `resolveSessionUser` — no extra DB query per request.
 *
 * **Migration fallback:** until all existing admins have been backfilled
 * into `profiles.role = 'admin'`, the legacy `ADMIN_EMAILS` env allow-list
 * is still checked as a safety net so existing deployments don't lose
 * admin access on upgrade. Once the backfill is complete, remove the
 * fallback and the `ADMIN_EMAILS` env var (see design.md).
 */
export function isAdmin(locals: App.Locals): boolean {
	if (locals.user?.role === "admin") return true;
	// Legacy fallback: email-based admin allow-list for pre-migration deployments.
	if (locals.user?.email) {
		return isEmailAdmin(locals.user.email, parseAdminEmails(env.ADMIN_EMAILS));
	}
	return false;
}

/**
 * Whether the request's validated user is an editor or administrator.
 * Editors can review and publish articles; admins have full access.
 */
export function isEditor(locals: App.Locals): boolean {
	if (locals.user?.role === "editor" || locals.user?.role === "admin") return true;
	// Legacy fallback: ADMIN_EMAILS members are treated as admins (who are editors).
	if (locals.user?.email) {
		return isEmailAdmin(locals.user.email, parseAdminEmails(env.ADMIN_EMAILS));
	}
	return false;
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
// Legacy helpers — retained as the implementation of the ADMIN_EMAILS
// fallback during the role migration. Will be removed once all deployments
// have backfilled profiles.role and ADMIN_EMAILS is dropped.
// ---------------------------------------------------------------------------

/**
 * Parse the `ADMIN_EMAILS` allow-list into a set of normalized (trimmed,
 * lowercased, non-empty) email addresses. The value is comma-separated and
 * supports any number of admins. An unset, blank, or separators-only value
 * yields an empty set — i.e. no admins (fail closed).
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
 * True iff `email` is a member of the admin allow-list, compared
 * case-insensitively. A null/blank email is never an admin.
 */
export function isEmailAdmin(email: string | null | undefined, adminEmails: Set<string>): boolean {
	if (!email) return false;
	return adminEmails.has(email.trim().toLowerCase());
}
