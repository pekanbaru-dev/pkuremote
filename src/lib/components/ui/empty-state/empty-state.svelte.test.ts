import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import EmptyState from "./empty-state.svelte";

describe("EmptyState", () => {
	it("renders the title and description", async () => {
		render(EmptyState, {
			title: "No events yet",
			description: "Check back soon for the next meetup."
		});

		const heading = page.getByText("No events yet");
		await expect.element(heading).toBeInTheDocument();

		const description = page.getByText("Check back soon for the next meetup.");
		await expect.element(description).toBeInTheDocument();
	});

	it("omits the description block when not provided", async () => {
		render(EmptyState, { title: "Nothing here" });

		await expect.element(page.getByText("Nothing here")).toBeInTheDocument();
		await expect.element(page.getByText("Check back soon")).not.toBeInTheDocument();
	});
});
