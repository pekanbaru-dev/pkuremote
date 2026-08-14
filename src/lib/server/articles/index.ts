/**
 * Server-only articles service barrel.
 *
 * Re-exports the Drizzle-backed data-access functions and slug utilities
 * for `+page.server.ts` and `+server.ts` files. NOT safe for client-side
 * import — pulls in `$lib/server/db` (the Drizzle client) and `postgres`.
 */
export {
	getArticleById,
	getArticleBySlug,
	getPublishedArticles,
	getArticlesByAuthor,
	getAllArticles,
	findRedirectForSlug,
	createArticle,
	updateArticle,
	updateSlugWithRedirect,
	submitForReview,
	approveArticle,
	rejectArticle,
	archiveArticle,
	unpublishArticle,
	type ArticleRow,
	type ArticleWithAuthor,
	type PaginatedArticles,
	type CreateArticleInput,
	type UpdateArticleInput,
	type PostStatus
} from "./db-articles.js";

export { generateSlug, generateUniqueSlug } from "./slug.js";
