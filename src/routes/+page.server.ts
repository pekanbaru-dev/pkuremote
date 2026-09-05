import { getUpcomingEvents, getPastEvents } from "$lib/server/events";
import { getPublishedArticles } from "$lib/server/articles";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
	const allUpcoming = await getUpcomingEvents();
	const allPast = await getPastEvents();
	const { articles } = await getPublishedArticles(1, 4);
	return {
		events: allUpcoming,
		pastEvents: allPast.slice(0, 6),
		pastEventsTotal: allPast.length,
		articles
	};
};
