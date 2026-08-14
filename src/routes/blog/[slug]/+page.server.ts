import { error, redirect } from "@sveltejs/kit";
import { getArticleBySlug, findRedirectForSlug } from "$lib/server/articles";
import { renderMarkdown } from "$lib/server/markdown";
import { articleJsonLd, breadcrumbJsonLd } from "$lib/features/articles";
import { PUBLIC_SITE_URL } from "$env/static/public";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const article = await getArticleBySlug(params.slug);

	if (!article) {
		// Check if there's a redirect for this old slug
		const redir = await findRedirectForSlug(params.slug);
		if (redir) {
			redirect(301, `/blog/${redir.currentSlug}`);
		}
		error(404, "Artikel tidak ditemukan.");
	}

	const bodyHtml = renderMarkdown(article.body);
	const jsonLdArticle = articleJsonLd(article, PUBLIC_SITE_URL);
	const jsonLdBreadcrumb = breadcrumbJsonLd(article, PUBLIC_SITE_URL);

	return { article, bodyHtml, jsonLdArticle, jsonLdBreadcrumb };
};
