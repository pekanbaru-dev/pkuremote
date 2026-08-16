import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth/admin";
import { r2PresignPut, r2PublicUrl } from "$lib/server/storage";
import type { RequestHandler } from "./$types";

const TEST_PREFIX = "test/";
const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp", "gif"];

function extFor(filename: string): string | null {
	const ext = filename.split(".").pop()?.toLowerCase() ?? "";
	return ALLOWED_EXT.includes(ext) ? ext : null;
}

/**
 * Admin-gated endpoint that issues a short-lived presigned PUT URL so the
 * browser can upload a test file directly to R2 (bytes never pass through
 * the server). Returns the presigned URL plus the resulting public CDN URL.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	requireAdmin(locals);
	const body = (await request.json().catch(() => null)) as {
		filename?: unknown;
		contentType?: unknown;
	} | null;
	const filename = String(body?.filename ?? "").trim();
	const contentType = String(body?.contentType ?? "").trim();

	const ext = extFor(filename);
	if (!ext) {
		return json({ error: "Ekstensi file tidak didukung." }, { status: 400 });
	}
	if (!contentType) {
		return json({ error: "Content-Type tidak diberikan." }, { status: 400 });
	}

	const key = `${TEST_PREFIX}${crypto.randomUUID()}.${ext}`;
	try {
		const presignedUrl = await r2PresignPut(key, contentType);
		return json({ presignedUrl, publicUrl: r2PublicUrl(key), key });
	} catch (err) {
		console.error("admin/settings/presign: failed:", err);
		return json({ error: "Gagal membuat presigned URL." }, { status: 500 });
	}
};
