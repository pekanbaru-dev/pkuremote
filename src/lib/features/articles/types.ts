/**
 * Article types — feature-layer types for the blog articles feature.
 * These are presentation-layer types derived from the Drizzle schema but
 * decoupled from it so the feature slice stays portable.
 */

export type ArticleStatus = "draft" | "in_review" | "published" | "archived";

export type Article = {
	id: string;
	title: string;
	slug: string;
	authorId: string;
	excerpt: string;
	body: string;
	coverImageUrl: string | null;
	status: ArticleStatus;
	publishedAt: Date | null;
	updatedAt: Date;
	reviewedBy: string | null;
	reviewedAt: Date | null;
	reviewNote: string | null;
	createdAt: Date;
};

export type ArticleWithAuthor = Article & {
	authorDisplayName: string | null;
	authorAvatarUrl: string | null;
};

export type ArticleCardData = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	coverImageUrl: string | null;
	publishedAt: Date | null;
	authorDisplayName: string | null;
	authorAvatarUrl: string | null;
};
