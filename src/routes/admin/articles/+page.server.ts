import { getAllArticles } from "$lib/server/articles";
import { requireEditor } from "$lib/server/auth/admin";
import type { PageServerLoad } from "./$types";
import type { PostStatus } from "$lib/server/articles";

export const load: PageServerLoad = async ({ locals, url }) => {
	requireEditor(locals);
	const statusParam = url.searchParams.get("status") as PostStatus | null;
	const status: PostStatus = statusParam ?? "in_review";
	const articles = await getAllArticles(status);
	return { articles, status };
};
