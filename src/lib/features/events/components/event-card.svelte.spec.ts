import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import type { Event } from "$lib/features/events";
import EventCard from "./event-card.svelte";

function makeEvent(overrides: Partial<Event> = {}): Event {
	return {
		id: "e1",
		slug: "e1",
		title: "Talam Masterclass",
		startsAt: "2026-10-24T19:00:00+07:00",
		location: "Pekanbaru",
		excerpt: "An excerpt for testing.",
		body: "Body for testing.",
		status: "upcoming",
		categories: [
			{ id: "c1", name: "Workshop", slug: "workshop" },
			{ id: "c2", name: "Hands-on", slug: "hands-on" }
		],
		...overrides
	};
}

describe("EventCard clickable pills", () => {
	it("renders each category pill as a link to the filtered listing", async () => {
		render(EventCard, { event: makeEvent() });

		const pill1 = page.getByRole("link", { name: "Workshop" });
		const pill2 = page.getByRole("link", { name: "Hands-on" });
		await expect.element(pill1).toBeVisible();
		await expect.element(pill2).toBeVisible();
		await expect.element(pill1).toHaveAttribute("href", "/events?category=workshop");
		await expect.element(pill2).toHaveAttribute("href", "/events?category=hands-on");
	});

	it("renders the body link as a sibling of the pills (not a parent)", async () => {
		render(EventCard, { event: makeEvent() });

		const bodyLink = page.getByRole("link", { name: "Talam Masterclass" });
		const pill = page.getByRole("link", { name: "Workshop" });
		await expect.element(bodyLink).toBeVisible();
		await expect.element(pill).toBeVisible();
		await expect.element(bodyLink).toHaveAttribute("href", "/events/e1");
	});

	it("renders no pills when the event has no categories", async () => {
		render(EventCard, { event: makeEvent({ categories: [] }) });

		const pills = page.getByRole("link", { name: "Workshop" });
		expect(pills).toHaveLength(0);
	});

	it("URL-encodes category slugs with special characters", async () => {
		render(EventCard, {
			event: makeEvent({
				categories: [{ id: "c1", name: "Riau & Co", slug: "riau-&-co" }]
			})
		});
		const pill = page.getByRole("link", { name: "Riau & Co" });
		await expect.element(pill).toHaveAttribute("href", "/events?category=riau-%26-co");
	});
});
