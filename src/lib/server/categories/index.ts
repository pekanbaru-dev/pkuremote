/**
 * Server-only categories service barrel. NOT safe for client-side import —
 * pulls in the Drizzle client. Listing lives in `$lib/server/events`
 * (`getAllCategories`); this module holds the admin write path.
 */
export {
	createCategory,
	updateCategory,
	deleteCategory,
	validateCategoryInput,
	CategoryWriteError,
	type CategoryWriteErrorCode,
	type CategoryWriteInput
} from "./db-categories.ts";
