import type { SupabaseClient } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import { DEFAULT_REDIRECT, safeRedirectTarget } from './redirect';

/**
 * Absolute path of the OAuth callback route. The `next` query parameter is
 * the post-sign-in destination; the callback handler exchanges the code
 * for a session, sets the session cookie, then redirects to `next`.
 */
export const AUTH_CALLBACK_PATH = '/auth/callback';

export type StartGoogleSignInResult =
	| { ok: true; url: string }
	| { ok: false; status: number; message: string };

/**
 * Start a Google OAuth sign-in. Returns either the Supabase-provided consent
 * URL (caller should `redirect(303, url)`) or a structured failure the
 * caller should pass straight to `fail()`.
 *
 * The Supabase OAuth handshake drops the browser on a `redirectTo` URL
 * appended with `?code=…` (or `?error=…`). That URL MUST be a route on
 * this app that exchanges the code and sets the session cookie — NOT the
 * final destination, because `hooks.server.ts` runs before the page and
 * will redirect unauthenticated requests on guarded paths back to `/login`,
 * which is what makes the post-OAuth bounce a visible loop. Routing the
 * callback through `/auth/callback?next=…` keeps the exchange out of any
 * guarded route.
 */
export async function startGoogleSignIn(
	supabase: SupabaseClient,
	origin: string,
	target: string | null | undefined
): Promise<StartGoogleSignInResult> {
	const safeTarget = safeRedirectTarget(target);
	const redirectTo = `${origin}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(safeTarget)}`;

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo }
	});

	if (error || !data?.url) {
		console.error('signInWithOAuth failed', error);
		return {
			ok: false,
			status: 500,
			message: 'Login dengan Google belum tersedia. Hubungi admin.'
		};
	}

	return { ok: true, url: data.url };
}

// Re-export so route code can use one import path.
export { fail, redirect, DEFAULT_REDIRECT, safeRedirectTarget };
