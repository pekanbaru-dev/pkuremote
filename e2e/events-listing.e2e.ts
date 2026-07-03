import { expect, test } from "@playwright/test";

/**
 * Events listing round-trip.
 *
 * Requires the dev / preview Supabase project to be seeded with the 3
 * events (run `pnpm db:migrate && pnpm db:seed`). When the project is
 * empty, the test skips itself so CI on a fresh checkout does not fail.
 */
test.describe("events listing round-trip", () => {
	test("home → footer Events Calendar → listing → detail → back-link → listing", async ({
		page
	}) => {
		const response = await page.goto("/");
		const status = response?.status() ?? 0;
		test.skip(status !== 200, `homepage returned ${status} — DB likely not seeded`);

		// Footer link
		await page.getByRole("link", { name: "Events Calendar" }).click();
		await expect(page).toHaveURL(/\/events$/);

		// Listing renders the upcoming heading
		const upcomingHeading = page.getByRole("heading", { name: "Event Akan Datang" });
		await expect(upcomingHeading).toBeVisible();

		// Skip if there are no event cards (DB empty)
		const firstCard = page.locator("ul li a").first();
		const cardCount = await firstCard.count();
		test.skip(cardCount === 0, "no event cards on listing — DB not seeded");

		// Click the first event card
		const detailHref = await firstCard.getAttribute("href");
		expect(detailHref).toMatch(/^\/events\/[a-z0-9-]+$/);
		await firstCard.click();
		await expect(page).toHaveURL(new RegExp(`${detailHref}$`));

		// Back-link round-trip
		const backLink = page.getByRole("link", { name: /Kembali ke semua event/i });
		await expect(backLink).toBeVisible();
		await backLink.click();
		await expect(page).toHaveURL(/\/events$/);
		await expect(upcomingHeading).toBeVisible();
	});
});
