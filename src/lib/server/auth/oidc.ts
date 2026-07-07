import * as arctic from "arctic";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "$env/dynamic/private";

/**
 * Generic OIDC integration (Arctic + jose). The app talks to a generic OIDC
 * issuer via discovery, so the SAME code path serves Dex in development and
 * Google in production — the only difference is the `OIDC_ISSUER` value. There
 * is intentionally no provider-specific branch (see design D2): a Dex-specific
 * or Google-specific client would make the local IdP rehearse a different path
 * than prod.
 *
 * Env is read lazily (like `$lib/server/db/client`) so `pnpm build` succeeds
 * without OIDC credentials; the values are validated on first use.
 */

export const OIDC_SCOPES = ["openid", "email", "profile"];

/**
 * The single configured OIDC provider, stored in `oauth_accounts.provider`.
 * Dex stands in for it in development; the OIDC `sub` (unique per issuer) is
 * what actually distinguishes identities, so a constant label is sufficient.
 */
export const AUTH_PROVIDER = "google";

export type OidcConfig = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	redirectUri: string;
};

export type OidcClaims = {
	sub: string;
	email: string;
	emailVerified: boolean;
	name: string | null;
	picture: string | null;
};

function stripTrailingSlash(value: string): string {
	return value.replace(/\/$/, "");
}

/** Read and validate the OIDC env vars, throwing the documented error if any is missing. */
export function getOidcConfig(): OidcConfig {
	const issuer = env.OIDC_ISSUER;
	const clientId = env.OIDC_CLIENT_ID;
	const clientSecret = env.OIDC_CLIENT_SECRET;
	const redirectUri = env.OIDC_REDIRECT_URI;
	if (!issuer || !clientId || !clientSecret || !redirectUri) {
		throw new Error(
			"OIDC is not configured. Set OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, and OIDC_REDIRECT_URI."
		);
	}
	return { issuer, clientId, clientSecret, redirectUri };
}

type Discovery = {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	jwks_uri: string;
};

let cachedDiscovery: { issuer: string; doc: Discovery } | null = null;

/**
 * Fetch (and cache) the issuer's OIDC discovery document, asserting the
 * advertised `issuer` matches `OIDC_ISSUER` (ignoring a trailing slash) so a
 * misconfigured issuer fails fast rather than at token-verification time.
 */
export async function discover(issuer: string): Promise<Discovery> {
	if (cachedDiscovery && cachedDiscovery.issuer === issuer) return cachedDiscovery.doc;
	const url = `${stripTrailingSlash(issuer)}/.well-known/openid-configuration`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`OIDC discovery failed (${res.status}) for ${url}`);
	}
	const doc = (await res.json()) as Discovery;
	if (stripTrailingSlash(doc.issuer) !== stripTrailingSlash(issuer)) {
		throw new Error(
			`OIDC issuer mismatch: discovery advertised "${doc.issuer}", expected "${issuer}"`
		);
	}
	cachedDiscovery = { issuer, doc };
	return doc;
}

let cachedJwks: { uri: string; jwks: ReturnType<typeof createRemoteJWKSet> } | null = null;

function getJwks(uri: string): ReturnType<typeof createRemoteJWKSet> {
	if (cachedJwks && cachedJwks.uri === uri) return cachedJwks.jwks;
	const jwks = createRemoteJWKSet(new URL(uri));
	cachedJwks = { uri, jwks };
	return jwks;
}

function oauthClient(cfg: OidcConfig): arctic.OAuth2Client {
	return new arctic.OAuth2Client(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

export type AuthorizationRequest = {
	url: string;
	state: string;
	codeVerifier: string;
	nonce: string;
};

/**
 * Build the authorization URL and the transient values the callback needs.
 * `state`, `nonce`, and the PKCE `code_challenge` (S256) are all sent as
 * authorization parameters — a provider only echoes a `nonce` it received, so
 * omitting it here would make every callback's nonce check fail.
 */
export async function createAuthorizationRequest(): Promise<AuthorizationRequest> {
	const cfg = getOidcConfig();
	const disc = await discover(cfg.issuer);
	const state = arctic.generateState();
	const codeVerifier = arctic.generateCodeVerifier();
	// A unique, high-entropy nonce per request (same generator as state).
	const nonce = arctic.generateState();
	const url = oauthClient(cfg).createAuthorizationURLWithPKCE(
		disc.authorization_endpoint,
		state,
		arctic.CodeChallengeMethod.S256,
		codeVerifier,
		OIDC_SCOPES
	);
	url.searchParams.set("nonce", nonce);
	return { url: url.toString(), state, codeVerifier, nonce };
}

/**
 * Exchange the authorization `code` for tokens (Arctic), then verify the
 * returned `id_token` with jose against the issuer's JWKS — asserting `iss`,
 * `aud`, and expiry — and confirm the `nonce` matches. Returns the verified
 * claims, or throws on any failure (the caller maps a throw to
 * `/login?error=oauth_callback`). The `email_verified` gate is enforced by the
 * caller so an unverified email is distinguishable in tests.
 */
export async function verifyOidcClaims(
	code: string,
	codeVerifier: string,
	nonce: string
): Promise<OidcClaims> {
	const cfg = getOidcConfig();
	const disc = await discover(cfg.issuer);
	const tokens = await oauthClient(cfg).validateAuthorizationCode(
		disc.token_endpoint,
		code,
		codeVerifier
	);
	const idToken = tokens.idToken();
	const { payload } = await jwtVerify(idToken, getJwks(disc.jwks_uri), {
		issuer: disc.issuer,
		audience: cfg.clientId
	});
	if (typeof payload.nonce !== "string" || payload.nonce !== nonce) {
		throw new Error("OIDC nonce mismatch");
	}
	if (typeof payload.sub !== "string") {
		throw new Error("OIDC id_token missing sub");
	}
	const email = typeof payload.email === "string" ? payload.email : null;
	if (!email) {
		throw new Error("OIDC id_token missing email");
	}
	return {
		sub: payload.sub,
		email,
		emailVerified: payload.email_verified === true,
		name: typeof payload.name === "string" ? payload.name : null,
		picture: typeof payload.picture === "string" ? payload.picture : null
	};
}
