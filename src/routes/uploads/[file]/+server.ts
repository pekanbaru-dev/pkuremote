import { error } from "@sveltejs/kit";
import { readUpload } from "$lib/server/storage";
import type { RequestHandler } from "./$types";

/**
 * Serve a stored upload from `UPLOAD_DIR`. Path-safety and existence are
 * handled by `readUpload`, which returns `null` for an unsafe name or a
 * missing file → 404. UUID filenames are content-stable, so responses are
 * marked immutable and cached for a year. Works identically in `pnpm dev`
 * and the adapter-node production server.
 */
export const GET: RequestHandler = async ({ params }) => {
	const result = await readUpload(params.file);
	if (!result) {
		error(404, "Not found");
	}
	return new Response(result.body as BodyInit, {
		headers: {
			"Content-Type": result.contentType,
			"Cache-Control": "public, max-age=31536000, immutable"
		}
	});
};
