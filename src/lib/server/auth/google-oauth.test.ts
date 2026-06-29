import { describe, expect, it, vi } from "vitest";
import { AUTH_CALLBACK_PATH, startGoogleSignIn } from "./google-oauth";

type SignInResult = { data: { url: string } | null; error: Error | null };
type SignInFn = (args: { options: { redirectTo: string } }) => Promise<SignInResult>;

function clientWith(impl: SignInFn) {
	return {
		auth: { signInWithOAuth: vi.fn(impl) }
	} as unknown as Parameters<typeof startGoogleSignIn>[0];
}

describe("startGoogleSignIn", () => {
	it("builds redirectTo as /auth/callback?next=/myprofile by default", async () => {
		const client = clientWith(async ({ options }) => {
			expect(options.redirectTo).toBe("http://localhost/auth/callback?next=%2Fmyprofile");
			return { data: { url: "https://accounts.google.com/o/oauth2/auth" }, error: null };
		});
		const result = await startGoogleSignIn(client, "http://localhost", null);
		expect(result).toEqual({ ok: true, url: "https://accounts.google.com/o/oauth2/auth" });
		expect(client.auth.signInWithOAuth).toHaveBeenCalledOnce();
	});

	it("passes a same-origin next path through to redirectTo", async () => {
		const client = clientWith(async ({ options }) => {
			expect(options.redirectTo).toBe("http://localhost/auth/callback?next=%2Fevents");
			return { data: { url: "https://accounts.google.com/o/oauth2/auth" }, error: null };
		});
		const result = await startGoogleSignIn(client, "http://localhost", "/events");
		expect(result.ok).toBe(true);
	});

	it("falls back to /myprofile for a //evil.com next", async () => {
		const client = clientWith(async ({ options }) => {
			expect(options.redirectTo).toBe("http://localhost/auth/callback?next=%2Fmyprofile");
			return { data: { url: "https://accounts.google.com/o/oauth2/auth" }, error: null };
		});
		const result = await startGoogleSignIn(client, "http://localhost", "//evil.com/pwn");
		expect(result.ok).toBe(true);
	});

	it("returns a failure with a user-readable message when signInWithOAuth errors", async () => {
		const client = clientWith(async () => ({ data: null, error: new Error("provider_disabled") }));
		const result = await startGoogleSignIn(client, "http://localhost", null);
		expect(result).toEqual({
			ok: false,
			status: 500,
			message: "Login dengan Google belum tersedia. Hubungi admin."
		});
	});

	it("returns a failure when signInWithOAuth returns no url", async () => {
		const client = clientWith(async () => ({ data: { url: "" }, error: null }));
		const result = await startGoogleSignIn(client, "http://localhost", null);
		expect(result).toEqual({
			ok: false,
			status: 500,
			message: "Login dengan Google belum tersedia. Hubungi admin."
		});
	});

	it("exports AUTH_CALLBACK_PATH as /auth/callback", () => {
		expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
	});
});
