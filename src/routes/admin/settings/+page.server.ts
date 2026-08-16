import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth/admin";
import { getR2ConfigStatus, r2Delete, r2ListKeys, r2PublicUrl } from "$lib/server/storage";
import type { Actions, PageServerLoad } from "./$types";

/** Test uploads live under this key prefix so they never mix with real media. */
const TEST_PREFIX = "test/";

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	const config = getR2ConfigStatus();
	let keys: string[] = [];
	if (config.ready) {
		try {
			keys = await r2ListKeys(TEST_PREFIX);
		} catch (err) {
			console.error("admin/settings: failed to list test objects:", err);
		}
	}
	const objects = keys.map((key) => ({
		key,
		url: r2PublicUrl(key),
		ext: key.split(".").pop()?.toLowerCase() ?? ""
	}));
	return { config, objects };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const key = String(form.get("key") ?? "");
		if (!key.startsWith(TEST_PREFIX)) {
			return fail(400, { action: "delete", error: "Key tidak valid." });
		}
		try {
			await r2Delete(key);
		} catch (err) {
			console.error("admin/settings: delete failed:", err);
			return fail(500, { action: "delete", error: "Gagal menghapus file." });
		}
		return { action: "delete", key };
	}
};
