import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { resolveOidcCallback } from "$lib/server/auth/oidc-flow";
import { provisionUser } from "$lib/server/auth/provision";
import { createSession, SESSION_COOKIE } from "$lib/server/auth/session";
import {
	OIDC_STATE_COOKIE,
	OIDC_VERIFIER_COOKIE,
	OIDC_NONCE_COOKIE,
	OIDC_TARGET_COOKIE,
	clearOidcTransientCookies
} from "$lib/server/auth/oidc-cookies";
import type { RequestHandler } from "./$types";

/**
 * OIDC callback. The issuer drops the browser here with `?code=…&state=…` (or
 * `?error=…`). This route is intentionally NOT in `GUARDED_PREFIXES` so the
 * hook lets the request through even though no session exists yet.
 *
 * On success: provision/look-up the user, create a DB-backed session, set the
 * session cookie, clear the transient cookies, and redirect to the recovered
 * post-login target. On any failure: redirect to /login?error=… with no session.
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const result = await resolveOidcCallback({
		code: url.searchParams.get("code"),
		stateParam: url.searchParams.get("state"),
		errorParam: url.searchParams.get("error"),
		storedState: cookies.get(OIDC_STATE_COOKIE) ?? null,
		storedCodeVerifier: cookies.get(OIDC_VERIFIER_COOKIE) ?? null,
		storedNonce: cookies.get(OIDC_NONCE_COOKIE) ?? null,
		storedTarget: cookies.get(OIDC_TARGET_COOKIE) ?? null
	});

	// The transient cookies are single-use regardless of outcome.
	clearOidcTransientCookies(cookies);

	if (!result.ok) {
		redirect(303, result.location);
	}

	const { id } = await provisionUser(result.claims);
	const { token, expiresAt } = await createSession(id);
	cookies.set(SESSION_COOKIE, token, {
		path: "/",
		httpOnly: true,
		secure: !dev,
		sameSite: "lax",
		expires: expiresAt
	});

	redirect(303, result.target);
};
