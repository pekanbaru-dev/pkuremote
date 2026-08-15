import type { ArticleWithAuthor, ArticleCardData } from "../types.ts";

/**
 * Escape JSON for safe embedding inside a `<script>` tag. `JSON.stringify`
 * leaves `</script>` intact, which the HTML parser interprets as the end of
 * the script element — allowing injected markup to run. We replace `<` with
 * its Unicode escape so the sequence `</script` can never appear in the output.
 */
function safeJson(value: unknown): string {
	return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Build the JSON-LD Article schema string for a blog post detail page.
 * Inserted via `{@html ...}` in `<svelte:head>`.
 */
export function articleJsonLd(article: ArticleWithAuthor, siteUrl: string): string {
	const url = `${siteUrl}/blog/${article.slug}`;
	const payload = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: article.title,
		description: article.excerpt,
		url,
		...(article.coverImageUrl ? { image: article.coverImageUrl } : {}),
		datePublished: article.publishedAt?.toISOString() ?? article.createdAt.toISOString(),
		dateModified: article.updatedAt.toISOString(),
		author: {
			"@type": "Person",
			name: article.authorDisplayName ?? "PKUBersua Author"
		},
		publisher: {
			"@type": "Organization",
			name: "PKUBersua",
			url: siteUrl
		}
	};
	return `<script type="application/ld+json">${safeJson(payload)}</script>`;
}

/**
 * Build the JSON-LD BreadcrumbList string for a blog post detail page.
 * Inserted via `{@html ...}` in `<svelte:head>`.
 */
export function breadcrumbJsonLd(article: ArticleWithAuthor, siteUrl: string): string {
	const payload = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Beranda",
				item: siteUrl
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Blog",
				item: `${siteUrl}/blog`
			},
			{
				"@type": "ListItem",
				position: 3,
				name: article.title,
				item: `${siteUrl}/blog/${article.slug}`
			}
		]
	};
	return `<script type="application/ld+json">${safeJson(payload)}</script>`;
}

/**
 * Build the JSON-LD ItemList string for the blog listing page.
 * Inserted via `{@html ...}` in `<svelte:head>`.
 */
export function articleListJsonLd(articles: ArticleCardData[], siteUrl: string): string {
	const payload = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: articles.map((article, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: `${siteUrl}/blog/${article.slug}`,
			name: article.title
		}))
	};
	return `<script type="application/ld+json">${safeJson(payload)}</script>`;
}
