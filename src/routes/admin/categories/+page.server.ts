import { fail, redirect } from "@sveltejs/kit";
import { getAllCategories } from "$lib/server/events";
import {
	createCategory,
	updateCategory,
	deleteCategory,
	CategoryWriteError
} from "$lib/server/categories";
import { requireAdmin } from "$lib/server/auth/admin";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return { categories: await getAllCategories() };
};

function readCategoryInput(form: FormData) {
	return {
		name: String(form.get("name") ?? "").trim(),
		slug: String(form.get("slug") ?? "").trim()
	};
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const input = readCategoryInput(form);
		try {
			await createCategory(input);
		} catch (err) {
			if (err instanceof CategoryWriteError) {
				return fail(400, {
					action: "create",
					message: err.message,
					field: err.field ?? null,
					name: input.name,
					slug: input.slug
				});
			}
			throw err;
		}
		redirect(303, "/admin/categories");
	},

	update: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get("id") ?? "");
		const input = readCategoryInput(form);
		if (!id) return fail(400, { action: "update", message: "ID kategori tidak valid." });
		try {
			await updateCategory(id, input);
		} catch (err) {
			if (err instanceof CategoryWriteError) {
				return fail(400, {
					action: "update",
					id,
					message: err.message,
					field: err.field ?? null,
					name: input.name,
					slug: input.slug
				});
			}
			throw err;
		}
		redirect(303, "/admin/categories");
	},

	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get("id") ?? "");
		if (!id) return fail(400, { action: "delete", message: "ID kategori tidak valid." });
		await deleteCategory(id);
		return { deleted: true };
	}
};
