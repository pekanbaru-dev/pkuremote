import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import RadioGroup from "./radio-group.svelte";

const OPTIONS = [
	{ label: "Pertama", value: "a" },
	{ label: "Kedua", value: "b", disabled: true }
];

describe("RadioGroup required forwarding", () => {
	it("forwards `required` to enabled radios when set", async () => {
		render(RadioGroup, { data: OPTIONS, name: "choice", required: true });

		const enabled = page.getByRole("radio", { name: "Pertama" });
		const disabled = page.getByRole("radio", { name: "Kedua" });

		await expect.element(enabled).toBeRequired();
		await expect.element(disabled).not.toBeRequired();
	});

	it("does not set `required` on any radio when the prop is false", async () => {
		render(RadioGroup, { data: OPTIONS, name: "choice" });

		const enabled = page.getByRole("radio", { name: "Pertama" });
		const disabled = page.getByRole("radio", { name: "Kedua" });

		await expect.element(enabled).not.toBeRequired();
		await expect.element(disabled).not.toBeRequired();
	});

	it("sets aria-required on the fieldset wrapper", async () => {
		render(RadioGroup, { data: OPTIONS, name: "choice", required: true });

		const group = page.getByRole("radiogroup");
		await expect.element(group).toHaveAttribute("aria-required", "true");
	});
});
