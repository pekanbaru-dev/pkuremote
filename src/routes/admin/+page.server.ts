import { getDashboardMetrics } from "$lib/server/dashboard";
import { requireAdmin } from "$lib/server/auth/admin";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	return { metrics: await getDashboardMetrics() };
};
