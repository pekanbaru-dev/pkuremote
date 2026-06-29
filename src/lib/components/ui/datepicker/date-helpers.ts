import { CalendarDate } from "@internationalized/date";

/**
 * Convert a JS `Date` to a timezone-naive `CalendarDate` (year/month/day in the
 * runtime's local timezone). The resulting `CalendarDate` is suitable for use
 * as the `value` prop of the `DatePicker` component when the consumer only
 * cares about a calendar day (no time-of-day, no IANA timezone).
 *
 * For `CalendarDateTime` or `ZonedDateTime` values, construct those directly
 * from the JS `Date` via `@internationalized/date` — this helper intentionally
 * does not pick a time or timezone, since that is a consumer decision.
 */
export function fromDate(d: Date): CalendarDate {
	return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
