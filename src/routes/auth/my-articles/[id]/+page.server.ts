import { error, fail } from "@sveltejs/kit";
import { firstArticleFormError, validateArticleForm } from "$lib/features/articles";
import {
	getArticleById,
	updateArticle,
	submitForReview,
	generateSlug,
	generateUniqueSlug,
	articleTags,
	readArticleForm,
	hasFormValue
} from "$lib/server/articles";
import { getAllCategories } from "$lib/server/events";
import { uploadArticleCover, deleteArticleCover, MediaUploadError } from "$lib/server/storage";
import { sanitizeArticleHtml } from "$lib/server/markdown";
import type { Actions, PageServerLoad } from "./$types";

async function isKnownCategory(categoryId: string): Promise<boolean> {
	if (!categoryId) return true;
	const categories = await getAllCategories();
	return categories.some((category) => category.id === categoryId);
}

async function draftValidationError(
	values: ReturnType<typeof readArticleForm>
): Promise<string | undefined> {
	if (values.slug && !generateSlug(values.slug)) return "Slug tidak valid.";
	if (values.categoryId && !(await isKnownCategory(values.categoryId))) {
		return "Kategori tidak valid.";
	}
}

async function syncCoverImage(
	article: Awaited<ReturnType<typeof getArticleById>>,
	values: ReturnType<typeof readArticleForm>,
	coverFile: File | null,
	coverFieldSubmitted: boolean
): Promise<string | null> {
	if (!article) return null;

	let coverImageUrl = coverFieldSubmitted ? values.coverImageUrl || null : article.coverImageUrl;
	if (coverFile && coverFile.size > 0) {
		coverImageUrl = await uploadArticleCover(coverFile);
	}

	if (coverImageUrl !== article.coverImageUrl && article.coverImageUrl) {
		await deleteArticleCover(article.coverImageUrl);
	}

	return coverImageUrl;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const article = await getArticleById(params.id);
	if (!article) error(404, "Artikel tidak ditemukan.");
	if (article.authorId !== locals.user!.id) error(403, "Kamu tidak punya akses ke artikel ini.");
	const bodyHtml = sanitizeArticleHtml(article.body);
	return { article, categories: await getAllCategories(), bodyHtml };
};

export const actions: Actions = {
	update: async ({ params, request, locals }) => {
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.authorId !== locals.user!.id) error(403, "Akses ditolak.");

		// Only draft and rejected articles can be edited.
		if (article.status !== "draft" && article.status !== "rejected") {
			return fail(403, {
				error: "Artikel ini tidak bisa diedit karena sudah dikirim untuk review atau sudah tayang."
			});
		}

		const formData = await request.formData();
		const values = readArticleForm(formData);
		const coverFile = formData.get("coverImage") as File | null;
		const validationError = await draftValidationError(values);
		if (validationError) return fail(400, { error: validationError });

		// Handle cover image upload — upload the new file first, then delete
		// the old one only after the replacement succeeds.
		let coverImageUrl: string | null;
		try {
			coverImageUrl = await syncCoverImage(
				article,
				values,
				coverFile,
				hasFormValue(formData, "coverImageUrl")
			);
		} catch (err) {
			if (err instanceof MediaUploadError) return fail(400, { error: err.message });
			throw err;
		}

		// Handle slug change. Since only draft articles can be edited here,
		// the old slug is not yet public, so no redirect needs to be recorded.
		const newSlug = await generateUniqueSlug(values.slug || values.title, params.id);

		await updateArticle(params.id, {
			title: values.title,
			slug: newSlug,
			excerpt: values.excerpt,
			body: values.body,
			coverImageUrl,
			categoryId: values.categoryId || null,
			tags: articleTags(values)
		});

		return { success: true };
	},

	submitReview: async ({ params, request, locals }) => {
		const article = await getArticleById(params.id);
		if (!article) error(404, "Artikel tidak ditemukan.");
		if (article.authorId !== locals.user!.id) error(403, "Akses ditolak.");
		if (article.status !== "draft" && article.status !== "rejected") {
			return fail(400, { error: "Hanya artikel draft atau yang ditolak yang bisa dikirim untuk review." });
		}

		const formData = await request.formData();
		const values = readArticleForm(formData);
		const validationError = firstArticleFormError(validateArticleForm(values));
		if (validationError) return fail(400, { error: validationError });

		const draftError = await draftValidationError(values);
		if (draftError) return fail(400, { error: draftError });

		let coverImageUrl: string | null;
		try {
			coverImageUrl = await syncCoverImage(
				article,
				values,
				formData.get("coverImage") as File | null,
				hasFormValue(formData, "coverImageUrl")
			);
		} catch (err) {
			if (err instanceof MediaUploadError) return fail(400, { error: err.message });
			throw err;
		}

		const newSlug = await generateUniqueSlug(values.slug, params.id);
		await updateArticle(params.id, {
			title: values.title,
			slug: newSlug,
			excerpt: values.excerpt,
			body: values.body,
			coverImageUrl,
			categoryId: values.categoryId,
			tags: articleTags(values)
		});

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
			const newCoverUrl = await uploadArticleCover(coverFile);
			if (article.coverImageUrl) {
				await deleteArticleCover(article.coverImageUrl);
			}
			await updateArticle(params.id, { coverImageUrl: newCoverUrl });
		} catch (err) {
			if (err instanceof MediaUploadError) {
				return fail(400, { error: err.message });
			}
			throw err;
		}

		return { success: true };
	}
};
