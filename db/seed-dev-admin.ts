/**
 * DEV-ONLY: provision a real Supabase auth user whose id matches the dev-login
 * bypass (`DEV_ADMIN_USER_ID` in src/lib/server/auth/dev-user.ts), so the
 * profile-bound flows — booking, /myprofile — work locally under the bypass
 * instead of failing the `registrations.user_id → profiles → auth.users` FK.
 *
 * Because the id matches the synthetic user the bypass injects, no app code
 * changes are needed: the fixed id now resolves to a real auth.users row, and
 * the `on_auth_user_created` trigger auto-provisions the public.profiles row.
 *
 * Run once (idempotent): `pnpm db:seed-dev-admin` (reads `.env`).
 * NEVER run this against a production project.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { DEV_ADMIN_USER_ID } from "../src/lib/server/auth/dev-user.ts";

async function main(): Promise<void> {
	const url = process.env.PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const email = process.env.DEV_ADMIN_EMAIL;

	if (!url || !serviceKey) {
		throw new Error("PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.");
	}
	if (!email) {
		throw new Error(
			"DEV_ADMIN_EMAIL is not set in .env — set it to the dev-login email to provision."
		);
	}

	const supabase = createClient(url, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false }
	});

	const { data, error } = await supabase.auth.admin.createUser({
		id: DEV_ADMIN_USER_ID,
		email,
		email_confirm: true,
		aud: "authenticated",
		user_metadata: { full_name: "Dev Admin" }
	});

	// Idempotent: a repeat run reports the email as already registered.
	if (error && !error.message.includes("already been registered") && error.message !== "{}") {
		throw new Error(`Failed to create dev-login user: ${error.message}`);
	}

	const id = data?.user?.id ?? DEV_ADMIN_USER_ID;
	console.log(`✓ dev-login auth user ready: ${email} (${id})`);
	console.log("  public.profiles row provisioned by the on_auth_user_created trigger.");
	console.log("  Booking and /myprofile now work under the dev-login bypass.");
}

main()
	.then(() => process.exit(0))
	.catch((err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	});
