/**
 * Server-only category WRITE services — create/update/delete plus the pure
 * validation helper behind them. Lives under `src/lib/server/`; invoked ONLY
 * from admin-gated `+page.server.ts` actions. Listing reuses the existing
 * `getAllCategories` read in `$lib/server/events`.
 */
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { categories } from "../../../../db/schema";

export type CategoryWriteErrorCode = "SLUG_TAKEN" | "VALIDATION" | "NOT_FOUND";

export class CategoryWriteError extends Error {
	readonly code: CategoryWriteErrorCode;
	readonly field?: string;
	constructor(code: CategoryWriteErrorCode, message: string, field?: string) {
		super(message);
		this.name = "CategoryWriteError";
		this.code = code;
		this.field = field;
	}
}

export type CategoryWriteInput = { name: string; slug: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Validate a category payload. Pure. Throws {@link CategoryWriteError}. */
export function validateCategoryInput(input: CategoryWriteInput): void {
	if (!input.name.trim()) throw new CategoryWriteError("VALIDATION", "Nama wajib diisi.", "name");
	if (!input.slug.trim()) throw new CategoryWriteError("VALIDATION", "Slug wajib diisi.", "slug");
	if (!SLUG_RE.test(input.slug.trim())) {
		throw new CategoryWriteError(
			"VALIDATION",
			"Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
			"slug"
		);
	}
}

/** True when a caught DB error is a Postgres unique-constraint violation. */
function isUniqueViolation(err: unknown): boolean {
	return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

export async function createCategory(input: CategoryWriteInput): Promise<string> {
	validateCategoryInput(input);
	try {
		const [row] = await db
			.insert(categories)
			.values({ name: input.name.trim(), slug: input.slug.trim() })
			.returning({ id: categories.id });
		return row.id;
	} catch (err) {
		if (isUniqueViolation(err)) {
			throw new CategoryWriteError("SLUG_TAKEN", "Nama atau slug ini sudah digunakan.", "slug");
		}
		throw err;
	}
}

export async function updateCategory(id: string, input: CategoryWriteInput): Promise<void> {
	validateCategoryInput(input);
	try {
		const updated = await db
			.update(categories)
			.set({ name: input.name.trim(), slug: input.slug.trim() })
			.where(eq(categories.id, id))
			.returning({ id: categories.id });
		if (updated.length === 0) {
			throw new CategoryWriteError("NOT_FOUND", "Kategori tidak ditemukan.");
		}
	} catch (err) {
		if (isUniqueViolation(err)) {
			throw new CategoryWriteError("SLUG_TAKEN", "Nama atau slug ini sudah digunakan.", "slug");
		}
		throw err;
	}
}

/** Delete a category by id. Its `event_categories` links are removed by the
 *  existing `ON DELETE CASCADE` FK. */
export async function deleteCategory(id: string): Promise<void> {
	await db.delete(categories).where(eq(categories.id, id));
}
