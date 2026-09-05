/**
 * Articles service — Drizzle-backed CRUD + workflow transitions for the
 * `posts` table. All functions are server-only (import from $lib/server/).
 *
 * Workflow transitions:
 *   draft → in_review      (submitForReview — author)
 *   rejected → in_review   (submitForReview — author, re-submit after rejection)
 *   in_review → published  (approveArticle — editor/admin)
 *   in_review → rejected   (rejectArticle — editor/admin)
 *   published → archived   (archiveArticle — admin only)
 *   published → draft      (unpublishArticle — editor/admin)
 */
import { eq, desc, and, count, sql } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { posts, postSlugRedirects, profiles, categories } from "../../../../db/schema";
import type { PostStatus } from "../../../../db/schema";
import { generateUniqueSlug } from "./slug";

export type { PostStatus };

export type ArticleRow = typeof posts.$inferSelect;

export type ArticleWithAuthor = ArticleRow & {
	authorDisplayName: string | null;
	authorAvatarUrl: string | null;
	categoryName?: string | null;
};

export type PaginatedArticles = {
	articles: ArticleWithAuthor[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type CreateArticleInput = {
	title: string;
	excerpt: string;
	body: string;
	authorId: string;
	coverImageUrl?: string | null;
	categoryId?: string | null;
	tags?: string[];
};

export type UpdateArticleInput = {
	title?: string;
	slug?: string;
	excerpt?: string;
	body?: string;
	coverImageUrl?: string | null;
	categoryId?: string | null;
	tags?: string[];
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Load a single article by ID, joined with author profile.
 * Returns undefined when not found.
 */
export async function getArticleById(id: string): Promise<ArticleWithAuthor | undefined> {
	const [row] = await db
		.select({
			...articleColumns(),
			authorDisplayName: profiles.displayName,
			authorAvatarUrl: profiles.avatarUrl
		})
		.from(posts)
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.where(eq(posts.id, id))
		.limit(1);
	return row as ArticleWithAuthor | undefined;
}

/**
 * Load a single published article by slug.
 * Returns undefined when not found or not published.
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithAuthor | undefined> {
	const [row] = await db
		.select({
			...articleColumns(),
			authorDisplayName: profiles.displayName,
			authorAvatarUrl: profiles.avatarUrl,
			categoryName: categories.name
		})
		.from(posts)
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.leftJoin(categories, eq(categories.id, posts.categoryId))
		.where(and(eq(posts.slug, slug), eq(posts.status, "published")))
		.limit(1);
	return row as ArticleWithAuthor | undefined;
}

/**
 * Return published articles, paginated, newest first.
 *
 * Pass `limit` to override the default page size (used by the RSS feed
 * which needs more than the default 10 rows in a single response).
 */
export async function getPublishedArticles(
	page = 1,
	limit = PAGE_SIZE
): Promise<PaginatedArticles> {
	const offset = (page - 1) * limit;

	const [rows, [countRow]] = await Promise.all([
		db
			.select({
				...articleColumns(),
				authorDisplayName: profiles.displayName,
				authorAvatarUrl: profiles.avatarUrl,
				categoryName: categories.name
			})
			.from(posts)
			.leftJoin(profiles, eq(profiles.id, posts.authorId))
			.leftJoin(categories, eq(categories.id, posts.categoryId))
			.where(eq(posts.status, "published"))
			.orderBy(desc(posts.publishedAt))
			.limit(limit)
			.offset(offset),
		db.select({ total: count() }).from(posts).where(eq(posts.status, "published"))
	]);

	const total = countRow?.total ?? 0;
	return {
		articles: rows as ArticleWithAuthor[],
		total,
		page,
		pageSize: limit,
		totalPages: Math.ceil(total / limit)
	};
}

/**
 * Return all articles by a specific author, newest first.
 * Optionally filter by status and/or search query (title, excerpt).
 */
export async function getArticlesByAuthor(
	authorId: string,
	opts: { status?: PostStatus | null; q?: string | null } = {}
): Promise<ArticleWithAuthor[]> {
	const conditions = [eq(posts.authorId, authorId)];

	if (opts.status) {
		conditions.push(eq(posts.status, opts.status));
	}

	if (opts.q?.trim()) {
		const term = `%${opts.q.trim().toLowerCase()}%`;
		conditions.push(
			sql`(lower(${posts.title}) like ${term} or lower(${posts.excerpt}) like ${term})`
		);
	}

	const rows = await db
		.select({
			...articleColumns(),
			authorDisplayName: profiles.displayName,
			authorAvatarUrl: profiles.avatarUrl,
			categoryName: categories.name
		})
		.from(posts)
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.leftJoin(categories, eq(categories.id, posts.categoryId))
		.where(and(...conditions))
		.orderBy(desc(posts.createdAt));
	return rows as ArticleWithAuthor[];
}

/**
 * Return all articles (all statuses), with author, for admin/editor queue.
 * Optionally filter by status.
 */
export async function getAllArticles(status?: PostStatus): Promise<ArticleWithAuthor[]> {
	const rows = await db
		.select({
			...articleColumns(),
			authorDisplayName: profiles.displayName,
			authorAvatarUrl: profiles.avatarUrl
		})
		.from(posts)
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.where(status ? eq(posts.status, status) : undefined)
		.orderBy(desc(posts.createdAt));
	return rows as ArticleWithAuthor[];
}

/**
 * Check if a slug redirect exists. Returns the current post slug if found.
 */
export async function findRedirectForSlug(
	oldSlug: string
): Promise<{ postId: string; currentSlug: string } | undefined> {
	const [row] = await db
		.select({
			postId: postSlugRedirects.postId,
			currentSlug: posts.slug
		})
		.from(postSlugRedirects)
		.innerJoin(posts, eq(posts.id, postSlugRedirects.postId))
		.where(eq(postSlugRedirects.oldSlug, oldSlug))
		.limit(1);
	return row;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/**
 * Create a new article as draft. Generates a unique slug from the title.
 */
export async function createArticle(input: CreateArticleInput): Promise<ArticleRow> {
	const slug = await generateUniqueSlug(input.title);
	const now = new Date();
	const [row] = await db
		.insert(posts)
		.values({
			title: input.title,
			slug,
			authorId: input.authorId,
			excerpt: input.excerpt,
			body: input.body,
			coverImageUrl: input.coverImageUrl ?? null,
			categoryId: input.categoryId ?? null,
			tags: input.tags ?? [],
			status: "draft",
			updatedAt: now
		})
		.returning();
	return row;
}

/**
 * Update article fields. If slug changes on a published post, the old slug
 * is saved to post_slug_redirects. Use updateSlugWithRedirect for slug-only
 * changes; this function handles it transparently when slug is in the input.
 */
export async function updateArticle(id: string, input: UpdateArticleInput): Promise<ArticleRow> {
	const now = new Date();

	// If slug is being changed on a published post, record the redirect
	if (input.slug) {
		const current = await getArticleById(id);
		if (current && current.slug !== input.slug && current.status === "published") {
			await db
				.insert(postSlugRedirects)
				.values({ oldSlug: current.slug, postId: id })
				.onConflictDoNothing();
		}
	}

	const [row] = await db
		.update(posts)
		.set({ ...input, updatedAt: now })
		.where(eq(posts.id, id))
		.returning();
	return row;
}

/**
 * Explicitly update slug and record redirect if the post is published.
 */
export async function updateSlugWithRedirect(id: string, newSlug: string): Promise<ArticleRow> {
	return updateArticle(id, { slug: newSlug });
}

/**
 * Submit an article for editorial review (draft → in_review, rejected → in_review).
 */
export async function submitForReview(id: string): Promise<ArticleRow> {
	const [row] = await db
		.update(posts)
		.set({ status: "in_review", updatedAt: new Date() })
		.where(
			and(
				eq(posts.id, id),
				sql`${posts.status} in ('draft', 'rejected')`
			)
		)
		.returning();
	return row;
}

/**
 * Approve an article (in_review → published).
 * Sets publishedAt to now if not already set.
 */
export async function approveArticle(id: string, reviewerId: string): Promise<ArticleRow> {
	const now = new Date();
	const [row] = await db
		.update(posts)
		.set({
			status: "published",
			publishedAt: now,
			reviewedBy: reviewerId,
			reviewedAt: now,
			reviewNote: null,
			updatedAt: now
		})
		.where(and(eq(posts.id, id), eq(posts.status, "in_review")))
		.returning();
	return row;
}

/**
 * Reject an article (in_review → rejected) with an optional review note.
 */
export async function rejectArticle(
	id: string,
	reviewerId: string,
	reviewNote?: string
): Promise<ArticleRow> {
	const now = new Date();
	const [row] = await db
		.update(posts)
		.set({
			status: "rejected",
			reviewedBy: reviewerId,
			reviewedAt: now,
			reviewNote: reviewNote ?? null,
			updatedAt: now
		})
		.where(and(eq(posts.id, id), eq(posts.status, "in_review")))
		.returning();
	return row;
}

/**
 * Archive a published article (published → archived). Admin only.
 */
export async function archiveArticle(id: string): Promise<ArticleRow> {
	const [row] = await db
		.update(posts)
		.set({ status: "archived", updatedAt: new Date() })
		.where(and(eq(posts.id, id), eq(posts.status, "published")))
		.returning();
	return row;
}

/**
 * Unpublish an article back to draft (published → draft).
 */
export async function unpublishArticle(id: string): Promise<ArticleRow> {
	const [row] = await db
		.update(posts)
		.set({ status: "draft", publishedAt: null, updatedAt: new Date() })
		.where(and(eq(posts.id, id), eq(posts.status, "published")))
		.returning();
	return row;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Column projection that maps posts columns — used in joined queries. */
function articleColumns() {
	return {
		id: posts.id,
		title: posts.title,
		slug: posts.slug,
		authorId: posts.authorId,
		excerpt: posts.excerpt,
		body: posts.body,
		coverImageUrl: posts.coverImageUrl,
		categoryId: posts.categoryId,
		tags: posts.tags,
		status: posts.status,
		publishedAt: posts.publishedAt,
		updatedAt: posts.updatedAt,
		reviewedBy: posts.reviewedBy,
		reviewedAt: posts.reviewedAt,
		reviewNote: posts.reviewNote,
		createdAt: posts.createdAt
	};
}
