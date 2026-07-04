/**
 * Server-only event WRITE services — create/update/delete plus the pure
 * validation and diff helpers behind them. Lives under `src/lib/server/`
 * so SvelteKit keeps it out of the client bundle; invoked ONLY from
 * admin-gated `+page.server.ts` actions (which call `requireAdmin` first).
 *
 * The pure helpers (`validateEventInput`, `computeRemainingSlots`,
 * `diffCategoryIds`, `isUniqueViolation`) carry no I/O so they can be
 * unit-tested without a database.
 */
import { and, eq, inArray } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { isUniqueViolation } from "$lib/server/db/pg-error";
import { events, eventCategories } from "../../../../db/schema";
import type { EventCategory, EventStatus } from "../../features/events/types.ts";

export { isUniqueViolation };

/** Typed error codes returned by the event write services. The action layer
 *  switches on these to surface field-level messages instead of a 500. */
export type EventWriteErrorCode = "SLUG_TAKEN" | "VALIDATION" | "NOT_FOUND";

export class EventWriteError extends Error {
	readonly code: EventWriteErrorCode;
	/** The form field the error attaches to, when applicable (e.g. `slug`). */
	readonly field?: string;
	constructor(code: EventWriteErrorCode, message: string, field?: string) {
		super(message);
		this.name = "EventWriteError";
		this.code = code;
		this.field = field;
	}
}

/** Normalized event write payload. Actions parse the raw `FormData` into this
 *  shape (see `parseEventFormData`); the service validates and persists it. */
export type EventWriteInput = {
	title: string;
	slug: string;
	startsAt: Date;
	endsAt: Date | null;
	location: string;
	excerpt: string;
	body: string;
	bannerUrl: string | null;
	status: EventStatus;
	quota: number | null;
	priceNormal: number | null;
	pricePromo: number | null;
	category: EventCategory | null;
	registrationClosesAt: Date | null;
	/** Selected M2M category ids to link via `event_categories`. */
	categoryIds: string[];
};

const STATUS_VALUES: readonly EventStatus[] = ["upcoming", "live", "past"];
const CATEGORY_VALUES: readonly EventCategory[] = ["workshop", "talk", "meetup", "social", "other"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validate an event payload, mirroring the DB CHECK constraints so a bad
 * input surfaces as a typed error before it reaches the database. Pure.
 * Throws {@link EventWriteError} with code `VALIDATION` on the first problem.
 */
export function validateEventInput(input: EventWriteInput): void {
	if (!input.title.trim()) throw new EventWriteError("VALIDATION", "Judul wajib diisi.", "title");
	if (!input.slug.trim()) throw new EventWriteError("VALIDATION", "Slug wajib diisi.", "slug");
	if (!SLUG_RE.test(input.slug.trim())) {
		throw new EventWriteError(
			"VALIDATION",
			"Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
			"slug"
		);
	}
	if (!input.location.trim())
		throw new EventWriteError("VALIDATION", "Lokasi wajib diisi.", "location");
	if (!input.excerpt.trim())
		throw new EventWriteError("VALIDATION", "Ringkasan wajib diisi.", "excerpt");
	if (!input.body.trim()) throw new EventWriteError("VALIDATION", "Isi wajib diisi.", "body");
	if (!(input.startsAt instanceof Date) || Number.isNaN(input.startsAt.getTime())) {
		throw new EventWriteError("VALIDATION", "Waktu mulai tidak valid.", "startsAt");
	}
	if (input.endsAt && input.endsAt.getTime() < input.startsAt.getTime()) {
		throw new EventWriteError(
			"VALIDATION",
			"Waktu selesai tidak boleh sebelum waktu mulai.",
			"endsAt"
		);
	}
	if (!STATUS_VALUES.includes(input.status)) {
		throw new EventWriteError("VALIDATION", "Status tidak valid.", "status");
	}
	if (input.category !== null && !CATEGORY_VALUES.includes(input.category)) {
		throw new EventWriteError("VALIDATION", "Kategori utama tidak valid.", "category");
	}
	if (input.quota !== null && !(Number.isInteger(input.quota) && input.quota > 0)) {
		throw new EventWriteError("VALIDATION", "Kuota harus bilangan bulat lebih dari 0.", "quota");
	}
	if (
		input.priceNormal !== null &&
		!(Number.isInteger(input.priceNormal) && input.priceNormal >= 0)
	) {
		throw new EventWriteError("VALIDATION", "Harga normal tidak valid.", "priceNormal");
	}
	if (input.pricePromo !== null && !(Number.isInteger(input.pricePromo) && input.pricePromo >= 0)) {
		throw new EventWriteError("VALIDATION", "Harga promo tidak valid.", "pricePromo");
	}
	if (
		input.priceNormal !== null &&
		input.pricePromo !== null &&
		input.pricePromo >= input.priceNormal
	) {
		throw new EventWriteError(
			"VALIDATION",
			"Harga promo harus lebih rendah dari harga normal.",
			"pricePromo"
		);
	}
}

/**
 * Derive `remainingSlots` from a (possibly changed) quota while keeping the
 * booking invariant intact: never above the new quota, never below zero, and
 * never below the count already booked. Pure. Throws `VALIDATION` (field
 * `quota`) when the new quota would drop below the booked count.
 */
export function computeRemainingSlots(args: {
	newQuota: number | null;
	oldQuota: number | null;
	oldRemaining: number | null;
}): number | null {
	const { newQuota, oldQuota, oldRemaining } = args;
	if (newQuota === null) return null;
	const booked = oldQuota !== null && oldRemaining !== null ? oldQuota - oldRemaining : 0;
	if (newQuota < booked) {
		throw new EventWriteError(
			"VALIDATION",
			`Kuota (${newQuota}) tidak boleh di bawah jumlah pendaftar saat ini (${booked}).`,
			"quota"
		);
	}
	return newQuota - booked;
}

/** Compute the add/remove set to reconcile the current category links with
 *  the newly-selected set. Pure. */
export function diffCategoryIds(
	current: string[],
	next: string[]
): { toAdd: string[]; toRemove: string[] } {
	const currentSet = new Set(current);
	const nextSet = new Set(next);
	return {
		toAdd: [...nextSet].filter((id) => !currentSet.has(id)),
		toRemove: [...currentSet].filter((id) => !nextSet.has(id))
	};
}

/**
 * Validate and insert a new event, linking the selected categories and
 * initializing `remainingSlots` to `quota` (null when quota is null), in a
 * single transaction. Returns the new event id. Throws {@link EventWriteError}
 * (`VALIDATION` on bad input, `SLUG_TAKEN` on a duplicate slug).
 */
export async function createEvent(input: EventWriteInput): Promise<string> {
	validateEventInput(input);
	const categoryIds = [...new Set(input.categoryIds)];
	try {
		return await db.transaction(async (tx) => {
			const [row] = await tx
				.insert(events)
				.values({
					slug: input.slug.trim(),
					title: input.title.trim(),
					startsAt: input.startsAt,
					endsAt: input.endsAt,
					location: input.location.trim(),
					excerpt: input.excerpt.trim(),
					body: input.body,
					bannerUrl: input.bannerUrl,
					status: input.status,
					quota: input.quota,
					remainingSlots: input.quota,
					priceNormal: input.priceNormal,
					pricePromo: input.pricePromo,
					category: input.category,
					registrationClosesAt: input.registrationClosesAt
				})
				.returning({ id: events.id });

			if (categoryIds.length > 0) {
				await tx
					.insert(eventCategories)
					.values(categoryIds.map((categoryId) => ({ eventId: row.id, categoryId })));
			}
			return row.id;
		});
	} catch (err) {
		if (isUniqueViolation(err)) {
			throw new EventWriteError("SLUG_TAKEN", "Slug ini sudah digunakan.", "slug");
		}
		throw err;
	}
}

/**
 * Validate and update an event: writes the row, recomputes `remainingSlots`
 * against the booked count, and reconciles the M2M category links as an
 * add/remove diff — all atomically. Throws {@link EventWriteError}
 * (`NOT_FOUND`, `VALIDATION`, `SLUG_TAKEN`).
 */
export async function updateEvent(id: string, input: EventWriteInput): Promise<void> {
	validateEventInput(input);
	const categoryIds = [...new Set(input.categoryIds)];
	try {
		await db.transaction(async (tx) => {
			const [existing] = await tx
				.select()
				.from(events)
				.where(eq(events.id, id))
				.for("update")
				.limit(1);
			if (!existing) {
				throw new EventWriteError("NOT_FOUND", "Event tidak ditemukan.");
			}

			const remainingSlots = computeRemainingSlots({
				newQuota: input.quota,
				oldQuota: existing.quota,
				oldRemaining: existing.remainingSlots
			});

			await tx
				.update(events)
				.set({
					slug: input.slug.trim(),
					title: input.title.trim(),
					startsAt: input.startsAt,
					endsAt: input.endsAt,
					location: input.location.trim(),
					excerpt: input.excerpt.trim(),
					body: input.body,
					bannerUrl: input.bannerUrl,
					status: input.status,
					quota: input.quota,
					remainingSlots,
					priceNormal: input.priceNormal,
					pricePromo: input.pricePromo,
					category: input.category,
					registrationClosesAt: input.registrationClosesAt
				})
				.where(eq(events.id, id));

			const currentRows = await tx
				.select({ categoryId: eventCategories.categoryId })
				.from(eventCategories)
				.where(eq(eventCategories.eventId, id));
			const { toAdd, toRemove } = diffCategoryIds(
				currentRows.map((r) => r.categoryId),
				categoryIds
			);
			if (toRemove.length > 0) {
				await tx
					.delete(eventCategories)
					.where(
						and(eq(eventCategories.eventId, id), inArray(eventCategories.categoryId, toRemove))
					);
			}
			if (toAdd.length > 0) {
				await tx
					.insert(eventCategories)
					.values(toAdd.map((categoryId) => ({ eventId: id, categoryId })));
			}
		});
	} catch (err) {
		if (isUniqueViolation(err)) {
			throw new EventWriteError("SLUG_TAKEN", "Slug ini sudah digunakan.", "slug");
		}
		throw err;
	}
}

/** Delete an event by id. `event_categories` and `registrations` rows are
 *  removed by the existing `ON DELETE CASCADE` FKs. */
export async function deleteEvent(id: string): Promise<void> {
	await db.delete(events).where(eq(events.id, id));
}
