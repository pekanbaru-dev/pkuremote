import { redirect } from "@sveltejs/kit";
import { getMyRegistrations } from "$lib/server/registrations";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, "/login?redirect=%2Fmyregistrations");
	}

	const registrations = await getMyRegistrations(locals.user.id);
	return { registrations };
};
