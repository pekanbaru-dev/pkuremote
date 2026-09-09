import { searchPublishedCafes } from "$lib/server/cafes";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q")?.trim() ?? "";
	const page = Number(url.searchParams.get("page") ?? "1");
	const result = await searchPublishedCafes(query, Number.isFinite(page) ? page : 1);
	return { query, ...result };
};
