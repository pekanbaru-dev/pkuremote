import { getPublishedArticles } from "$lib/server/articles";
import { PUBLIC_SITE_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
	// Request up to 20 articles for the feed (the default page size is 10).
	const { articles } = await getPublishedArticles(1, 20);
	const items = articles.slice(0, 20);

	const rssItems = items
		.map((article) => {
			const url = `${PUBLIC_SITE_URL}/blog/${article.slug}`;
			const pubDate = (article.publishedAt ?? article.createdAt).toUTCString();
			const description = article.excerpt
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
			const title = article.title
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
			return `  <item>
    <title>${title}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <description>${description}</description>
    <pubDate>${pubDate}</pubDate>
    <author>${article.authorDisplayName ?? "PKUBersua"}</author>
  </item>`;
		})
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PKUBersua Blog</title>
    <link>${PUBLIC_SITE_URL}/blog</link>
    <description>Artikel dan tulisan dari komunitas PKUBersua Pekanbaru.</description>
    <language>id</language>
    <atom:link href="${PUBLIC_SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "max-age=3600"
		}
	});
};
