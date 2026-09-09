import { error } from "@sveltejs/kit";
import { getCafeBySlug } from "$lib/server/cafes";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ params }) => {
	const cafe = await getCafeBySlug(params.slug);
	if (!cafe) error(404, "Tempat WFC tidak ditemukan");
	return { cafe };
};
