export type ArticleFormValues = {
	title: string;
	slug: string;
	excerpt: string;
	body: string;
	categoryId: string;
	coverImageUrl: string;
	tags: string;
};

export type ArticleFormField = keyof ArticleFormValues;

export type ArticleFormErrors = Partial<Record<ArticleFormField, string>>;

/**
 * Shared form contract used by the editor and server actions.
 * Title and body stay required even though their labels intentionally omit `*`.
 */
export function validateArticleForm(values: ArticleFormValues): ArticleFormErrors {
	const errors: ArticleFormErrors = {};

	if (!values.title.trim()) errors.title = "Judul tidak boleh kosong.";
	if (!values.body.trim()) errors.body = "Isi artikel tidak boleh kosong.";
	if (!values.slug.trim()) errors.slug = "Slug wajib diisi.";
	if (!values.excerpt.trim()) errors.excerpt = "Ringkasan wajib diisi.";
	if (!values.categoryId.trim()) errors.categoryId = "Kategori wajib dipilih.";
	if (!values.coverImageUrl.trim()) errors.coverImageUrl = "Gambar sampul wajib diisi.";

	return errors;
}

export function firstArticleFormError(errors: ArticleFormErrors): string | undefined {
	return Object.values(errors).find(Boolean);
}

export function parseArticleTags(value: string): string[] {
	return [
		...new Set(
			value
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean)
		)
	];
}
