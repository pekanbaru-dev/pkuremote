/**
 * Server-only helper that parses an event create/edit form's `FormData` into
 * the typed {@link EventWriteInput} the write services expect, plus the raw
 * banner `File` (when one was uploaded) and a string-keyed `values` record the
 * route re-renders on validation failure. Imported only by `+page.server.ts`.
 */
import type { EventCategory, EventStatus } from "../../features/events/types.ts";
import type { EventWriteInput } from "./db-event-writes.ts";

export type ParsedEventForm = {
	/** Typed payload for `createEvent`/`updateEvent` (with `bannerUrl: null` —
	 *  the action fills it after resolving the upload). */
	input: EventWriteInput;
	/** The uploaded banner, or null when the field was empty. */
	bannerFile: File | null;
	/** Submitted string values, echoed back to re-render the form on failure. */
	values: Record<string, string | string[]>;
};

export function parseEventFormData(formData: FormData): ParsedEventForm {
	const str = (key: string) => ((formData.get(key) as string | null) ?? "").trim();
	const numOrNull = (key: string) => {
		const v = str(key);
		return v === "" ? null : Number(v);
	};
	const dateOrNull = (key: string) => {
		const v = str(key);
		return v === "" ? null : new Date(v);
	};

	const banner = formData.get("banner");
	const bannerFile = banner instanceof File && banner.size > 0 ? banner : null;
	const categoryIds = formData
		.getAll("categoryIds")
		.map((v) => String(v))
		.filter((v) => v.length > 0);
	const category = str("category");
	const status = str("status") || "upcoming";

	return {
		input: {
			title: str("title"),
			slug: str("slug"),
			startsAt: new Date(str("startsAt")),
			endsAt: dateOrNull("endsAt"),
			location: str("location"),
			excerpt: str("excerpt"),
			body: str("body"),
			bannerUrl: null,
			status: status as EventStatus,
			quota: numOrNull("quota"),
			priceNormal: numOrNull("priceNormal"),
			pricePromo: numOrNull("pricePromo"),
			category: category === "" ? null : (category as EventCategory),
			registrationClosesAt: dateOrNull("registrationClosesAt"),
			categoryIds
		},
		bannerFile,
		values: {
			title: str("title"),
			slug: str("slug"),
			startsAt: str("startsAt"),
			endsAt: str("endsAt"),
			location: str("location"),
			excerpt: str("excerpt"),
			body: str("body"),
			status,
			quota: str("quota"),
			priceNormal: str("priceNormal"),
			pricePromo: str("pricePromo"),
			category,
			registrationClosesAt: str("registrationClosesAt"),
			categoryIds
		}
	};
}
