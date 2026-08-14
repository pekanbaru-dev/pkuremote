import { env } from "$env/dynamic/private";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/** Public URL prefix under which stored banners are served (see the
 * `/uploads/[file]` route). Stored `bannerUrl` values look like
 * `/uploads/{uuid}.{ext}`. */
export const UPLOADS_URL_PREFIX = "/uploads";

/** Max accepted banner size (2 MiB). */
export const MAX_BANNER_BYTES = 2 * 1024 * 1024;

/** Allowed image MIME types → canonical file extension. */
const ALLOWED_TYPES: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp"
};

/** Extension → Content-Type for the serving route. */
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

/** The absolute uploads directory, resolved from `UPLOAD_DIR` (dev default
 * `./uploads`). Kept outside the SvelteKit build so runtime writes survive. */
export function resolveUploadDir(): string {
	const configured = env.UPLOAD_DIR?.trim();
	return path.resolve(configured && configured.length > 0 ? configured : "./uploads");
}

/**
 * Validate a banner file's type and size, returning its canonical extension.
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
 * Reduce a stored path/URL (or bare filename) to a safe basename that lives
 * directly under the uploads dir. Returns `null` for anything containing a
 * path separator, `..`, or an absolute path — never letting a caller escape
 * the uploads directory. Pure (no I/O).
 */
export function safeBasename(pathOrUrl: string): string | null {
	// A legitimate stored value is always `/uploads/{uuid}.{ext}` — it never
	// contains `..` or a backslash. Reject those outright, then take the final
	// path segment (which is separator-free by construction).
	if (!pathOrUrl || pathOrUrl.includes("..") || pathOrUrl.includes("\\")) return null;
	const name = pathOrUrl.split("/").pop() ?? "";
	return name.length > 0 ? name : null;
}

/** Content-Type for a stored file name, or a generic binary fallback. */
export function contentTypeFor(name: string): string {
	return CONTENT_TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Validate, store, and return the public path for an event banner image.
 * Server-only; callers MUST have enforced `requireAdmin(locals)` first.
 */
export async function uploadEventBanner(file: File): Promise<string> {
	const ext = validateBannerFile(file);
	const dir = resolveUploadDir();
	await mkdir(dir, { recursive: true });
	const filename = `${randomUUID()}.${ext}`;
	const bytes = new Uint8Array(await file.arrayBuffer());
	await writeFile(path.join(dir, filename), bytes);
	return `${UPLOADS_URL_PREFIX}/${filename}`;
}

/**
 * Best-effort removal of a previously stored banner (used on replace-on-edit).
 * Path-safe: rejects anything that escapes the uploads dir. A failure (e.g.
 * the file is already gone) is logged and swallowed so it never corrupts the
 * caller's already-committed state.
 */
export async function deleteEventBanner(pathOrUrl: string): Promise<void> {
	const name = safeBasename(pathOrUrl);
	if (!name) return;
	const dir = resolveUploadDir();
	const target = path.join(dir, name);
	if (!target.startsWith(dir + path.sep)) return;
	try {
		await unlink(target);
	} catch (err) {
		console.error(`deleteEventBanner: failed to remove ${name}:`, err);
	}
}

/**
 * Read a stored upload for the serving route. Returns the bytes + Content-Type,
 * or `null` when the name is unsafe or the file does not exist (→ 404).
 */
export async function readUpload(
	name: string
): Promise<{ body: Uint8Array; contentType: string } | null> {
	const safe = safeBasename(name);
	if (!safe) return null;
	const dir = resolveUploadDir();
	const target = path.join(dir, safe);
	if (!target.startsWith(dir + path.sep)) return null;
	try {
		const body = new Uint8Array(await readFile(target));
		return { body, contentType: contentTypeFor(safe) };
	} catch {
		return null;
	}
}

/**
 * Validate, store, and return the public path for an article cover image.
 * Same constraints as event banners: PNG/JPEG/WebP, max 2 MiB.
 * Server-only; callers MUST have verified the user is authenticated first.
 */
export async function uploadArticleCover(file: File): Promise<string> {
	const ext = validateBannerFile(file);
	const dir = resolveUploadDir();
	await mkdir(dir, { recursive: true });
	const filename = `${randomUUID()}.${ext}`;
	const bytes = new Uint8Array(await file.arrayBuffer());
	await writeFile(path.join(dir, filename), bytes);
	return `${UPLOADS_URL_PREFIX}/${filename}`;
}

/**
 * Best-effort removal of a previously stored article cover image.
 * Path-safe: rejects anything that escapes the uploads dir. Failures are
 * logged and swallowed so they never corrupt the caller's committed state.
 */
export async function deleteArticleCover(pathOrUrl: string): Promise<void> {
	const name = safeBasename(pathOrUrl);
	if (!name) return;
	const dir = resolveUploadDir();
	const target = path.join(dir, name);
	if (!target.startsWith(dir + path.sep)) return;
	try {
		await unlink(target);
	} catch (err) {
		console.error(`deleteArticleCover: failed to remove ${name}:`, err);
	}
}
