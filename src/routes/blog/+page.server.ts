import { getPublishedArticles } from "$lib/server/articles";
import { getCategoriesForScope } from "$lib/server/events";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const pageParam = parseInt(url.searchParams.get("page") ?? "1", 10);
	const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
	const categories = await getCategoriesForScope("article");
	const requestedSlug = url.searchParams.get("category");
	const filter = categories.find((category) => category.slug === requestedSlug) ?? null;
	const result = await getPublishedArticles(page, undefined, filter?.slug);
	return { ...result, categories, filter };
};
