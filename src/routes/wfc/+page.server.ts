import { isWfcCategory, type WfcCategory } from "$lib/features/wfc/category.js";
import { searchPublishedCafes } from "$lib/server/cafes";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q")?.trim() ?? "";
	const categoryParam = url.searchParams.get("category") ?? "";
	const category = isWfcCategory(categoryParam) ? (categoryParam as WfcCategory) : "";
	const page = Number(url.searchParams.get("page") ?? "1");
	const result = await searchPublishedCafes(query, category, Number.isFinite(page) ? page : 1);
	return { query, category, ...result };
};
