import { error, fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { getEventBySlug } from "$lib/server/events";
import { db } from "$lib/server/db/client";
import { profiles } from "../../../../db/schema";
import {
	bookEvent,
	RegistrationError,
	getRegistrationErrorMessage
} from "$lib/server/registrations";
import type { PageServerLoad, Actions } from "./$types.js";

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const event = await getEventBySlug(params.slug);
	if (!event) {
		error(404, "Event tidak ditemukan");
	}

	let defaultAttendeeName: string | null = null;
	if (locals.user) {
		const [profile] = await db
			.select({ displayName: profiles.displayName })
			.from(profiles)
			.where(eq(profiles.id, locals.user.id))
			.limit(1);
		defaultAttendeeName = profile?.displayName ?? null;
	}

	return {
		event,
		authenticated: locals.user !== null && locals.user !== undefined,
		defaultAttendeeName,
		bookingError: url.searchParams.get("error")
			? getRegistrationErrorMessage(url.searchParams.get("error") ?? "")
			: null
	};
};

export const actions: Actions = {
	book: async ({ params, locals, request }) => {
		if (!locals.user) {
			redirect(303, `/login?redirect=${encodeURIComponent(`/events/${params.slug}`)}`);
		}

		const formData = await request.formData();
		const attendeeName = (formData.get("attendeeName") as string | null) ?? "";
		const attendeePhone = (formData.get("attendeePhone") as string | null) ?? "";

		try {
			const registration = await bookEvent({
				userId: locals.user.id,
				eventSlug: params.slug,
				attendeeName,
				attendeePhone
			});
			redirect(303, `/events/${params.slug}/ticket/${registration.registrationNumber}`);
		} catch (err) {
			if (err instanceof RegistrationError) {
				if (err.code === "VALIDATION") {
					return fail(400, {
						code: err.code,
						message: err.message,
						attendeeName,
						attendeePhone
					});
				}
				return fail(400, { code: err.code, message: getRegistrationErrorMessage(err.code) });
			}
			throw err;
		}
	}
};
