import { error, json } from "@sveltejs/kit";
import { r2PresignPut, r2PublicUrl } from "$lib/server/storage";
import type { RequestHandler } from "./$types";

const ARTICLES_PREFIX = "articles/";
const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp", "gif", "avif"];
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

function extFor(filename: string): string | null {
	const ext = filename.split(".").pop()?.toLowerCase() ?? "";
	return ALLOWED_EXT.includes(ext) ? ext : null;
}

/**
 * Authenticated endpoint that issues a short-lived presigned PUT URL so an
 * author can upload an article image directly to R2 (bytes never pass through
 * the server). The image is stored under the `articles/` key prefix. Returns
 * the presigned URL plus the resulting public CDN URL.
 *
 * Authentication is guaranteed by GUARDED_PREFIXES in hooks.server.ts (which
 * includes /my-articles); we still guard defensively here.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, "Harus masuk untuk mengunggah gambar.");
	}
	const body = (await request.json().catch(() => null)) as {
		filename?: unknown;
		contentType?: unknown;
	} | null;
	const filename = String(body?.filename ?? "").trim();
	const contentType = String(body?.contentType ?? "").trim();

	const ext = extFor(filename);
	if (!ext) {
		return json({ error: "Format gambar tidak didukung." }, { status: 400 });
	}
	if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
		return json({ error: "Content-Type gambar tidak valid." }, { status: 400 });
	}

	const key = `${ARTICLES_PREFIX}${crypto.randomUUID()}.${ext}`;
	try {
		const presignedUrl = await r2PresignPut(key, contentType);
		return json({ presignedUrl, publicUrl: r2PublicUrl(key), key });
	} catch (err) {
		console.error("my-articles/presign: failed:", err);
		return json({ error: "Gagal membuat presigned URL." }, { status: 500 });
	}
};
