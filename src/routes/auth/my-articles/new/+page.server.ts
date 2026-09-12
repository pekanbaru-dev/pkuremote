import { fail, redirect } from "@sveltejs/kit";
import { firstArticleFormError, validateArticleForm } from "$lib/features/articles";
import {
	createArticle,
	updateArticle,
	submitForReview,
	generateSlug,
	generateUniqueSlug,
	articleTags,
	readArticleForm
} from "$lib/server/articles";
import { uploadArticleCover, MediaUploadError } from "$lib/server/storage";
import { getCategoriesForScope } from "$lib/server/events";
import type { Actions, PageServerLoad } from "./$types";

async function isKnownCategory(
	categoryId: string,
	existingCategoryId?: string | null
): Promise<boolean> {
	if (!categoryId) return true;
	if (categoryId === existingCategoryId) return true;
	const categories = await getCategoriesForScope("article");
	return categories.some((category) => category.id === categoryId);
}

async function createDraftArticle(
	values: ReturnType<typeof readArticleForm>,
	authorId: string,
	coverFile: File | null
) {
	const manualSlug = values.slug ? generateSlug(values.slug) : undefined;
	let coverImageUrl = values.coverImageUrl || null;

	if (coverFile && coverFile.size > 0) {
		coverImageUrl = await uploadArticleCover(coverFile);
	}

	const article = await createArticle({
		title: values.title,
		excerpt: values.excerpt,
		body: values.body,
		authorId,
		coverImageUrl,
		categoryId: values.categoryId || null,
		tags: articleTags(values)
	});

	if (manualSlug && manualSlug !== article.slug) {
		await updateArticle(article.id, { slug: await generateUniqueSlug(manualSlug) });
	}

	return article;
}

async function draftValidationError(
	values: ReturnType<typeof readArticleForm>,
	existingCategoryId?: string | null
): Promise<string | undefined> {
	if (values.slug && !generateSlug(values.slug)) return "Slug tidak valid.";
	if (values.categoryId && !(await isKnownCategory(values.categoryId, existingCategoryId))) {
		return "Kategori tidak valid.";
	}
}

export const load: PageServerLoad = async () => {
	return { categories: await getCategoriesForScope("article") };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.user!;
		const formData = await request.formData();
		const values = readArticleForm(formData);
		const coverFile = formData.get("coverImage") as File | null;
		const validationError = await draftValidationError(values);
		if (validationError) return fail(400, { error: validationError });

		try {
			const article = await createDraftArticle(values, user.id, coverFile);
			redirect(303, `/auth/my-articles/${article.id}`);
		} catch (err) {
			if (err instanceof MediaUploadError) return fail(400, { error: err.message });
			throw err;
		}
	},

	submitReview: async ({ request, locals }) => {
		const user = locals.user!;
		const formData = await request.formData();
		const values = readArticleForm(formData);
		const validationError = firstArticleFormError(validateArticleForm(values));
		if (validationError) return fail(400, { error: validationError });

		const draftError = await draftValidationError(values);
		if (draftError) return fail(400, { error: draftError });

		try {
			const article = await createDraftArticle(
				values,
				user.id,
				formData.get("coverImage") as File | null
			);
			await submitForReview(article.id);
			redirect(303, `/auth/my-articles/${article.id}`);
		} catch (err) {
			if (err instanceof MediaUploadError) return fail(400, { error: err.message });
			throw err;
		}
	}
};
