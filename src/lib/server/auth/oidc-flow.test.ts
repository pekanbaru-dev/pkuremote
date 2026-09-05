import { describe, expect, it, vi } from "vitest";
import { resolveOidcCallback, type OidcCallbackParams } from "./oidc-flow";
import type { OidcClaims } from "./oidc";

const VERIFIED: OidcClaims = {
	sub: "sub-1",
	email: "rina@example.com",
	emailVerified: true,
	name: "Rina Aulia",
	picture: null
};

function baseParams(overrides: Partial<OidcCallbackParams> = {}): OidcCallbackParams {
	return {
		code: "code-123",
		stateParam: "state-abc",
		errorParam: null,
		storedState: "state-abc",
		storedCodeVerifier: "verifier-xyz",
		storedNonce: "nonce-1",
		storedTarget: "/auth/myprofile",
		...overrides
	};
}

describe("resolveOidcCallback", () => {
	it("returns the verified claims and target on success", async () => {
		const verifyClaims = vi.fn(async () => VERIFIED);
		const result = await resolveOidcCallback(baseParams(), { verifyClaims });
		expect(result).toEqual({ ok: true, claims: VERIFIED, target: "/auth/myprofile" });
		expect(verifyClaims).toHaveBeenCalledWith("code-123", "verifier-xyz", "nonce-1");
	});

	it("redirects to /login?error=<error> when the provider returns an error (no exchange)", async () => {
		const verifyClaims = vi.fn();
		const result = await resolveOidcCallback(baseParams({ errorParam: "access_denied" }), {
			verifyClaims
		});
		expect(result).toEqual({ ok: false, location: "/login?error=access_denied" });
		expect(verifyClaims).not.toHaveBeenCalled();
	});

	it("URL-encodes the provider error code", async () => {
		const result = await resolveOidcCallback(baseParams({ errorParam: "server error" }), {
			verifyClaims: vi.fn()
		});
		expect(result).toEqual({ ok: false, location: "/login?error=server%20error" });
	});

	it("redirects to oauth_callback on state mismatch (no exchange)", async () => {
		const verifyClaims = vi.fn();
		const result = await resolveOidcCallback(baseParams({ stateParam: "different" }), {
			verifyClaims
		});
		expect(result).toEqual({ ok: false, location: "/login?error=oauth_callback" });
		expect(verifyClaims).not.toHaveBeenCalled();
	});

	it("redirects to oauth_callback when the state cookie is absent", async () => {
		const result = await resolveOidcCallback(baseParams({ storedState: null }), {
			verifyClaims: vi.fn()
		});
		expect(result).toEqual({ ok: false, location: "/login?error=oauth_callback" });
	});

	it("redirects to oauth_callback when the code is missing", async () => {
		const result = await resolveOidcCallback(baseParams({ code: null }), { verifyClaims: vi.fn() });
		expect(result).toEqual({ ok: false, location: "/login?error=oauth_callback" });
	});

	it("redirects to oauth_callback when id_token verification throws", async () => {
		const verifyClaims = vi.fn(async () => {
			throw new Error("bad signature");
		});
		const result = await resolveOidcCallback(baseParams(), { verifyClaims });
		expect(result).toEqual({ ok: false, location: "/login?error=oauth_callback" });
	});

	it("rejects an unverified email — no session is signalled", async () => {
		const verifyClaims = vi.fn(async () => ({ ...VERIFIED, emailVerified: false }));
		const result = await resolveOidcCallback(baseParams(), { verifyClaims });
		expect(result).toEqual({ ok: false, location: "/login?error=oauth_callback" });
	});

	it("preserves a guarded-route target (/admin) across the round-trip", async () => {
		const verifyClaims = vi.fn(async () => VERIFIED);
		const result = await resolveOidcCallback(baseParams({ storedTarget: "/admin" }), {
			verifyClaims
		});
		expect(result).toEqual({ ok: true, claims: VERIFIED, target: "/admin" });
	});

	it("falls back to /auth/myprofile for unsafe stored targets (// and backslash forms)", async () => {
		const verifyClaims = vi.fn(async () => VERIFIED);
		const proto = await resolveOidcCallback(baseParams({ storedTarget: "//evil.com/pwn" }), {
			verifyClaims
		});
		expect(proto).toEqual({ ok: true, claims: VERIFIED, target: "/auth/myprofile" });
		const backslash = await resolveOidcCallback(baseParams({ storedTarget: "/\\evil.com/pwn" }), {
			verifyClaims
		});
		expect(backslash).toEqual({ ok: true, claims: VERIFIED, target: "/auth/myprofile" });
	});
});
