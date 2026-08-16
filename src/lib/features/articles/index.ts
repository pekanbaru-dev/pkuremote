/**
 * Public surface for the `articles` feature (client-safe).
 *
 * Consumers SHALL import only from `$lib/features/articles`, never from the
 * nested `components/`, `services/`, or `types.ts` files directly.
 *
 * Server-only data access is in `$lib/server/articles` — use that from
 * `+page.server.ts` and `+server.ts` files only.
 */
export type { Article, ArticleStatus, ArticleWithAuthor, ArticleCardData } from "./types.ts";

export { articleJsonLd, breadcrumbJsonLd, articleListJsonLd } from "./services/json-ld.ts";

export { default as ArticleCard } from "./components/article-card.svelte";
export { default as ArticleEditor } from "./components/article-editor.svelte";
export { default as TipTapEditor } from "./components/tiptap-editor.svelte";
export { default as ArticleStatusBadge } from "./components/article-status-badge.svelte";
export { default as ArticleReviewForm } from "./components/article-review-form.svelte";
