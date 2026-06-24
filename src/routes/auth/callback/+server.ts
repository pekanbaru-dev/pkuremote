import { redirect } from '@sveltejs/kit';
import { safeRedirectTarget } from '$lib/server/auth/redirect';
import { resolveOAuthCallback } from '$lib/server/auth/oauth-callback';
import type { RequestHandler } from './$types';

/**
 * OAuth callback. Supabase drops the browser here with `?code=…` (or
 * `?error=…`) appended to the `redirectTo` we passed in `signInWithOAuth`.
 *
 * This route is intentionally NOT in `GUARDED_PREFIXES` so the hook lets
 * the request through even though no session exists yet.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const result = await resolveOAuthCallback({
		supabase: locals.supabase,
		code: url.searchParams.get('code'),
		errorParam: url.searchParams.get('error'),
		next: safeRedirectTarget(url.searchParams.get('next'))
	});
	redirect(303, result.location);
};
