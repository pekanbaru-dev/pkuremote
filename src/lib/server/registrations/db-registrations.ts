/**
 * Server-only registrations service — transactional booking, listing,
 * and lookup. Lives under `src/lib/server/registrations/` so SvelteKit
 * excludes it from the client bundle.
 *
 * `bookEvent` is the critical-path correctness invariant: it uses
 * `SELECT … FOR UPDATE` on the event row to lock it, then inserts the
 * registration and decrements `remaining_slots` in the same transaction.
 * Two concurrent bookings on the last slot cannot both succeed.
 */
import { customAlphabet, nanoid } from "nanoid";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { events, profiles, registrations, eventCategories, categories } from "../../../../db/schema";
import type { Event } from "../../features/events/types.ts";
import type { EventCategoryRef } from "../../features/events/types.ts";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const shortId = customAlphabet(ALPHABET, 6);

/** Typed error codes thrown by the registration service. The action
 *  layer in `+page.server.ts` switches on these to render the right
 *  error message and HTTP status. */
export type RegistrationErrorCode =
	| "NOT_AUTHENTICATED"
	| "EVENT_NOT_FOUND"
	| "EVENT_PAST"
	| "EVENT_SOLD_OUT"
	| "REGISTRATION_CLOSED"
	| "ALREADY_REGISTERED"
	| "NOT_FOUND"
	| "REGISTRATION_NOT_CANCELLABLE"
	| "REGISTRATION_NUMBER_COLLISION"
	| "VALIDATION";

export class RegistrationError extends Error {
	readonly code: RegistrationErrorCode;
	constructor(code: RegistrationErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = "RegistrationError";
	}
}

export function getRegistrationErrorMessage(code: string): string {
	const messages: Record<string, string> = {
		EVENT_NOT_FOUND: "Event ini tidak ditemukan.",
		EVENT_PAST: "Event ini sudah berlalu.",
		EVENT_SOLD_OUT: "Event ini sudah penuh — coba event lain.",
		REGISTRATION_CLOSED: "Pendaftaran untuk event ini sudah ditutup.",
		ALREADY_REGISTERED: "Anda sudah terdaftar untuk event ini — cek halaman Registrasi Saya.",
		NOT_AUTHENTICATED: "Anda harus login untuk melakukan booking.",
		VALIDATION: "Data yang Anda masukkan tidak valid."
	};
	return messages[code] ?? "Gagal melakukan booking — coba lagi.";
}

export type RegistrationStatus = "confirmed" | "cancelled" | "attended" | "no_show";

export type Registration = {
	id: string;
	registrationNumber: string;
	attendeeName: string;
	attendeePhone: string;
	status: RegistrationStatus;
	createdAt: string;
	updatedAt: string;
	userId: string;
	eventId: string;
};

export type MyRegistration = Registration & {
	event: Event;
};

function generateRegistrationNumber(year: number): string {
	return `PKU-${year}-${shortId()}`;
}

function rowToRegistration(row: typeof registrations.$inferSelect): Registration {
	return {
		id: row.id,
		registrationNumber: row.registrationNumber,
		attendeeName: row.attendeeName,
		attendeePhone: row.attendeePhone,
		status: row.status as RegistrationStatus,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		userId: row.userId,
		eventId: row.eventId
	};
}

function rowEventToEvent(row: typeof events.$inferSelect, cats: EventCategoryRef[]): Event {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		startsAt: row.startsAt.toISOString(),
		endsAt: row.endsAt ? row.endsAt.toISOString() : undefined,
		location: row.location,
		excerpt: row.excerpt,
		body: row.body,
		bannerUrl: row.bannerUrl ?? undefined,
		status: row.status as Event["status"],
		quota: row.quota ?? undefined,
		remainingSlots: row.remainingSlots ?? undefined,
		priceNormal: row.priceNormal ?? undefined,
		pricePromo: row.pricePromo ?? undefined,
		category: (row.category as Event["category"]) ?? undefined,
		registrationClosesAt: row.registrationClosesAt
			? row.registrationClosesAt.toISOString()
			: undefined,
		categories: cats
	};
}

/** Book a user into an event. Atomic via a single Postgres transaction
 *  with `SELECT … FOR UPDATE` on the event row. */
export async function bookEvent(params: {
	userId: string;
	eventSlug: string;
	attendeeName: string;
	attendeePhone: string;
}): Promise<Registration> {
	if (!params.userId) {
		throw new RegistrationError("NOT_AUTHENTICATED");
	}

	const attendeeName = params.attendeeName.trim();
	const attendeePhone = params.attendeePhone.trim();
	if (!attendeeName) {
		throw new RegistrationError("VALIDATION", "Nama wajib diisi.");
	}
	if (!attendeePhone) {
		throw new RegistrationError("VALIDATION", "No. HP wajib diisi.");
	}

	return await db.transaction(async (tx) => {
		const [event] = await tx
			.select()
			.from(events)
			.where(eq(events.slug, params.eventSlug))
			.for("update")
			.limit(1);
		if (!event) {
			throw new RegistrationError("EVENT_NOT_FOUND");
		}
		if (event.status !== "upcoming") {
			throw new RegistrationError("EVENT_PAST");
		}
		if (event.remainingSlots !== null && event.remainingSlots <= 0) {
			throw new RegistrationError("EVENT_SOLD_OUT");
		}
		if (event.registrationClosesAt !== null && event.registrationClosesAt.getTime() <= Date.now()) {
			throw new RegistrationError("REGISTRATION_CLOSED");
		}

		// Try to insert with a fresh registration number. Retry once on
		// a unique-constraint collision (registrationNumber).
		const insertOnce = async (): Promise<Registration> => {
			const regNumber = generateRegistrationNumber(new Date().getFullYear());
			const [row] = await tx
				.insert(registrations)
				.values({
					userId: params.userId,
					eventId: event.id,
					registrationNumber: regNumber,
					attendeeName,
					attendeePhone
				})
				.returning();
			return rowToRegistration(row);
		};

		let registration: Registration;
		try {
			registration = await insertOnce();
		} catch (err) {
			const code = (err as { code?: string }).code;
			if (code === "23505") {
				// unique_violation — either (userId, eventId) duplicate
				// or registrationNumber collision. Distinguish: a second
				// try with a fresh number that fails on the same column
				// is ALREADY_REGISTERED; a failure on the first try with
				// a fresh number is the number collision (retried).
				try {
					registration = await insertOnce();
				} catch {
					throw new RegistrationError("ALREADY_REGISTERED");
				}
			} else {
				throw err;
			}
		}

		// Decrement remaining slots (only when the event has a quota).
		if (event.remainingSlots !== null) {
			await tx
				.update(events)
				.set({ remainingSlots: event.remainingSlots - 1 })
				.where(eq(events.id, event.id));
		}

		return registration;
	});
}

/** Return all registrations for a user, joined to the event and its
 *  categories, sorted by the event's `startsAt` ascending. */
export async function getMyRegistrations(userId: string): Promise<MyRegistration[]> {
	if (!userId) return [];

	const rows = await db
		.select({
			reg: registrations,
			event: events
		})
		.from(registrations)
		.innerJoin(events, eq(events.id, registrations.eventId))
		.where(eq(registrations.userId, userId))
		.orderBy(events.startsAt);

	// Fetch categories in bulk for these events.
	const eventIds = rows.map((r) => r.event.id);
	const cats =
		eventIds.length === 0
			? []
			: await db
					.select({
						eventId: eventCategories.eventId,
						id: categories.id,
						name: categories.name,
						slug: categories.slug
					})
					.from(eventCategories)
					.innerJoin(categories, eq(categories.id, eventCategories.categoryId))
					.where(inArray(eventCategories.eventId, eventIds));

	const catsByEvent = new Map<string, EventCategoryRef[]>();
	for (const row of cats) {
		const list = catsByEvent.get(row.eventId) ?? [];
		list.push({ id: row.id, name: row.name, slug: row.slug });
		catsByEvent.set(row.eventId, list);
	}

	return rows.map((r) => ({
		...rowToRegistration(r.reg),
		event: rowEventToEvent(r.event, catsByEvent.get(r.event.id) ?? [])
	}));
}

/** Look up a single registration by its `registrationNumber`. Returns
 *  `undefined` when the registration doesn't exist OR when it belongs
 *  to a different user (the ticket page uses this to enforce ownership
 *  by rendering 404 in both cases). */
export async function getRegistrationByNumber(
	registrationNumber: string,
	userId: string
): Promise<{
	registration: Registration;
	event: Event;
	profile: { id: string; displayName: string };
} | null> {
	if (!userId) return null;

	const [row] = await db
		.select({
			reg: registrations,
			event: events,
			profile: profiles
		})
		.from(registrations)
		.innerJoin(events, eq(events.id, registrations.eventId))
		.innerJoin(profiles, eq(profiles.id, registrations.userId))
		.where(
			and(
				eq(registrations.registrationNumber, registrationNumber),
				eq(registrations.userId, userId)
			)
		)
		.limit(1);

	if (!row) return null;

	// Eager-load categories for the event.
	const cats = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug
		})
		.from(eventCategories)
		.innerJoin(categories, eq(categories.id, eventCategories.categoryId))
		.where(eq(eventCategories.eventId, row.event.id));

	return {
		registration: rowToRegistration(row.reg),
		event: rowEventToEvent(row.event, cats),
		profile: { id: row.profile.id, displayName: row.profile.displayName }
	};
}

/** Cancel a registration. Atomic: marks the registration as `cancelled`
 *  and increments `events.remaining_slots` in the same transaction. */
export async function cancelRegistration(params: {
	registrationNumber: string;
	userId: string;
}): Promise<Registration> {
	if (!params.userId) {
		throw new RegistrationError("NOT_AUTHENTICATED");
	}

	return await db.transaction(async (tx) => {
		const [row] = await tx
			.select({
				reg: registrations,
				event: events
			})
			.from(registrations)
			.innerJoin(events, eq(events.id, registrations.eventId))
			.where(
				and(
					eq(registrations.registrationNumber, params.registrationNumber),
					eq(registrations.userId, params.userId)
				)
			)
			.for("update")
			.limit(1);
		if (!row) {
			throw new RegistrationError("NOT_FOUND");
		}
		if (row.event.status !== "upcoming") {
			throw new RegistrationError("REGISTRATION_NOT_CANCELLABLE");
		}

		const [updated] = await tx
			.update(registrations)
			.set({ status: "cancelled", updatedAt: new Date() })
			.where(eq(registrations.id, row.reg.id))
			.returning();

		if (row.event.remainingSlots !== null) {
			await tx
				.update(events)
				.set({ remainingSlots: row.event.remainingSlots + 1 })
				.where(eq(events.id, row.event.id));
		}

		return rowToRegistration(updated);
	});
}

/** Suppress unused-import warning for `nanoid` (kept for ad-hoc use). */
void nanoid;

import type {} from "../../../../db/schema";
