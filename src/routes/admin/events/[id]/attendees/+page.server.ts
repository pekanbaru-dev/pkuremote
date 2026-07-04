import { error, fail } from "@sveltejs/kit";
import { getEventById } from "$lib/server/events";
import {
	getEventRegistrations,
	setRegistrationStatus,
	RegistrationError,
	getRegistrationErrorMessage
} from "$lib/server/registrations";
import { requireAdmin } from "$lib/server/auth/admin";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);
	const event = await getEventById(params.id);
	if (!event) {
		error(404, "Event tidak ditemukan");
	}
	const { registrations, counts } = await getEventRegistrations(params.id);
	return { event, registrations, counts };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get("id") ?? "");
		const status = String(form.get("status") ?? "");
		if (!id) return fail(400, { message: "ID registrasi tidak valid." });
		try {
			await setRegistrationStatus(id, status);
		} catch (err) {
			if (err instanceof RegistrationError) {
				return fail(400, { message: getRegistrationErrorMessage(err.code) });
			}
			throw err;
		}
		return { updated: true };
	}
};
