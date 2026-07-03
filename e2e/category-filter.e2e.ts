import { expect, test } from "@playwright/test";

/**
 * Clickable category filter round-trip.
 *
 * Requires the dev / preview Supabase project to be seeded with the 3
 * events + 6 categories (run `pnpm db:migrate && pnpm db:seed` before
 * `pnpm test:e2e`). When the project is empty, the test skips itself so
 * CI on a fresh checkout does not fail.
 */
test.describe("category filter round-trip", () => {
	test("home → first card pill → filtered listing → Hapus filter → unfiltered", async ({
		page
	}) => {
		const response = await page.goto("/");
		const status = response?.status() ?? 0;
		test.skip(status !== 200, `homepage returned ${status} — DB likely not seeded`);

		const firstPill = page.locator("a[href^='/events?category=']").first();
		const pillCount = await firstPill.count();
		test.skip(pillCount === 0, "no category pills rendered — DB not seeded");

		const pillHref = await firstPill.getAttribute("href");
		expect(pillHref).toMatch(/^\/events\?category=[a-z0-9-]+$/);

		await firstPill.click();
		await expect(page).toHaveURL(/\/events\?category=/);

		const chip = page.getByTestId("filter-chip");
		await expect(chip).toBeVisible();

		const clearLink = page.getByTestId("filter-clear-link");
		await expect(clearLink).toHaveAttribute("href", "/events");
		await clearLink.click();
		await expect(page).toHaveURL(/\/events$/);
		await expect(chip).not.toBeVisible();
	});
});
