import { error, fail, redirect } from "@sveltejs/kit";
import {
	getEventById,
	getAllCategories,
	updateEvent,
	parseEventFormData,
	EventWriteError
} from "$lib/server/events";
import { uploadEventBanner, deleteEventBanner, MediaUploadError } from "$lib/server/storage";
import { requireAdmin } from "$lib/server/auth/admin";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);
	const event = await getEventById(params.id);
	if (!event) {
		error(404, "Event tidak ditemukan");
	}
	return { event, categories: await getAllCategories() };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const formData = await request.formData();
		const { input, bannerFile, values } = parseEventFormData(formData);
		const currentBannerUrl = String(formData.get("currentBannerUrl") ?? "") || null;

		// Default to keeping the existing banner; a new upload replaces it.
		input.bannerUrl = currentBannerUrl;
		let replacedBanner: string | null = null;

		try {
			if (bannerFile) {
				input.bannerUrl = await uploadEventBanner(bannerFile);
				if (currentBannerUrl && currentBannerUrl !== input.bannerUrl) {
					replacedBanner = currentBannerUrl;
				}
			}
			await updateEvent(params.id, input);
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

		// Only after a successful commit do we remove the replaced banner.
		if (replacedBanner) {
			await deleteEventBanner(replacedBanner);
		}

		redirect(303, "/admin/events");
	}
};
