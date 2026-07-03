import { getUpcomingEvents, getPastEvents } from "$lib/server/events";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ url }) => {
	const categorySlug = url.searchParams.get("category");
	const allUpcoming = await getUpcomingEvents();
	const allPast = await getPastEvents();

	const upcoming = categorySlug
		? allUpcoming.filter((e) => e.categories.some((c) => c.slug === categorySlug))
		: allUpcoming;
	const past = categorySlug
		? allPast.filter((e) => e.categories.some((c) => c.slug === categorySlug))
		: allPast;

	let filter: { name: string; slug: string } | null = null;
	if (categorySlug) {
		const match = upcoming
			.concat(past)
			.flatMap((e) => e.categories)
			.find((c) => c.slug === categorySlug);
		filter = { name: match?.name ?? categorySlug, slug: categorySlug };
	}

	return { upcoming, past, filter };
};
