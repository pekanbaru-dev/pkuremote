import { fail } from "@sveltejs/kit";
import { deleteCafe, getAllCafes } from "$lib/server/cafes";
import { requireAdmin } from "$lib/server/auth/admin";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return { cafes: await getAllCafes() };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get("id") ?? "");
		if (!id) return fail(400, { message: "ID kafe tidak valid." });
		await deleteCafe(id);
		return { deleted: true };
	}
};
