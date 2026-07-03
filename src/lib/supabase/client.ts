import { createBrowserClient, isBrowser } from "@supabase/ssr";
import { env } from "$env/dynamic/public";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
	if (!isBrowser()) {
		throw new Error(
			"getBrowserSupabase() called on the server. Use createServerSupabase() instead."
		);
	}
	if (!client) {
		client = createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
	}
	return client;
}
