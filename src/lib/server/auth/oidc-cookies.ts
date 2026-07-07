import { dev } from "$app/environment";
import type { Cookies } from "@sveltejs/kit";

/**
 * Short-lived, httpOnly cookies that carry the OIDC round-trip state from the
 * sign-in action to the `/auth/callback` handler: the CSRF `state`, the PKCE
 * `code_verifier`, the `nonce`, and the sanitized post-login target (the
 * `redirect_uri` is the bare `/auth/callback`, so the target must ride a
 * cookie). SameSite=Lax so they survive the top-level GET redirect back from
 * the issuer; Secure everywhere except dev-over-http.
 */
export const OIDC_STATE_COOKIE = "oidc_state";
export const OIDC_VERIFIER_COOKIE = "oidc_code_verifier";
export const OIDC_NONCE_COOKIE = "oidc_nonce";
export const OIDC_TARGET_COOKIE = "oidc_target";

const TRANSIENT_COOKIES = [
	OIDC_STATE_COOKIE,
	OIDC_VERIFIER_COOKIE,
	OIDC_NONCE_COOKIE,
	OIDC_TARGET_COOKIE
];

// Enough to complete consent + the redirect back, not long enough to linger.
const TRANSIENT_MAX_AGE_SECONDS = 60 * 10;

export function setOidcTransientCookies(
	cookies: Cookies,
	values: { state: string; codeVerifier: string; nonce: string; target: string }
): void {
	const options = {
		path: "/",
		httpOnly: true,
		secure: !dev,
		sameSite: "lax" as const,
		maxAge: TRANSIENT_MAX_AGE_SECONDS
	};
	cookies.set(OIDC_STATE_COOKIE, values.state, options);
	cookies.set(OIDC_VERIFIER_COOKIE, values.codeVerifier, options);
	cookies.set(OIDC_NONCE_COOKIE, values.nonce, options);
	cookies.set(OIDC_TARGET_COOKIE, values.target, options);
}

export function clearOidcTransientCookies(cookies: Cookies): void {
	for (const name of TRANSIENT_COOKIES) {
		cookies.delete(name, { path: "/" });
	}
}
