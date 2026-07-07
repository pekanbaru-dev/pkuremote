import { redirect } from "@sveltejs/kit";
import { loadMyProfile } from "$lib/server/auth/myprofile-load";
import { SESSION_COOKIE, deleteSession } from "$lib/server/auth/session";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, "/login?redirect=%2Fmyprofile");
	}
	return loadMyProfile(locals.user.id, locals.user.email);
};

export const actions: Actions = {
	signOut: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			await deleteSession(token);
		}
		cookies.delete(SESSION_COOKIE, { path: "/" });
		redirect(303, "/");
	}
};
