import { fail, redirect } from "@sveltejs/kit";
import {
	getAllCategories,
	createEvent,
	parseEventFormData,
	EventWriteError
} from "$lib/server/events";
import { uploadEventBanner } from "$lib/server/storage";
import { MediaUploadError } from "$lib/server/storage";
import { requireAdmin } from "$lib/server/auth/admin";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return { categories: await getAllCategories() };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const { input, bannerFile, values } = parseEventFormData(formData);

		try {
			if (bannerFile) {
				input.bannerUrl = await uploadEventBanner(bannerFile);
			}
			await createEvent(input);
		} catch (err) {
			if (err instanceof EventWriteError) {
				return fail(400, {
					message: err.message,
					field: err.field ?? null,
					code: err.code,
					values
				});
			}
			if (err instanceof MediaUploadError) {
				return fail(400, { message: err.message, field: "banner", code: err.code, values });
			}
			throw err;
		}

		redirect(303, "/admin/events");
	}
};
