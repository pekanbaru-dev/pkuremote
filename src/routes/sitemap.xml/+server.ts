import { PUBLIC_SITE_URL } from "$env/static/public"; // baked at build time via Docker ARG
import { getUpcomingEvents, getPastEvents } from "$lib/server/events";
import { getAllArticles } from "$lib/server/articles";

export const GET = async (): Promise<Response> => {
	const today = new Date().toISOString().split("T")[0];
	const allEvents = [...(await getUpcomingEvents()), ...(await getPastEvents())];
	const articles = await getAllArticles("published");

	const urls = [
		{ loc: `${PUBLIC_SITE_URL}/`, lastmod: today },
		{ loc: `${PUBLIC_SITE_URL}/blog`, lastmod: today },
		...allEvents.map((e) => ({
			loc: `${PUBLIC_SITE_URL}/events/${e.slug}`,
			lastmod: e.startsAt.split("T")[0]
		})),
		...articles.map((a) => ({
			loc: `${PUBLIC_SITE_URL}/blog/${a.slug}`,
			lastmod: (a.updatedAt ?? a.publishedAt ?? a.createdAt).toISOString().split("T")[0]
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
