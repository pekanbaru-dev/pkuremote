import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { cafes, type CafeRow, type NewCafeRow } from "../../../../db/schema";
import { isWfcCategory, type WfcCategory } from "../../features/wfc/category.js";
import type { Cafe } from "../../features/wfc/types.ts";

function toCafe(row: CafeRow): Cafe {
	return {
		...row,
		wfcCategory: row.wfcCategory as WfcCategory,
		imageUrl: row.imageUrl ?? null,
		tags: row.tags ?? [],
		bestHours: row.bestHours ?? [],
		amenities: row.amenities ?? [],
		policies: row.policies ?? [],
		reviews: row.reviews ?? [],
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString()
	};
}

export async function getPublishedCafes(): Promise<Cafe[]> {
	const rows = await db
		.select()
		.from(cafes)
		.where(eq(cafes.published, true))
		.orderBy(desc(cafes.score));
	return rows.map(toCafe);
}

export type CafeSearchResult = {
	items: Cafe[];
	total: number;
	page: number;
	pageSize: number;
};

export async function searchPublishedCafes(
	query: string,
	category: WfcCategory | "" = "",
	page = 1,
	pageSize = 3
): Promise<CafeSearchResult> {
	const normalizedPage = Math.max(1, Math.floor(page));
	const normalizedSize = Math.min(24, Math.max(1, Math.floor(pageSize)));
	const keyword = query.trim();
	const tagFilter = sql`${cafes.tags} @> ${JSON.stringify(["Nongkrong"])}::jsonb`;
	const categoryFilter = isWfcCategory(category) ? eq(cafes.wfcCategory, category) : undefined;
	const keywordFilter = keyword
		? or(
				ilike(cafes.name, `%${keyword}%`),
				ilike(cafes.tagline, `%${keyword}%`),
				ilike(cafes.fit, `%${keyword}%`),
				ilike(cafes.address, `%${keyword}%`),
				sql`${cafes.tags}::text ILIKE ${`%${keyword}%`}`
			)
		: undefined;
	const baseWhere = categoryFilter
		? and(eq(cafes.published, true), tagFilter, categoryFilter)
		: and(eq(cafes.published, true), tagFilter);
	const where = keywordFilter ? and(baseWhere, keywordFilter) : baseWhere;
	const [rows, [{ total }]] = await Promise.all([
		db
			.select()
			.from(cafes)
			.where(where)
			.orderBy(desc(cafes.score), asc(cafes.name))
			.limit(normalizedSize)
			.offset((normalizedPage - 1) * normalizedSize),
		db.select({ total: count() }).from(cafes).where(where)
	]);
	return { items: rows.map(toCafe), total, page: normalizedPage, pageSize: normalizedSize };
}
export async function getAllCafes(): Promise<Cafe[]> {
	const rows = await db.select().from(cafes).orderBy(asc(cafes.name));
	return rows.map(toCafe);
}

export async function getCafeById(id: string): Promise<Cafe | undefined> {
	const [row] = await db.select().from(cafes).where(eq(cafes.id, id)).limit(1);
	return row ? toCafe(row) : undefined;
}

export async function getCafeBySlug(slug: string, publishedOnly = true): Promise<Cafe | undefined> {
	const [row] = await db.select().from(cafes).where(eq(cafes.slug, slug)).limit(1);
	if (!row || (publishedOnly && !row.published)) return undefined;
	return toCafe(row);
}

export type CafeWriteInput = Required<Omit<NewCafeRow, "id" | "createdAt" | "updatedAt">>;

export class CafeWriteError extends Error {
	readonly field?: string;
	constructor(message: string, field?: string) {
		super(message);
		this.name = "CafeWriteError";
		this.field = field;
	}
}

export async function createCafe(input: CafeWriteInput): Promise<string> {
	validateCafeInput(input);
	try {
		const [row] = await db.insert(cafes).values(input).returning({ id: cafes.id });
		return row.id;
	} catch (error) {
		if (isUniqueViolation(error)) throw new CafeWriteError("Slug ini sudah digunakan.", "slug");
		throw error;
	}
}

export async function updateCafe(id: string, input: CafeWriteInput): Promise<void> {
	validateCafeInput(input);
	try {
		const result = await db
			.update(cafes)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(cafes.id, id))
			.returning({ id: cafes.id });
		if (result.length === 0) throw new CafeWriteError("Kafe tidak ditemukan.");
	} catch (error) {
		if (isUniqueViolation(error)) throw new CafeWriteError("Slug ini sudah digunakan.", "slug");
		throw error;
	}
}

export async function deleteCafe(id: string): Promise<void> {
	await db.delete(cafes).where(eq(cafes.id, id));
}

export function parseCafeFormData(formData: FormData): {
	input: CafeWriteInput;
	values: Record<string, string>;
} {
	const text = (name: string) => String(formData.get(name) ?? "").trim();
	const lines = (name: string) =>
		text(name)
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean);
	const pairs = (name: string): [string, string][] =>
		lines(name).map((line) => {
			const parts = line.split("|").map((part) => part.trim());
			if (parts.length !== 2 || parts.some((part) => !part)) {
				throw new CafeWriteError(
					`${name}: gunakan satu item per baris dengan format "label | nilai".`,
					name
				);
			}
			return [parts[0], parts[1]];
		});
	const policies = (): [string, string, "ok" | "warn"][] =>
		lines("policies").map((line) => {
			const parts = line.split("|").map((part) => part.trim());
			if (parts.length !== 3 || parts.some((part) => !part) || !["ok", "warn"].includes(parts[2])) {
				throw new CafeWriteError(
					'policies: gunakan format "label | nilai | ok" atau "label | nilai | warn".',
					"policies"
				);
			}
			return [parts[0], parts[1], parts[2] as "ok" | "warn"];
		});
	const reviews = (): [string, string, string][] =>
		lines("reviews").map((line) => {
			const parts = line.split("|").map((part) => part.trim());
			if (parts.length !== 3 || parts.some((part) => !part)) {
				throw new CafeWriteError('reviews: gunakan format "nama | kutipan | peran".', "reviews");
			}
			return [parts[0], parts[1], parts[2]];
		});
	const input: CafeWriteInput = {
		slug: text("slug"),
		name: text("name"),
		score: Number(text("score")),
		occupancy: text("occupancy"),
		distance: text("distance"),
		price: text("price"),
		closing: text("closing"),
		fit: text("fit"),
		wfcCategory: text("wfcCategory") as WfcCategory,
		imageUrl: text("imageUrl") || null,
		address: text("address"),
		latitude: Number(text("latitude")),
		longitude: Number(text("longitude")),
		wifi: text("wifi"),
		outlets: text("outlets"),
		atmosphere: text("atmosphere"),
		duration: text("duration"),
		tagline: text("tagline"),
		liveStatus: text("liveStatus"),
		liveNote: text("liveNote"),
		tags: lines("tags"),
		bestHours: pairs("bestHours"),
		amenities: pairs("amenities"),
		policies: policies(),
		reviews: reviews(),
		published: formData.get("published") === "on"
	};
	return { input, values: Object.fromEntries(formData.entries()) as Record<string, string> };
}

function validateCafeInput(input: CafeWriteInput): void {
	if (!input.name) throw new CafeWriteError("Nama kafe wajib diisi.", "name");
	if (!isWfcCategory(input.wfcCategory)) {
		throw new CafeWriteError("Pilih salah satu kategori WFC.", "wfcCategory");
	}
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
		throw new CafeWriteError("Slug hanya boleh huruf kecil, angka, dan tanda hubung.", "slug");
	}
	if (!Number.isInteger(input.score) || input.score < 0 || input.score > 100) {
		throw new CafeWriteError("Skor harus berupa angka 0 sampai 100.", "score");
	}
	if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
		throw new CafeWriteError("Koordinat harus berupa angka.", "latitude");
	}
	for (const field of [
		"occupancy",
		"distance",
		"price",
		"closing",
		"fit",
		"address",
		"wifi",
		"outlets",
		"atmosphere",
		"duration",
		"tagline",
		"liveStatus",
		"liveNote"
	] as const) {
		if (!input[field]) throw new CafeWriteError("Field ini wajib diisi.", field);
	}
	if (
		!Array.isArray(input.tags) ||
		!Array.isArray(input.bestHours) ||
		!Array.isArray(input.amenities) ||
		!Array.isArray(input.policies) ||
		!Array.isArray(input.reviews)
	) {
		throw new CafeWriteError("Data detail kafe harus berupa array.");
	}
}

function isUniqueViolation(error: unknown): boolean {
	return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
