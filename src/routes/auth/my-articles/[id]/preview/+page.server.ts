import { error } from "@sveltejs/kit";
import { getArticleById } from "$lib/server/articles";
import { getAllCategories } from "$lib/server/events";
import { sanitizeArticleHtml } from "$lib/server/markdown";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const article = await getArticleById(params.id);
	if (!article) error(404, "Artikel tidak ditemukan.");
	if (article.authorId !== locals.user!.id) error(403, "Kamu tidak punya akses ke artikel ini.");

	const categories = await getAllCategories();
	const categoryName = categories.find((c) => c.id === article.categoryId)?.name ?? null;
	const bodyHtml = sanitizeArticleHtml(article.body);

	return { article: { ...article, categoryName }, bodyHtml };
};
