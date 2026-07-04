import { fail } from "@sveltejs/kit";
import { getAllEvents, deleteEvent } from "$lib/server/events";
import { requireAdmin } from "$lib/server/auth/admin";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return { events: await getAllEvents() };
};

export const actions: Actions = {
	// Actions do NOT run the layout's load gate, so each re-asserts admin.
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get("id") ?? "");
		if (!id) return fail(400, { message: "ID event tidak valid." });
		await deleteEvent(id);
		return { deleted: true };
	}
};
