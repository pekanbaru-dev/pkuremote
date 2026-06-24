import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Build a Supabase client bound to the current request's cookies.
 *
 * The `getAll`/`setAll` pair is the documented `@supabase/ssr` pattern for
 * SvelteKit: it lets the SSR client see cookies the browser sent and write
 * refreshed cookies back in the same request. Calls in `+page.server.ts`,
 * `+server.ts`, and `hooks.server.ts` MUST go through this factory.
 */
export function createServerSupabase(event: RequestEvent): SupabaseClient {
	return createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				for (const { name, value, options } of cookies) {
					event.cookies.set(name, value, { ...options, path: options?.path ?? '/' });
				}
			}
		}
	});
}
