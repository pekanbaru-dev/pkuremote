import { safeRedirectTarget } from "./redirect";
import { createAuthorizationRequest, verifyOidcClaims, type OidcClaims } from "./oidc";

/**
 * OIDC sign-in and callback resolution — the provider-agnostic branch logic,
 * kept free of SvelteKit/cookie I/O so it is unit-testable (the route handlers
 * do the cookie reads/writes and the redirect).
 */

export type StartOidcResult =
	| {
			ok: true;
			url: string;
			state: string;
			codeVerifier: string;
			nonce: string;
			target: string;
	  }
	| { ok: false; status: number; message: string };

/**
 * Start an OIDC authorization-code flow. Returns the authorization URL plus
 * the transient values the caller must persist in short-lived httpOnly
 * cookies (`state`, PKCE `codeVerifier`, `nonce`, and the sanitized post-login
 * `target`), or a typed failure the caller passes to `fail()`.
 */
export async function startOidcSignIn(target: string | null | undefined): Promise<StartOidcResult> {
	const safeTarget = safeRedirectTarget(target);
	try {
		const req = await createAuthorizationRequest();
		return {
			ok: true,
			url: req.url,
			state: req.state,
			codeVerifier: req.codeVerifier,
			nonce: req.nonce,
			target: safeTarget
		};
	} catch (err) {
		console.error("startOidcSignIn failed", err);
		return {
			ok: false,
			status: 500,
			message: "Login dengan Google belum tersedia. Hubungi admin."
		};
	}
}

export type OidcCallbackParams = {
	code: string | null;
	stateParam: string | null;
	errorParam: string | null;
	storedState: string | null;
	storedCodeVerifier: string | null;
	storedNonce: string | null;
	storedTarget: string | null;
};

export type OidcCallbackDeps = {
	verifyClaims: (code: string, codeVerifier: string, nonce: string) => Promise<OidcClaims>;
};

export type OidcCallbackResult =
	| { ok: false; location: string }
	| { ok: true; claims: OidcClaims; target: string };

const defaultDeps: OidcCallbackDeps = { verifyClaims: verifyOidcClaims };

/**
 * Resolve an OIDC callback to either a login-error redirect (no session) or a
 * verified success carrying the claims and the recovered post-login target.
 * The route handler creates the session and sets cookies only on `ok: true`.
 *
 * Order of checks: provider error → state/params validity → token exchange +
 * id_token verification (incl. nonce) → strict `email_verified`. Any failure
 * yields `/login?error=…` with no session.
 */
export async function resolveOidcCallback(
	params: OidcCallbackParams,
	deps: OidcCallbackDeps = defaultDeps
): Promise<OidcCallbackResult> {
	const {
		code,
		stateParam,
		errorParam,
		storedState,
		storedCodeVerifier,
		storedNonce,
		storedTarget
	} = params;

	if (errorParam) {
		return { ok: false, location: `/login?error=${encodeURIComponent(errorParam)}` };
	}

	if (!code || !storedState || !storedCodeVerifier || !storedNonce || stateParam !== storedState) {
		return { ok: false, location: "/login?error=oauth_callback" };
	}

	let claims: OidcClaims;
	try {
		claims = await deps.verifyClaims(code, storedCodeVerifier, storedNonce);
	} catch (err) {
		console.error("OIDC callback verification failed", err);
		return { ok: false, location: "/login?error=oauth_callback" };
	}

	if (claims.emailVerified !== true) {
		return { ok: false, location: "/login?error=oauth_callback" };
	}

	return { ok: true, claims, target: safeRedirectTarget(storedTarget) };
}
