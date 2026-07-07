/**
 * Seed script — populates the app's Postgres with one row per content table
 * so Drizzle Studio and the FE have something to show.
 *
 * Idempotent: re-running does not error or duplicate rows (uses
 * `onConflictDoNothing` and a deterministic seed user).
 *
 * Prerequisites:
 *   - `.env` is filled in (single `DATABASE_URL`)
 *   - `pnpm db:migrate` has been run
 *
 * The seed user is a direct insert into the app-owned `users` table (no
 * external auth admin API, no service-role key).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";
import {
	users,
	profiles,
	events,
	announcements,
	posts,
	categories,
	eventCategories
} from "./schema";

const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
const SEED_USER_EMAIL = "seed-author@pkubersua.local";

const CATEGORIES: { name: string; slug: string }[] = [
	{ name: "Workshop", slug: "workshop" },
	{ name: "Hands-on", slug: "hands-on" },
	{ name: "Culture", slug: "culture" },
	{ name: "Festival", slug: "festival" },
	{ name: "Business", slug: "business" },
	{ name: "Networking", slug: "networking" }
];

const EVENTS: {
	slug: string;
	title: string;
	startsAt: string;
	endsAt: string;
	location: string;
	excerpt: string;
	body: string;
	bannerUrl: string;
	quota: number;
	remainingSlots: number;
	priceNormal: number | null;
	category: "workshop" | "talk" | "meetup" | "social" | "other";
	categorySlugs: string[];
}[] = [
	{
		slug: "traditional-talam-masterclass",
		title: "Traditional Talam Masterclass",
		startsAt: "2026-10-24T19:00:00+07:00",
		endsAt: "2026-10-24T21:00:00+07:00",
		location: "Kopi Tiam, Jl. Hang Tuah, Pekanbaru",
		excerpt:
			"Learn the secrets of crafting the perfect layered durian cake from local culinary masters.",
		body: "Workshop 2 jam dengan tiga chef lokal. Kita akan bedah tiga varian kue tradisional Pekanbaru — Talam Durian, Bolu Kemojo, dan Kue Bangkit — dari teknik mencampur adonan, mengukus dengan api kecil, sampai plating modern. Setiap peserta membawa pulang satu set lengkap kue yang sudah dimasak. \n\nTermasuk: bahan, apron, dan notes digital. Peserta diharapkan datang 15 menit lebih awal untuk registrasi.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDUoNiIe9HhntGTFesHtJDseicn_N6aDhToMbKjrPbu4GG2CWGz8yte_3r3LjExbara-8vF1PFmc_tx6KlNTYrIFpARUK6SpVtSjdqwJYBuuPsKAAzmN3tztchNRV9xU30W0SJFdwCqSOQ0PmnOncyDlc1tfmBwPTp9RW9CdAnwInxC8FSmNxgd4IF1bwmYXwMvyfhcYJwVbbflMe3FWnRkUR0IONsYMzs1Z-mED8VzXi5futJ04YoGV2Aidg30w7bMk_eOIdfc_BmK",
		quota: 30,
		remainingSlots: 12,
		priceNormal: null,
		category: "workshop",
		categorySlugs: ["workshop", "hands-on"]
	},
	{
		slug: "riau-heritage-night",
		title: "Riau Heritage Night",
		startsAt: "2026-11-02T19:00:00+07:00",
		endsAt: "2026-11-02T22:00:00+07:00",
		location: "Taman Budaya Riau, Pekanbaru",
		excerpt:
			"A celebration of Zapin dance, traditional music, and storytelling under the moonlight.",
		body: "Malam budaya dengan tiga penampil: Zapin Melayu, gambus, dan storytelling tentang legenda Bukit Suharto. Setiap segmen 30 menit, diselingi workshop singkat untuk anak-anak. \n\nPintu dibuka pukul 19:00. Snack dan teh gratis. Tidak perlu registrasi untuk penonton umum, tapi peserta workshop perlu daftar karena kuota terbatas.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGP3k-BPnJNzGuJhv0C1w9NZjsyE0lH0QgRec6C5v9rmtfay4zNN34qKVGpngtIek3jFTOgRCx6Qlny5EUsKb82TUhAXGMrcmldBba95J27muA8YV23-LXRf0eyf4J4NF6FUt4fhjyC1d1nB47NECSUKpaMaM0PYnjm-1ziU-4VxGBfIultucN7v3T8uWpRz9gjh3_8mM4Rx68KHtSG_WAJRQldJRNwaiUmkByon5FIbzWK5DNzLypf0guEvXt5jdyUNZJgfZEpV-s",
		quota: 60,
		remainingSlots: 24,
		priceNormal: null,
		category: "meetup",
		categorySlugs: ["culture", "festival"]
	},
	{
		slug: "local-business-mixer",
		title: "Local Business Mixer",
		startsAt: "2026-11-15T18:00:00+07:00",
		endsAt: "2026-11-15T20:30:00+07:00",
		location: "Co-working space Hive, Pekanbaru",
		excerpt: "Connect with entrepreneurs and creators driving the modern economy of Pekanbaru.",
		body: "Networking event untuk 50 pebisnis lokal: 5 menit lightning pitch dari 8 founder, 30 menit open networking dengan kartu nama bertema Riau, dan 30 menit Q&A panel tentang 'Membangun brand lokal di era digital'. \n\nTermasuk: appetizer, 2 drink voucher, dan direktori peserta digital.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBC20E2R0F_20RxEXLT12_jAOPuLd50_xVz5WogGhyYT4BoXyGEnRvTi9eQ7C_248zO-5lLLUPv-XRGGOUgSz1VEtqvpiPFE9UknDl4G3HJzSlft4etC_rMw7CCOxHxuGd3QJzizE3OxhyKMzd-p1mtxVmXMHTARBbbqIqNyr-7uItEuKKvEdsmBpA97cEIZU_YOXVTct8zY-U6Egsv1_DKyaT9M7n9DajZPaeX66IZOFaU_F34XhH7_u6Avm4D4K92C9ptnXa_IE-B",
		quota: 50,
		remainingSlots: 17,
		priceNormal: null,
		category: "meetup",
		categorySlugs: ["business", "networking"]
	}
];

async function seedContent(): Promise<void> {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is required for seeding.");
	}

	const client = postgres(url, { prepare: false });
	const db = drizzle(client, { schema });

	console.log("  · inserting seed user + profile");
	await db
		.insert(users)
		.values({ id: SEED_USER_ID, email: SEED_USER_EMAIL, emailVerified: true })
		.onConflictDoNothing();
	await db
		.insert(profiles)
		.values({ id: SEED_USER_ID, displayName: "Seed Author" })
		.onConflictDoNothing();

	console.log("  · truncating events, announcements, event_categories (no natural unique key)");
	await client`TRUNCATE TABLE events, announcements, event_categories RESTART IDENTITY CASCADE`;

	console.log("  · inserting 6 categories");
	for (const c of CATEGORIES) {
		await db.insert(categories).values(c).onConflictDoNothing();
	}

	console.log("  · inserting 3 events");
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
				status: "upcoming",
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
