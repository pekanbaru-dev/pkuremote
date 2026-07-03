import { getUpcomingEvents, getPastEvents } from "$lib/server/events";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
	const allUpcoming = await getUpcomingEvents();
	const allPast = await getPastEvents();
	return {
		events: allUpcoming,
		pastEvents: allPast.slice(0, 6),
		pastEventsTotal: allPast.length
	};
};
