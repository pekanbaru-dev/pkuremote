import { error, redirect } from "@sveltejs/kit";
import { buildRegistrationQrSvg, getRegistrationByNumber } from "$lib/server/registrations";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		redirect(
			303,
			`/login?redirect=${encodeURIComponent(`/events/${params.slug}/ticket/${params.number}`)}`
		);
	}

	const result = await getRegistrationByNumber(params.number, locals.user.id);
	// 404 (not 403) when the registration doesn't exist OR belongs to
	// someone else — never leak that a number exists.
	if (!result) {
		error(404, "Tiket tidak ditemukan");
	}

	const qrSvg = await buildRegistrationQrSvg(result.registration);
	return { ...result, qrSvg };
};
