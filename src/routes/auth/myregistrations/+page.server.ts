import { getMyRegistrations } from "$lib/server/registrations";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	// locals.user is guaranteed by /auth/+layout.server.ts
	const registrations = await getMyRegistrations(locals.user!.id);
	return { registrations };
};
