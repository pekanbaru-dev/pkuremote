import type { SupabaseClient } from "@supabase/supabase-js";

export type OAuthCallbackInput = {
	supabase: SupabaseClient;
	code: string | null;
	errorParam: string | null;
	next: string;
};

export type OAuthCallbackResult = { kind: "redirect"; location: string };

/**
 * Resolve an OAuth callback to a redirect location. The route handler is a
 * one-liner that calls this and then issues `redirect(303, result.location)`.
 *
 * Behavior:
 *  - If `errorParam` is set (Supabase or Google returned an error), redirect
 *    to `/login?error=…` so the login page can surface it.
 *  - If `code` is set, exchange it for a session. The `setAll` cookie
 *    callback in the SSR client writes the new session cookie to the
 *    response. On exchange failure, redirect to `/login?error=oauth_callback`.
 *  - Otherwise, redirect to `next` (already sanitized by the caller).
 */
export async function resolveOAuthCallback(
	input: OAuthCallbackInput
): Promise<OAuthCallbackResult> {
	const { supabase, code, errorParam, next } = input;

	if (errorParam) {
		return { kind: "redirect", location: `/login?error=${encodeURIComponent(errorParam)}` };
	}

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error("exchangeCodeForSession failed", error);
			return { kind: "redirect", location: "/login?error=oauth_callback" };
		}
	}

	return { kind: "redirect", location: next };
}
