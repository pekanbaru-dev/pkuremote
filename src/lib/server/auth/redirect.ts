export const DEFAULT_REDIRECT = '/myprofile';

/**
 * Validate a `?redirect=` query string. Accepts only same-origin paths that
 * start with a single `/`. Rejects protocol-relative URLs (`//evil.com`),
 * backslash-prefixed paths (`/\evil.com`, which some browsers normalize into
 * a protocol-relative URL pointing off-site), absolute URLs, and any other
 * shape — a malicious `redirect` parameter is an open-redirect vector.
 */
export function safeRedirectTarget(raw: string | null | undefined): string {
	if (!raw) return DEFAULT_REDIRECT;
	if (!raw.startsWith('/')) return DEFAULT_REDIRECT;
	if (raw.startsWith('//')) return DEFAULT_REDIRECT;
	if (raw.startsWith('/\\')) return DEFAULT_REDIRECT;
	return raw;
}
