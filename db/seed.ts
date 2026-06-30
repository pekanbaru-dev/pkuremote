/**
 * Seed script — populates the Supabase project with one row per content table
 * so Drizzle Studio and the (future) FE have something to show.
 *
 * Idempotent: re-running does not error or duplicate rows (uses
 * `onConflictDoNothing` and a deterministic seed user).
 *
 * Prerequisites:
 *   - `.env` is filled in (DATABASE_URL, DIRECT_URL, SUPABASE_SERVICE_ROLE_KEY)
 *   - `pnpm db:migrate` has been run
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { profiles, events, announcements, posts } from "./schema";

const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
const SEED_USER_EMAIL = "seed-author@pkubersua.local";

async function ensureSeedUser(): Promise<void> {
	const url = process.env.PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) {
		throw new Error("PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for seeding.");
	}

	const supabase = createClient(url, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false }
	});

	const { data, error } = await supabase.auth.admin.createUser({
		id: SEED_USER_ID,
		email: SEED_USER_EMAIL,
		email_confirm: true,
		aud: "authenticated"
	});

	if (error && !error.message.includes("already been registered")) {
		throw new Error(`Failed to create seed user: ${error.message}`);
	}

	if (data.user) {
		console.log(`  ✓ seed user ${SEED_USER_EMAIL} (${data.user.id})`);
	} else {
		console.log(`  · seed user ${SEED_USER_EMAIL} already exists`);
	}
}

async function seedContent(): Promise<void> {
	const directUrl = process.env.DIRECT_URL;
	if (!directUrl) {
		throw new Error("DIRECT_URL is required for seeding.");
	}

	const client = postgres(directUrl, { prepare: false });
	const db = drizzle(client, { schema });

	console.log("  · inserting profiles row");
	await db
		.insert(profiles)
		.values({ id: SEED_USER_ID, displayName: "Seed Author" })
		.onConflictDoNothing();

	console.log("  · truncating events, announcements (no natural unique key)");
	await client`TRUNCATE TABLE events, announcements`;

	console.log("  · inserting event");
	await db.insert(events).values({
		title: "Coffee & Code — July Meetup",
		startsAt: new Date("2026-07-11T18:30:00+07:00"),
		location: "Kopi Senja, Jalan Gajah",
		excerpt: "A casual evening of remote-work chatter and a few short lightning talks.",
		body: "Full event description goes here."
	});

	console.log("  · inserting announcement");
	await db.insert(announcements).values({
		title: "Welcome to PKUBersua",
		body: "This is a test announcement inserted by the seed script."
	});

	console.log("  · inserting post");
	await db
		.insert(posts)
		.values({
			title: "Hello from the seed script",
			slug: "hello-from-the-seed-script",
			authorId: SEED_USER_ID,
			excerpt: "A placeholder post inserted by the seed script so the table has at least one row.",
			body: "Full post body goes here."
		})
		.onConflictDoNothing();

	await client.end();
}

async function main(): Promise<void> {
	console.log("Seeding Supabase project…");
	await ensureSeedUser();
	await seedContent();
	console.log("Seed complete.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
