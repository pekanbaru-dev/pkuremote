import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import type { Event } from "$lib/features/events";
import EventBookingCta from "./event-booking-cta.svelte";

function makeEvent(overrides: Partial<Event> = {}): Event {
	return {
		id: "e1",
		slug: "e1",
		title: "Talam Masterclass",
		startsAt: "2099-10-24T19:00:00+07:00",
		location: "Pekanbaru",
		excerpt: "An excerpt.",
		body: "Body.",
		status: "upcoming",
		quota: 30,
		remainingSlots: 12,
		categories: [],
		...overrides
	};
}

describe("EventBookingCta", () => {
	it("renders a login link when the user is not authenticated", async () => {
		render(EventBookingCta, { event: makeEvent(), authenticated: false });

		// The CTA renders two links (desktop + mobile) with the same
		// accessible name; the first one is the desktop "Login dulu
		// untuk booking" anchor.
		const links = page.getByRole("link", { name: /Login dulu untuk booking/i });
		await expect.element(links.first()).toBeVisible();
		await expect.element(links.first()).toHaveAttribute("href", "/login?redirect=%2Fevents%2Fe1");
	});

	it("renders a booking form with attendee name + phone inputs when authenticated and bookable", async () => {
		render(EventBookingCta, { event: makeEvent(), authenticated: true });

		const nameInput = page.getByRole("textbox", { name: /Nama Peserta/i });
		const phoneInput = page.getByRole("textbox", { name: /No\. HP/i });
		const submit = page.getByRole("button", { name: /Booking Sekarang/i }).first();
		await expect.element(nameInput).toBeVisible();
		await expect.element(phoneInput).toBeVisible();
		await expect.element(submit).toBeVisible();
	});

	it("pre-fills the form fields from formState", async () => {
		render(EventBookingCta, {
			event: makeEvent(),
			authenticated: true,
			formState: { attendeeName: "Andi", attendeePhone: "081234567890" }
		});

		const nameInput = page.getByRole("textbox", { name: /Nama Peserta/i });
		const phoneInput = page.getByRole("textbox", { name: /No\. HP/i });
		await expect.element(nameInput).toHaveValue("Andi");
		await expect.element(phoneInput).toHaveValue("081234567890");
	});

	it("renders a disabled button labeled 'Kuota penuh' when remainingSlots is 0", async () => {
		render(EventBookingCta, { event: makeEvent({ remainingSlots: 0 }), authenticated: true });

		const button = page.getByRole("button", { name: /Kuota penuh/i }).first();
		await expect.element(button).toBeVisible();
		await expect.element(button).toBeDisabled();
	});

	it("renders a disabled button labeled 'Event telah berlalu' when status is past", async () => {
		render(EventBookingCta, { event: makeEvent({ status: "past" }), authenticated: true });

		const button = page.getByRole("button", { name: /Event telah berlalu/i }).first();
		await expect.element(button).toBeVisible();
		await expect.element(button).toBeDisabled();
	});

	it("renders a disabled button labeled 'Pendaftaran ditutup' when registrationClosesAt is in the past", async () => {
		render(EventBookingCta, {
			event: makeEvent({ registrationClosesAt: "2020-01-01T00:00:00+00:00" }),
			authenticated: true
		});

		const button = page.getByRole("button", { name: /Pendaftaran ditutup/i }).first();
		await expect.element(button).toBeVisible();
		await expect.element(button).toBeDisabled();
	});

	it("renders the bookingError message when one is passed", async () => {
		render(EventBookingCta, {
			event: makeEvent(),
			authenticated: true,
			bookingError: "Event ini sudah penuh — coba event lain."
		});

		const error = page.getByRole("alert");
		await expect.element(error).toBeVisible();
		await expect.element(error).toHaveTextContent("Event ini sudah penuh");
	});
});
