import { fail, redirect } from "@sveltejs/kit";
import { createCafe, CafeWriteError, parseCafeFormData } from "$lib/server/cafes";
import { requireAdmin } from "$lib/server/auth/admin";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const values = Object.fromEntries(formData.entries()) as Record<string, string>;
		try {
			const { input } = parseCafeFormData(formData);
			await createCafe(input);
		} catch (error) {
			if (error instanceof CafeWriteError) {
				return fail(400, { message: error.message, field: error.field, values });
			}
			throw error;
		}
		throw redirect(303, "/admin/cafes");
	}
};
