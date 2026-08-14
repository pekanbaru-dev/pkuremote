import { error, fail } from "@sveltejs/kit";
import {
	getArticleById,
	updateArticle,
	submitForReview,
	updateSlugWithRedirect,
	generateUniqueSlug
} from "$lib/server/articles";
import { uploadArticleCover, deleteArticleCover, MediaUploadError } from "$lib/server/storage";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const article = await getArticleById(params.id);
	if (!article) error(404, "Artikel tidak ditemukan.");
	if (article.authorId !== locals.user!.id) error(403, "Kamu tidak punya akses ke artikel ini.");
	return { article };
};

export const actions: Actions = {
	update: async ({ params, request, locals }) => {
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.authorId !== locals.user!.id) error(403, "Akses ditolak.");

		const formData = await request.formData();
		const title = (formData.get("title") as string | null)?.trim() ?? "";
		const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";
		const excerpt = (formData.get("excerpt") as string | null)?.trim() ?? "";
		const body = (formData.get("body") as string | null)?.trim() ?? "";
		const coverFile = formData.get("coverImage") as File | null;

		if (!title) return fail(400, { error: "Judul tidak boleh kosong." });
		if (!excerpt) return fail(400, { error: "Ringkasan tidak boleh kosong." });
		if (!body) return fail(400, { error: "Isi artikel tidak boleh kosong." });

		// Handle cover image upload
		let coverImageUrl = article.coverImageUrl;
		if (coverFile && coverFile.size > 0) {
			try {
				// Delete old cover if exists
				if (coverImageUrl) await deleteArticleCover(coverImageUrl);
				coverImageUrl = await uploadArticleCover(coverFile);
			} catch (err) {
				if (err instanceof MediaUploadError) {
					return fail(400, { error: err.message });
				}
				throw err;
			}
		}

		// Handle slug change — use updateSlugWithRedirect for published posts
		let newSlug = slugRaw || (await generateUniqueSlug(title, params.id));
		if (newSlug !== article.slug) {
			if (article.status === "published") {
				await updateSlugWithRedirect(params.id, newSlug);
				newSlug = article.slug; // already handled
			}
		}

		await updateArticle(params.id, {
			title,
			slug: newSlug,
			excerpt,
			body,
			coverImageUrl
		});

		return { success: true };
	},

	submitReview: async ({ params, request, locals }) => {
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.authorId !== locals.user!.id) error(403, "Akses ditolak.");
		if (article.status !== "draft") {
			return fail(400, { error: "Hanya artikel draft yang bisa dikirim untuk review." });
		}

		// Save latest edits first if present
		const formData = await request.formData();
		const title = (formData.get("title") as string | null)?.trim();
		const excerpt = (formData.get("excerpt") as string | null)?.trim();
		const body = (formData.get("body") as string | null)?.trim();
		if (title && excerpt && body) {
			await updateArticle(params.id, { title, excerpt, body });
		}

		await submitForReview(params.id);
		return { success: true, submitted: true };
	},

	uploadCover: async ({ params, request, locals }) => {
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.authorId !== locals.user!.id) error(403, "Akses ditolak.");

		const formData = await request.formData();
		const coverFile = formData.get("coverImage") as File | null;
		if (!coverFile || coverFile.size === 0) {
			return fail(400, { error: "Tidak ada file yang diupload." });
		}

		try {
			if (article.coverImageUrl) await deleteArticleCover(article.coverImageUrl);
			const coverImageUrl = await uploadArticleCover(coverFile);
			await updateArticle(params.id, { coverImageUrl });
		} catch (err) {
			if (err instanceof MediaUploadError) {
				return fail(400, { error: err.message });
			}
			throw err;
		}

		return { success: true };
	}
};
