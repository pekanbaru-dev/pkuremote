import { parseArticleTags, type ArticleFormValues } from "$lib/features/articles";

function textValue(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : "";
}

export function readArticleForm(formData: FormData): ArticleFormValues {
	return {
		title: textValue(formData, "title"),
		slug: textValue(formData, "slug"),
		excerpt: textValue(formData, "excerpt"),
		body: textValue(formData, "body"),
		categoryId: textValue(formData, "categoryId"),
		coverImageUrl: textValue(formData, "coverImageUrl"),
		tags: textValue(formData, "tags")
	};
}

export function articleTags(values: ArticleFormValues): string[] {
	return parseArticleTags(values.tags);
}

export function hasFormValue(formData: FormData, name: string): boolean {
	return formData.has(name);
}
