import { PUBLIC_SITE_URL } from "$env/static/public"; // baked at build time via Docker ARG
import { getUpcomingEvents, getPastEvents } from "$lib/server/events";

export const GET = async (): Promise<Response> => {
	const today = new Date().toISOString().split("T")[0];
	const allEvents = [...(await getUpcomingEvents()), ...(await getPastEvents())];

	const urls = [
		{ loc: `${PUBLIC_SITE_URL}/`, lastmod: today },
		...allEvents.map((e) => ({
			loc: `${PUBLIC_SITE_URL}/events/${e.slug}`,
			lastmod: e.startsAt.split("T")[0]
		}))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) =>
			`  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>`
	)
	.join("\n")}
</urlset>`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "max-age=3600"
		}
	});
};
