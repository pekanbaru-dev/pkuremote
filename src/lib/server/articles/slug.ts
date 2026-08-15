import { eq, and, not } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { posts, postSlugRedirects } from "../../../../db/schema";

/**
 * Convert a title string to a URL-safe slug.
 * Rules: lowercase, spaces → dash, strip non-alphanumeric (except dash), collapse multiple dashes.
 *
 * Pure function — no DB access. Safe to call client-side for preview.
 */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // strip non-word chars except spaces and dashes
		.replace(/[\s_]+/g, "-") // spaces/underscores → dash
		.replace(/-+/g, "-") // collapse multiple dashes
		.replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

/**
 * Generate a unique slug for a post title, checking the DB for conflicts.
 * If the base slug already exists, appends `-2`, `-3`, etc. until a free
 * slot is found.
 *
 * Conflicts are checked against both `posts.slug` and
 * `post_slug_redirects.old_slug` so that a redirect slug is never
 * reassigned to a new article (which would break the 301 redirect
 * chain from the old article).
 *
 * @param title   The post title to slugify.
 * @param excludeId  Optional post ID to exclude from conflict check (for edits —
 *                   a post doesn't conflict with itself).
 */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
	const base = generateSlug(title);
	if (!base) return `post-${Date.now()}`;

	// Check if base slug is free
	const candidate = await findConflict(base, excludeId);
	if (!candidate) return base;

	// Find the next available suffix
	let counter = 2;
	while (true) {
		const slugWithSuffix = `${base}-${counter}`;
		const conflict = await findConflict(slugWithSuffix, excludeId);
		if (!conflict) return slugWithSuffix;
		counter++;
	}
}

/**
 * Returns the conflicting row (truthy) or undefined (falsy = slot is free).
 * Checks both the `posts.slug` column and the `post_slug_redirects.old_slug`
 * column so that redirect slugs are reserved and never reused.
 */
async function findConflict(slug: string, excludeId?: string) {
	const postConditions = excludeId
		? and(eq(posts.slug, slug), not(eq(posts.id, excludeId)))
		: eq(posts.slug, slug);

	const [postRow, redirectRow] = await Promise.all([
		db.select({ id: posts.id }).from(posts).where(postConditions).limit(1),
		db
			.select({ id: postSlugRedirects.id })
			.from(postSlugRedirects)
			.where(eq(postSlugRedirects.oldSlug, slug))
			.limit(1)
	]);

	return postRow[0] ?? redirectRow[0];
}
