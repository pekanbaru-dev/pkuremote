import { fail, redirect } from "@sveltejs/kit";
import { createArticle } from "$lib/server/articles";
import { uploadArticleCover, MediaUploadError } from "$lib/server/storage";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.user!;
		const formData = await request.formData();

		const title = (formData.get("title") as string | null)?.trim() ?? "";
		const excerpt = (formData.get("excerpt") as string | null)?.trim() ?? "";
		const body = (formData.get("body") as string | null)?.trim() ?? "";
		const slugOverride = (formData.get("slug") as string | null)?.trim() || undefined;
		const coverFile = formData.get("coverImage") as File | null;

		if (!title) return fail(400, { error: "Judul tidak boleh kosong." });
		if (!excerpt) return fail(400, { error: "Ringkasan tidak boleh kosong." });
		if (!body) return fail(400, { error: "Isi artikel tidak boleh kosong." });

		let coverImageUrl: string | null = null;
		if (coverFile && coverFile.size > 0) {
			try {
				coverImageUrl = await uploadArticleCover(coverFile);
			} catch (err) {
				if (err instanceof MediaUploadError) {
					return fail(400, { error: err.message });
				}
				throw err;
			}
		}

		const article = await createArticle({
			title,
			excerpt,
			body,
			authorId: user.id,
			coverImageUrl
		});

		// If user manually set slug, update it
		if (slugOverride && slugOverride !== article.slug) {
			const { updateArticle } = await import("$lib/server/articles");
			await updateArticle(article.id, { slug: slugOverride });
		}

		redirect(303, `/my-articles/${article.id}`);
	}
};
