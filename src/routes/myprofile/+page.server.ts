import { redirect } from '@sveltejs/kit';
import { loadMyProfile } from '$lib/server/auth/myprofile-load';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login?redirect=%2Fmyprofile');
	}
	return loadMyProfile(locals.user.id, locals.user.email);
};

export const actions: Actions = {
	signOut: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	}
};
