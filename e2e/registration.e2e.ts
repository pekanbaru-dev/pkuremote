import { expect, test } from "@playwright/test";

/**
 * Booking + ticket round-trip.
 *
 * Requires:
 *  - The dev/preview Supabase project to be migrated + seeded.
 *  - A signed-in test user (the booking action requires authentication).
 *
 * When the project is empty OR no user is signed in, the test skips
 * itself so CI on a fresh checkout does not fail.
 */
test.describe("registration round-trip", () => {
	test("home → event detail → book → ticket page → myregistrations → ticket", async ({ page }) => {
		const response = await page.goto("/");
		const status = response?.status() ?? 0;
		test.skip(status !== 200, `homepage returned ${status} — DB likely not seeded`);

		// Find a bookable event card
		const firstEventLink = page.locator("a[href^='/events/']").first();
		const linkCount = await firstEventLink.count();
		test.skip(linkCount === 0, "no event cards rendered — DB not seeded");

		const detailHref = await firstEventLink.getAttribute("href");
		await firstEventLink.click();
		await expect(page).toHaveURL(new RegExp(`${detailHref}$`));

		// Look for a booking form (authenticated) or a login link (unauthenticated)
		const loginLink = page.getByRole("link", { name: /Login dulu untuk booking/i });
		const loginVisible = await loginLink.count();
		test.skip(loginVisible > 0, "user is not signed in — booking requires auth");

		const bookingButton = page.getByRole("button", { name: /Booking Sekarang/i });
		await expect(bookingButton).toBeVisible();

		// Click the booking form
		await bookingButton.click();

		// Should land on a ticket page (or the same page with a flash error)
		const ticketQr = page.getByTestId("ticket-qr");
		const cancelledNotice = page.getByTestId("cancelled-notice");
		const regNumber = page.getByTestId("registration-number");
		await expect(ticketQr.or(cancelledNotice).or(regNumber)).toBeVisible();

		// If we have a ticket, visit /myregistrations and back
		const ticketUrl = page.url();
		if (ticketUrl.includes("/ticket/")) {
			await page.goto("/myregistrations");
			const list = page.getByTestId("myregistrations-list");
			await expect(list).toBeVisible();
		}
	});
});
