import { describe, expect, it, vi } from 'vitest';
import { resolveOAuthCallback } from './oauth-callback';
import type { SupabaseClient } from '@supabase/supabase-js';

function clientWith(exchange: (code: string) => Promise<{ error: Error | null }>) {
	return {
		auth: { exchangeCodeForSession: vi.fn(exchange) }
	} as unknown as SupabaseClient;
}

describe('resolveOAuthCallback', () => {
	it('exchanges the code and redirects to next on success', async () => {
		const exchange = vi.fn(async (_code: string) => ({ error: null }));
		const result = await resolveOAuthCallback({
			supabase: clientWith(exchange),
			code: 'abc-123',
			errorParam: null,
			next: '/myprofile'
		});
		expect(result).toEqual({ kind: 'redirect', location: '/myprofile' });
		expect(exchange).toHaveBeenCalledWith('abc-123');
	});

	it('redirects to /login?error=oauth_callback when exchange fails', async () => {
		const exchange = vi.fn(async () => ({ error: new Error('expired') }));
		const result = await resolveOAuthCallback({
			supabase: clientWith(exchange),
			code: 'stale',
			errorParam: null,
			next: '/myprofile'
		});
		expect(result.location).toBe('/login?error=oauth_callback');
	});

	it('prefers the error param over the code (and never calls exchange)', async () => {
		const exchange = vi.fn();
		const result = await resolveOAuthCallback({
			supabase: clientWith(exchange),
			code: 'abc-123',
			errorParam: 'access_denied',
			next: '/myprofile'
		});
		expect(result.location).toBe('/login?error=access_denied');
		expect(exchange).not.toHaveBeenCalled();
	});

	it('redirects to next when there is neither code nor error', async () => {
		const exchange = vi.fn();
		const result = await resolveOAuthCallback({
			supabase: clientWith(exchange),
			code: null,
			errorParam: null,
			next: '/myprofile'
		});
		expect(result).toEqual({ kind: 'redirect', location: '/myprofile' });
		expect(exchange).not.toHaveBeenCalled();
	});

	it('URL-encodes the error code in the redirect location', async () => {
		const result = await resolveOAuthCallback({
			supabase: clientWith(vi.fn()),
			code: null,
			errorParam: 'server error',
			next: '/myprofile'
		});
		expect(result.location).toBe('/login?error=server%20error');
	});
});
