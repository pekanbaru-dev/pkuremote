import { getArticlesByAuthor } from "$lib/server/articles";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	// locals.user is guaranteed by GUARDED_PREFIXES in hooks.server.ts
	const articles = await getArticlesByAuthor(locals.user!.id);
	return { articles };
};
