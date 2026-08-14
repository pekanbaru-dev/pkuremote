import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import type { Event } from "$lib/features/events";

vi.mock("$app/state", () => ({
	page: { data: { user: null } }
}));

function makeEvents(n: number): Event[] {
	return Array.from({ length: n }, (_, i) => ({
		id: `p${i}`,
		slug: `p${i}`,
		title: `Past ${i}`,
		startsAt: "2000-01-01T00:00:00+00:00",
		location: "Pekanbaru",
		excerpt: "stub",
		body: "stub",
		status: "past" as const,
		categories: []
	}));
}

describe("homepage Lihat semua reveal", () => {
	it("does not show the Lihat semua link when there are 3 past events", async () => {
		const Home = (await import("./+page.svelte")).default;
		render(Home, {
			data: {
				events: [],
				pastEvents: makeEvents(3),
				pastEventsTotal: 3,
				user: null
			}
		});

		await expect
			.element(page.getByRole("link", { name: "Lihat semua", exact: true }))
			.not.toBeInTheDocument();
	});

	it("shows the Lihat semua link when there are 7 past events", async () => {
		const Home = (await import("./+page.svelte")).default;
		render(Home, {
			data: {
				events: [],
				pastEvents: makeEvents(6),
				pastEventsTotal: 7,
				user: null
			}
		});

		const link = page.getByRole("link", { name: "Lihat semua", exact: true });
		await expect.element(link).toBeVisible();
		await expect.element(link).toHaveAttribute("href", "/events");
	});
});
