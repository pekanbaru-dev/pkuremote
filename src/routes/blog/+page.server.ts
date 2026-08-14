import { getPublishedArticles } from "$lib/server/articles";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const pageParam = parseInt(url.searchParams.get("page") ?? "1", 10);
	const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
	const result = await getPublishedArticles(page);
	return result;
};
