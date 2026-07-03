import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import type { Event } from "$lib/features/events";
import EventsPage from "./+page.svelte";

function makeEvent(id: string, startsAt: string, categories: Event["categories"] = []): Event {
	return {
		id,
		slug: id,
		title: `Event ${id}`,
		startsAt,
		location: "Pekanbaru",
		excerpt: "An excerpt for testing.",
		body: "Body for testing.",
		status: "upcoming",
		categories
	};
}

const NOOP_CAT = [{ id: "c1", name: "Workshop", slug: "workshop" }];

describe("events listing page", () => {
	it("renders the upcoming section and omits the past section when only upcoming events exist", async () => {
		const upcoming = [
			makeEvent("u1", "2099-01-01T19:00:00+07:00", NOOP_CAT),
			makeEvent("u2", "2099-02-01T19:00:00+07:00", NOOP_CAT)
		];

		render(EventsPage, { data: { upcoming, past: [], filter: null, user: null } });

		await expect.element(page.getByRole("heading", { name: "Event Akan Datang" })).toBeVisible();
		await expect.element(page.getByRole("link", { name: "Event u1" })).toBeVisible();
		expect(page.getByRole("heading", { name: "Event Sebelumnya" })).toHaveLength(0);
	});

	it("renders the past section and shows the upcoming EmptyState when no upcoming events exist", async () => {
		const past = [
			makeEvent("p1", "2000-01-01T19:00:00+07:00"),
			makeEvent("p2", "2000-02-01T19:00:00+07:00")
		];

		render(EventsPage, { data: { upcoming: [], past, filter: null, user: null } });

		await expect
			.element(
				page.getByText("Belum ada event yang akan datang — pantau terus untuk kabar terbaru.")
			)
			.toBeVisible();
		await expect.element(page.getByRole("heading", { name: "Event Sebelumnya" })).toBeVisible();
	});

	it("omits the past section when no past events exist", async () => {
		const upcoming = [makeEvent("u1", "2099-01-01T19:00:00+07:00")];

		render(EventsPage, { data: { upcoming, past: [], filter: null, user: null } });

		expect(page.getByRole("heading", { name: "Event Sebelumnya" })).toHaveLength(0);
	});

	it("renders the filter chip and the filter-aware EmptyState when filtered to a category with no matches", async () => {
		const past = [makeEvent("p1", "2000-01-01T19:00:00+07:00")];

		render(EventsPage, {
			data: {
				upcoming: [],
				past,
				filter: { name: "Workshop", slug: "workshop" },
				user: null
			}
		});

		const chip = page.getByTestId("filter-chip");
		await expect.element(chip).toBeVisible();
		await expect.element(page.getByTestId("filter-clear-link")).toHaveAttribute("href", "/events");
		await expect
			.element(
				page.getByText("Belum ada event 'Workshop' — coba hapus filter atau pilih kategori lain.")
			)
			.toBeVisible();
	});
});
