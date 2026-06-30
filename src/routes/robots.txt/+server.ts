import { PUBLIC_SITE_URL } from "$env/static/public";

export const GET = (): Response => {
	const body = `User-agent: *
Allow: /
Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml
`;
	return new Response(body, {
		headers: {
			"Content-Type": "text/plain",
			"Cache-Control": "max-age=3600"
		}
	});
};
