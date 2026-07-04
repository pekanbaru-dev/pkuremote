/**
 * Server-only registrations service barrel.
 *
 * NOT safe for client-side import — pulls in the Drizzle client and
 * the `postgres` driver.
 */
export {
	bookEvent,
	getMyRegistrations,
	getRegistrationByNumber,
	cancelRegistration,
	getEventRegistrations,
	setRegistrationStatus,
	tallyRegistrationCounts,
	isCheckinStatus,
	CHECKIN_STATUSES,
	RegistrationError,
	getRegistrationErrorMessage
} from "./db-registrations.ts";
export type {
	Registration,
	MyRegistration,
	RegistrationStatus,
	RegistrationErrorCode,
	EventRegistrationCounts,
	CheckinStatus
} from "./db-registrations.ts";
export { buildRegistrationQrPayload, buildRegistrationQrSvg } from "./qr.ts";
