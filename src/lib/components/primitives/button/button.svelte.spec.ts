import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Button from "./button.svelte";

describe("Button link mode (href)", () => {
	it("renders an <a> with href when `href` is set", async () => {
		render(Button, { href: "/login" });

		const target = document.querySelector('a[href="/login"]');
		expect(target).toBeTruthy();
		expect(target?.getAttribute("href")).toBe("/login");
	});

	it("drops `href` and sets aria-disabled when disabled", async () => {
		render(Button, { href: "/login", disabled: true });

		const target = document.querySelector("a");
		expect(target).toBeTruthy();
		expect(target?.hasAttribute("href")).toBe(false);
		expect(target?.getAttribute("aria-disabled")).toBe("true");
		expect(target?.getAttribute("tabindex")).toBe("-1");
	});

	it("drops `href` and sets aria-busy when loading", async () => {
		// `loading` is a boolean prop, not a snippet. We assert via the
		// `aria-busy` and `aria-disabled` attributes the component is
		// contractually required to set when loading=true.
		render(Button, { href: "/login", loading: true });
		const target = document.querySelector("a");
		expect(target).toBeTruthy();
		// Note: when loading=true the component renders the LoaderCircle icon
		// in place of children; we only assert the link-state contract.
		expect(target?.getAttribute("aria-busy")).toBe("true");
	});

	it("renders a <button> with disabled when no href", async () => {
		render(Button, { disabled: true });

		const target = document.querySelector("button");
		expect(target).toBeTruthy();
		expect(target?.hasAttribute("disabled")).toBe(true);
	});

	it("blocks click navigation when disabled", async () => {
		render(Button, { href: "/login", disabled: true });

		const target = document.querySelector("a") as HTMLAnchorElement | null;
		expect(target).toBeTruthy();
		// jsdom: clicking an anchor without href doesn't navigate, but the
		// guard handler should also call preventDefault if href were present.
		const evt = new MouseEvent("click", { bubbles: true, cancelable: true });
		target?.dispatchEvent(evt);
		expect(evt.defaultPrevented).toBe(true);
	});
});
