import { error } from "@sveltejs/kit";
import { getArticlesByAuthor, archiveArticle, getArticleById } from "$lib/server/articles";
import type { Actions, PageServerLoad } from "./$types";
import type { PostStatus } from "../../../../db/schema";

const VALID_STATUSES: PostStatus[] = ["draft", "in_review", "published", "archived", "rejected"];

export const load: PageServerLoad = async ({ locals, url }) => {
	const statusParam = url.searchParams.get("status");
	const q = url.searchParams.get("q") ?? undefined;
	const status =
		statusParam && VALID_STATUSES.includes(statusParam as PostStatus)
			? (statusParam as PostStatus)
			: null;

	const articles = await getArticlesByAuthor(locals.user!.id, { status, q });

	// Counts per status for filter tabs — always unfiltered
	const allArticles = status || q ? await getArticlesByAuthor(locals.user!.id) : articles;
	const counts = {
		all: allArticles.length,
		draft: allArticles.filter((a) => a.status === "draft").length,
		in_review: allArticles.filter((a) => a.status === "in_review").length,
		published: allArticles.filter((a) => a.status === "published").length,
		rejected: allArticles.filter((a) => a.status === "rejected").length,
		archived: allArticles.filter((a) => a.status === "archived").length
	};

	return { articles, counts, activeStatus: status, activeQ: q ?? "" };
};

export const actions: Actions = {
	archive: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get("id") as string;
		if (!id) error(400, "ID artikel tidak ditemukan.");

		const article = await getArticleById(id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.authorId !== locals.user!.id) error(403, "Akses ditolak.");

		await archiveArticle(id);
		return { success: true };
	}
};
