import { fail, redirect } from "@sveltejs/kit";
import { startGoogleSignIn } from "$lib/server/auth/google-oauth";
import { safeRedirectTarget } from "$lib/server/auth/redirect";
import type { Actions, PageServerLoad } from "./$types";

const ERROR_MESSAGES: Record<string, string> = {
	access_denied: "Login dibatalkan. Coba lagi jika ingin masuk.",
	oauth_callback: "Sesi login tidak dapat dibuat. Coba lagi.",
	server_error: "Google sedang bermasalah. Coba lagi sebentar."
};

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user) {
		redirect(303, safeRedirectTarget(url.searchParams.get("redirect")));
	}
	const errorCode = url.searchParams.get("error");
	return {
		redirectTo: safeRedirectTarget(url.searchParams.get("redirect")),
		errorMessage: errorCode ? (ERROR_MESSAGES[errorCode] ?? "Login gagal. Coba lagi.") : null
	};
};

export const actions: Actions = {
	default: async ({ url, locals }) => {
		const result = await startGoogleSignIn(
			locals.supabase,
			url.origin,
			url.searchParams.get("redirect")
		);
		if (!result.ok) {
			return fail(result.status, { message: result.message });
		}
		redirect(303, result.url);
	}
};
