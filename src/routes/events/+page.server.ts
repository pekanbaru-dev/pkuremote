import { getCategoriesForScope, getPastEvents, getUpcomingEvents } from "$lib/server/events";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ url }) => {
	const categories = await getCategoriesForScope("event");
	const requestedSlug = url.searchParams.get("category");
	const filter = categories.find((category) => category.slug === requestedSlug) ?? null;
	const allUpcoming = await getUpcomingEvents();
	const allPast = await getPastEvents();

	const upcoming = filter
		? allUpcoming.filter((e) => e.categories.some((c) => c.slug === filter.slug))
		: allUpcoming;
	const past = filter
		? allPast.filter((e) => e.categories.some((c) => c.slug === filter.slug))
		: allPast;

	return { upcoming, past, filter, categories };
};
