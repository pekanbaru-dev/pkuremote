import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";

/**
 * Parse the `ADMIN_EMAILS` allow-list into a set of normalized (trimmed,
 * lowercased, non-empty) email addresses. The value is comma-separated and
 * supports any number of admins. An unset, blank, or separators-only value
 * yields an empty set — i.e. no admins (fail closed): a misconfigured
 * allow-list never grants access.
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

// Cache the parsed set, re-parsing only when the raw env value changes.
let cachedRaw: string | null | undefined = undefined;
let cachedSet = new Set<string>();
let cacheInitialized = false;

function adminEmailSet(): Set<string> {
	const raw = env.ADMIN_EMAILS;
	if (!cacheInitialized || raw !== cachedRaw) {
		cachedRaw = raw;
		cachedSet = parseAdminEmails(raw);
		cacheInitialized = true;
	}
	return cachedSet;
}

/**
 * Whether the request's validated user is an administrator. Server-only.
 *
 * This is the SINGLE seam all admin gating funnels through: a future
 * DB-backed RBAC change replaces the body of this function (env allow-list →
 * role lookup) without touching any call site.
 */
export function isAdmin(locals: App.Locals): boolean {
	return isEmailAdmin(locals.user?.email, adminEmailSet());
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
