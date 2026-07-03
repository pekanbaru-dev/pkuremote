import { error } from "@sveltejs/kit";
import { getEventBySlug } from "$lib/features/events";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ params }) => {
	const event = getEventBySlug(params.slug);
	if (!event) {
		error(404, "Event tidak ditemukan");
	}
	return { event };
};
