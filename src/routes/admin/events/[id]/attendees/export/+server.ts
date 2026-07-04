import { error } from "@sveltejs/kit";
import { getEventById } from "$lib/server/events";
import { getEventRegistrations } from "$lib/server/registrations";
import { requireAdmin } from "$lib/server/auth/admin";
import type { RequestHandler } from "./$types";

/** Quote a CSV cell and escape embedded quotes, so commas/quotes/newlines in
 *  names or phones can't corrupt the file. */
function csvCell(value: string): string {
	return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Admin-gated CSV export of an event's attendee list. A plain GET so the
 * browser downloads it without JS. Re-asserts `requireAdmin` (endpoints don't
 * run the /admin layout gate).
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	requireAdmin(locals);
	const event = await getEventById(params.id);
	if (!event) {
		error(404, "Event tidak ditemukan");
	}
	const { registrations } = await getEventRegistrations(params.id);

	const header = ["Registration Number", "Name", "Phone", "Status", "Registered At"];
	const rows = registrations.map((r) =>
		[r.registrationNumber, r.attendeeName, r.attendeePhone, r.status, r.createdAt]
			.map((v) => csvCell(String(v ?? "")))
			.join(",")
	);
	const csv = [header.map(csvCell).join(","), ...rows].join("\r\n") + "\r\n";

	return new Response(csv, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="${event.slug}-attendees.csv"`
		}
	});
};
