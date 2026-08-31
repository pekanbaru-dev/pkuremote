/**
 * Seed script — populates the app's Postgres with one row per content table
 * so Drizzle Studio and the FE have something to show.
 *
 * Re-running does not duplicate rows: content tables with no natural unique key
 * are TRUNCATEd first, the rest use `onConflictDoNothing` and a deterministic
 * seed user.
 *
 * Prerequisites:
 *   - `.env` is filled in (single `DATABASE_URL`)
 *   - `pnpm db:migrate` has been run
 *
 * Flags:
 *   --events-only  Seed only categories, events, and their join rows. Skips the
 *                  demo author, announcement, and placeholder blog post — use
 *                  this against a real deployment, where that demo content
 *                  would be publicly visible.
 *   --force        Proceed even though registrations exist. See the warning
 *                  below before using it.
 *
 * WARNING: the TRUNCATE cascades to `registrations`. Seeding an environment
 * with real sign-ups destroys them, so the script refuses to run when any
 * registration exists unless `--force` is passed.
 *
 * The seed user is a direct insert into the app-owned `users` table (no
 * external auth admin API, no service-role key).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";
import { CATEGORIES, EVENTS } from "./seed-data";
import {
	users,
	profiles,
	events,
	announcements,
	posts,
	categories,
	eventCategories
} from "./schema";

// `--events-only` seeds just categories/events/join rows: no demo author,
// announcement, or placeholder blog post. Used when seeding a real deployment,
// where that demo content would be publicly visible.
const EVENTS_ONLY = process.argv.includes("--events-only");
// `--force` allows the TRUNCATE below to proceed when registrations exist.
const FORCE = process.argv.includes("--force");

const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
const SEED_USER_EMAIL = "seed-author@pkubersua.local";

async function seedContent(): Promise<void> {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is required for seeding.");
	}

	const client = postgres(url, { prepare: false });
	const db = drizzle(client, { schema });

	if (!EVENTS_ONLY) {
		console.log("  · inserting seed user + profile");
		await db
			.insert(users)
			.values({ id: SEED_USER_ID, email: SEED_USER_EMAIL, emailVerified: true })
			.onConflictDoNothing();
		await db
			.insert(profiles)
			.values({ id: SEED_USER_ID, displayName: "Seed Author", role: "admin" })
			.onConflictDoNothing();
	}

	// The TRUNCATE below cascades to `registrations` (registrations.event_id
	// references events), so re-seeding an environment that has real sign-ups
	// would silently destroy them. Refuse unless explicitly forced.
	const regRows = (await db.execute(
		sql`select count(*)::int as n from registrations`
	)) as unknown as { n: number }[];
	const registrationCount = regRows[0]?.n ?? 0;
	if (registrationCount > 0 && !FORCE) {
		throw new Error(
			`Refusing to seed: ${registrationCount} registration(s) exist, and TRUNCATE … CASCADE ` +
				`would delete them along with the events. Re-run with --force if that is intended.`
		);
	}

	const truncated = EVENTS_ONLY
		? "events, event_categories"
		: "events, announcements, event_categories";
	console.log(`  · truncating ${truncated} (no natural unique key)`);
	if (EVENTS_ONLY) {
		await client`TRUNCATE TABLE events, event_categories RESTART IDENTITY CASCADE`;
	} else {
		await client`TRUNCATE TABLE events, announcements, event_categories RESTART IDENTITY CASCADE`;
	}

	console.log(`  · inserting ${CATEGORIES.length} categories`);
	for (const c of CATEGORIES) {
		await db.insert(categories).values(c).onConflictDoNothing();
	}

	console.log(`  · inserting ${EVENTS.length} events`);
	const insertedEvents: { id: string; slug: string }[] = [];
	for (const e of EVENTS) {
		const [row] = await db
			.insert(events)
			.values({
				slug: e.slug,
				title: e.title,
				startsAt: new Date(e.startsAt),
				endsAt: new Date(e.endsAt),
				location: e.location,
				excerpt: e.excerpt,
				body: e.body,
				bannerUrl: e.bannerUrl,
				status: e.status,
				quota: e.quota,
				remainingSlots: e.remainingSlots,
				priceNormal: e.priceNormal,
				category: e.category
			})
			.returning({ id: events.id, slug: events.slug });
		if (row) insertedEvents.push(row);
	}

	console.log("  · inserting event_categories join rows");
	const categoryRows = await db.select().from(categories);
	const slugToId = new Map(categoryRows.map((c) => [c.slug, c.id]));
	for (const e of EVENTS) {
		const event = insertedEvents.find((x) => x.slug === e.slug);
		if (!event) continue;
		for (const catSlug of e.categorySlugs) {
			const catId = slugToId.get(catSlug);
			if (!catId) continue;
			await db
				.insert(eventCategories)
				.values({ eventId: event.id, categoryId: catId })
				.onConflictDoNothing();
		}
	}

	if (!EVENTS_ONLY) {
		console.log("  · inserting announcement");
		await db.insert(announcements).values({
			title: "Welcome to PKUBersua",
			body: "This is a test announcement inserted by the seed script."
		});
	}

	if (!EVENTS_ONLY) {
		console.log("  · inserting post");
		await db
			.insert(posts)
			.values({
				title: "Hello from the seed script",
				slug: "hello-from-the-seed-script",
				authorId: SEED_USER_ID,
				excerpt:
					"A placeholder post inserted by the seed script so the table has at least one row.",
				body: "## Halo dari Seed Script\n\nIni adalah artikel contoh yang dimasukkan oleh seed script agar tabel `posts` tidak kosong saat development.",
				status: "published",
				publishedAt: new Date(),
				updatedAt: new Date()
			})
			.onConflictDoNothing();
	}

	// Sanity check: confirm rows landed
	const eventCount = await db.execute(sql`select count(*)::int as n from events`);
	const catCount = await db.execute(sql`select count(*)::int as n from categories`);
	const joinCount = await db.execute(sql`select count(*)::int as n from event_categories`);
	console.log(
		`  · seed complete: events=${(eventCount as { n: number }[])[0]?.n ?? "?"}, categories=${(catCount as { n: number }[])[0]?.n ?? "?"}, event_categories=${(joinCount as { n: number }[])[0]?.n ?? "?"}`
	);

	await client.end();
}

async function main(): Promise<void> {
	console.log("Seeding database…");
	await seedContent();
	console.log("Seed complete.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
