import { randomUUID } from "node:crypto";
import { r2Delete, r2KeyFromUrl, r2PublicUrl, r2Put } from "./r2.js";

export { getR2ConfigStatus, r2Delete, r2ListKeys, r2PresignPut, r2PublicUrl } from "./r2.js";

/** Max accepted banner/cover size (2 MiB). */
export const MAX_BANNER_BYTES = 2 * 1024 * 1024;

/** Allowed image MIME types → canonical file extension. */
const ALLOWED_TYPES: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp"
};

/** Extension → Content-Type (used by callers that need to resolve content type by name). */
const CONTENT_TYPES: Record<string, string> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp"
};

export type MediaUploadErrorCode = "INVALID_TYPE" | "FILE_TOO_LARGE" | "EMPTY_FILE";

export class MediaUploadError extends Error {
	code: MediaUploadErrorCode;
	constructor(code: MediaUploadErrorCode, message: string) {
		super(message);
		this.name = "MediaUploadError";
		this.code = code;
	}
}

/**
 * Validate a banner/cover file's type and size, returning its canonical extension.
 * Throws a typed {@link MediaUploadError} on invalid input. Pure (no I/O).
 */
export function validateBannerFile(file: { type: string; size: number }): string {
	if (!file.size) {
		throw new MediaUploadError("EMPTY_FILE", "Berkas kosong.");
	}
	const ext = ALLOWED_TYPES[file.type];
	if (!ext) {
		throw new MediaUploadError(
			"INVALID_TYPE",
			"Format tidak didukung. Gunakan PNG, JPEG, atau WebP."
		);
	}
	if (file.size > MAX_BANNER_BYTES) {
		throw new MediaUploadError("FILE_TOO_LARGE", "Ukuran berkas melebihi 2 MB.");
	}
	return ext;
}

/**
 * Reduce a stored URL or bare filename to a safe basename (no path separators,
 * no `..`). Returns `null` for anything containing `..`, `\`, or an empty string.
 * Pure (no I/O). Still used by callers that store bare filenames.
 */
export function safeBasename(pathOrUrl: string): string | null {
	if (!pathOrUrl || pathOrUrl.includes("..") || pathOrUrl.includes("\\")) return null;
	const name = pathOrUrl.split("/").pop() ?? "";
	return name.length > 0 ? name : null;
}

/** Content-Type for a filename by extension, or a generic binary fallback. */
export function contentTypeFor(name: string): string {
	const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
	return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

/**
 * Validate, upload to R2, and return the public CDN URL for an event banner image.
 * Key: `banners/events/{uuid}.{ext}`
 * Server-only; callers MUST have enforced `requireAdmin(locals)` first.
 */
export async function uploadEventBanner(file: File): Promise<string> {
	const ext = validateBannerFile(file);
	const key = `banners/events/${randomUUID()}.${ext}`;
	const bytes = new Uint8Array(await file.arrayBuffer());
	await r2Put(key, bytes, file.type);
	return r2PublicUrl(key);
}

/**
 * Best-effort removal of a previously stored event banner from R2.
 * Accepts either a full CDN URL or a bare R2 key. Failures are logged and
 * swallowed so they never corrupt the caller's already-committed state.
 */
export async function deleteEventBanner(urlOrKey: string): Promise<void> {
	const key = r2KeyFromUrl(urlOrKey) ?? urlOrKey;
	if (!key) return;
	await r2Delete(key);
}

/**
 * Validate, upload to R2, and return the public CDN URL for an article cover image.
 * Key: `banners/articles/{uuid}.{ext}`
 * Server-only; callers MUST have verified the user is authenticated first.
 */
export async function uploadArticleCover(file: File): Promise<string> {
	const ext = validateBannerFile(file);
	const key = `banners/articles/${randomUUID()}.${ext}`;
	const bytes = new Uint8Array(await file.arrayBuffer());
	await r2Put(key, bytes, file.type);
	return r2PublicUrl(key);
}

/**
 * Best-effort removal of a previously stored article cover image from R2.
 * Accepts either a full CDN URL or a bare R2 key. Failures are logged and
 * swallowed so they never corrupt the caller's already-committed state.
 */
export async function deleteArticleCover(urlOrKey: string): Promise<void> {
	const key = r2KeyFromUrl(urlOrKey) ?? urlOrKey;
	if (!key) return;
	await r2Delete(key);
}
