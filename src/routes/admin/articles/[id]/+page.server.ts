import { error, fail } from "@sveltejs/kit";
import {
	getArticleById,
	approveArticle,
	rejectArticle,
	archiveArticle,
	updateSlugWithRedirect,
	generateUniqueSlug
} from "$lib/server/articles";
import { requireEditor, isAdmin } from "$lib/server/auth/admin";
import { renderMarkdown } from "$lib/server/markdown";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	requireEditor(locals);
	const article = await getArticleById(params.id);
	if (!article) error(404, "Artikel tidak ditemukan.");
	const bodyHtml = renderMarkdown(article.body);
	return { article, bodyHtml, isAdmin: isAdmin(locals) };
};

export const actions: Actions = {
	approve: async ({ params, locals }) => {
		requireEditor(locals);
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.status !== "in_review") {
			return fail(400, { error: "Hanya artikel in_review yang bisa disetujui." });
		}
		await approveArticle(params.id, locals.user!.id);
		return { success: true, action: "approved" };
	},

	reject: async ({ params, request, locals }) => {
		requireEditor(locals);
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.status !== "in_review") {
			return fail(400, { error: "Hanya artikel in_review yang bisa ditolak." });
		}
		const formData = await request.formData();
		const reviewNote = (formData.get("reviewNote") as string | null)?.trim() ?? "";
		await rejectArticle(params.id, locals.user!.id, reviewNote || undefined);
		return { success: true, action: "rejected" };
	},

	archive: async ({ params, locals }) => {
		// Archive is admin-only
		if (!isAdmin(locals)) error(403, "Hanya admin yang bisa mengarsipkan artikel.");
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.status !== "published") {
			return fail(400, { error: "Hanya artikel published yang bisa diarsipkan." });
		}
		await archiveArticle(params.id);
		return { success: true, action: "archived" };
	},

	updateSlug: async ({ params, request, locals }) => {
		requireEditor(locals);
		const formData = await request.formData();
		const newSlug = (formData.get("slug") as string | null)?.trim() ?? "";
		if (!newSlug) return fail(400, { error: "Slug tidak boleh kosong." });

		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");

		const uniqueSlug = await generateUniqueSlug(
			newSlug.replace(/\s+/g, "-").toLowerCase(),
			params.id
		);
		await updateSlugWithRedirect(params.id, uniqueSlug);
		return { success: true, action: "slugUpdated", slug: uniqueSlug };
	}
};
