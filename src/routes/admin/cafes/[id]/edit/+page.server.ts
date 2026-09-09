import { error, fail, redirect } from "@sveltejs/kit";
import { getCafeById, updateCafe, CafeWriteError, parseCafeFormData } from "$lib/server/cafes";
import { requireAdmin } from "$lib/server/auth/admin";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);
	const cafe = await getCafeById(params.id);
	if (!cafe) error(404, "Kafe tidak ditemukan.");
	return { cafe };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const values = Object.fromEntries(formData.entries()) as Record<string, string>;
		try {
			const { input } = parseCafeFormData(formData);
			await updateCafe(params.id, input);
		} catch (error) {
			if (error instanceof CafeWriteError) {
				return fail(400, { message: error.message, field: error.field, values });
			}
			throw error;
		}
		throw redirect(303, "/admin/cafes");
	}
};
