import { fail, redirect } from "@sveltejs/kit";
import { startOidcSignIn } from "$lib/server/auth/oidc-flow";
import { safeRedirectTarget } from "$lib/server/auth/redirect";
import { setOidcTransientCookies } from "$lib/server/auth/oidc-cookies";
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
	default: async ({ url, cookies }) => {
		const result = await startOidcSignIn(url.searchParams.get("redirect"));
		if (!result.ok) {
			return fail(result.status, { message: result.message });
		}
		// Persist state/PKCE/nonce/target for the callback, then hand off to the issuer.
		setOidcTransientCookies(cookies, {
			state: result.state,
			codeVerifier: result.codeVerifier,
			nonce: result.nonce,
			target: result.target
		});
		redirect(303, result.url);
	}
};
