import QRCode from "qrcode";
import type { Registration } from "./db-registrations.ts";

/** Build the payload that gets encoded into the ticket's QR code. The
 *  payload is a URL so a future check-in scanner can `fetch` it. */
export function buildRegistrationQrPayload(registration: Registration): string {
	return `pkubersua://registration/${registration.registrationNumber}`;
}

/** Render the payload as an SVG string, suitable for inlining into
 *  the ticket page's HTML. The SVG is in the initial HTML response so
 *  the user can print, screenshot, or save the page. */
export async function buildRegistrationQrSvg(registration: Registration): Promise<string> {
	return await QRCode.toString(buildRegistrationQrPayload(registration), {
		type: "svg",
		margin: 1,
		width: 220,
		errorCorrectionLevel: "M"
	});
}
