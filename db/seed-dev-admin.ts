/**
 * DEV-ONLY: provision the app user whose id matches the dev-login bypass
 * (`DEV_ADMIN_USER_ID` in src/lib/server/auth/dev-user.ts), so the
 * profile-bound flows — booking, /myprofile — work locally under the bypass
 * instead of failing the `registrations.user_id → profiles → users` FK.
 *
 * Direct inserts into the app-owned `users` + `profiles` tables (no external
 * auth admin API, no service-role key). Run once (idempotent):
 * `pnpm db:seed-dev-admin` (reads `.env`). NEVER run against production.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { users, profiles } from "./schema";
import { DEV_ADMIN_USER_ID } from "../src/lib/server/auth/dev-user.ts";

async function main(): Promise<void> {
	const url = process.env.DATABASE_URL;
	const email = process.env.DEV_ADMIN_EMAIL;

	if (!url) {
		throw new Error("DATABASE_URL must be set in .env.");
	}
	if (!email) {
		throw new Error(
			"DEV_ADMIN_EMAIL is not set in .env — set it to the dev-login email to provision."
		);
	}

	const normalizedEmail = email.trim().toLowerCase();
	const client = postgres(url, { prepare: false });
	const db = drizzle(client, { schema });

	await db
		.insert(users)
		.values({ id: DEV_ADMIN_USER_ID, email: normalizedEmail, emailVerified: true })
		.onConflictDoNothing();
	await db
		.insert(profiles)
		.values({ id: DEV_ADMIN_USER_ID, displayName: "Dev Admin" })
		.onConflictDoNothing();

	await client.end();

	console.log(`✓ dev-login user ready: ${normalizedEmail} (${DEV_ADMIN_USER_ID})`);
	console.log("  Booking and /myprofile now work under the dev-login bypass.");
}

main()
	.then(() => process.exit(0))
	.catch((err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	});
