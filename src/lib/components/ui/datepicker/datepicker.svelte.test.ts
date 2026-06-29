import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import DatePicker from "./datepicker.svelte";
import { fromDate } from "./date-helpers";

describe("DatePicker", () => {
	it("renders the empty state when value is undefined", async () => {
		render(DatePicker, { label: "Start date" });

		const group = page.getByRole("group", { name: "Start date" });
		await expect.element(group).toBeInTheDocument();
	});

	it("renders a single-date trigger when value is set", async () => {
		render(DatePicker, {
			label: "Start date",
			value: fromDate(new Date(2026, 6, 11))
		});

		const group = page.getByRole("group", { name: "Start date" });
		await expect.element(group).toBeInTheDocument();
	});
});
