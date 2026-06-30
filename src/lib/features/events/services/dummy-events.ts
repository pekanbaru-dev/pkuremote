import type { Event } from "../types.ts";

/**
 * Dummy event data — exactly three events matching the Stitch HTML at
 * `tmp/index.html`'s "Upcoming Community Gatherings" section (lines 188–249).
 * The Stitch design has no past-events listing on the homepage, so this file
 * is intentionally reduced to three events. A future change can re-add the
 * past events (UI Typography, Svelte 5 Runes, Ngobrol Santai, Malam Membaca,
 * Ngoprek ESP32, Intro to Data Engineering) as a separate `/events/archive`
 * route.
 *
 * All `startsAt` values are ISO-8601 strings. The `getUpcomingEvents()`
 * service returns only events whose `startsAt` is in the future; the dates
 * below are picked to be in the past relative to the runtime clock so the
 * homepage will be empty until the operator updates them.
 */
const EVENTS: Event[] = [
	{
		id: "evt-001",
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
		status: "upcoming",
		quota: 30,
		remainingSlots: 12,
		priceNormal: 25000,
		category: "workshop",
		categoryLabel: "Culinary",
		categorySecondary: "Workshop"
	},
	{
		id: "evt-002",
		slug: "riau-heritage-night",
		title: "Riau Heritage Night",
		startsAt: "2026-11-02T19:00:00+07:00",
		endsAt: "2024-11-02T22:00:00+07:00",
		location: "Taman Budaya Riau, Pekanbaru",
		excerpt:
			"A celebration of Zapin dance, traditional music, and storytelling under the moonlight.",
		body: "Malam budaya dengan tiga penampil: Zapin Melayu, gambus, dan storytelling tentang legenda Bukit Suharto. Setiap segmen 30 menit, diselingi workshop singkat untuk anak-anak. \n\nPintu dibuka pukul 19:00. Snack dan teh gratis. Tidak perlu registrasi untuk penonton umum, tapi peserta workshop perlu daftar karena kuota terbatas.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGP3k-BPnJNzGuJhv0C1w9NZjsyE0lH0QgRec6C5v9rmtfay4zNN34qKVGpngtIek3jFTOgRCx6Qlny5EUsKb82TUhAXGMrcmldBba95J27muA8YV23-LXRf0eyf4J4NF6FUt4fhjyC1d1nB47NECSUKpaMaM0PYnjm-1ziU-4VxGBfIultucN7v3T8uWpRz9gjh3_8mM4Rx68KHtSG_WAJRQldJRNwaiUmkByon5FIbzWK5DNzLypf0guEvXt5jdyUNZJgfZEpV-s",
		status: "upcoming",
		quota: 60,
		remainingSlots: 24,
		priceNormal: undefined,
		category: "meetup",
		categoryLabel: "Culture",
		categorySecondary: "Festival"
	},
	{
		id: "evt-003",
		slug: "local-business-mixer",
		title: "Local Business Mixer",
		startsAt: "2026-11-15T18:00:00+07:00",
		endsAt: "2026-11-15T20:30:00+07:00",
		location: "Co-working space Hive, Pekanbaru",
		excerpt: "Connect with entrepreneurs and creators driving the modern economy of Pekanbaru.",
		body: "Networking event untuk 50 pebisnis lokal: 5 menit lightning pitch dari 8 founder, 30 menit open networking dengan kartu nama bertema Riau, dan 30 menit Q&A panel tentang 'Membangun brand lokal di era digital'. \n\nTermasuk: appetizer, 2 drink voucher, dan direktori peserta digital.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBC20E2R0F_20RxEXLT12_jAOPuLd50_xVz5WogGhyYT4BoXyGEnRvTi9eQ7C_248zO-5lLLUPv-XRGGOUgSz1VEtqvpiPFE9UknDl4G3HJzSlft4etC_rMw7CCOxHxuGd3QJzizE3OxhyKMzd-p1mtxVmXMHTARBbbqIqNyr-7uItEuKKvEdsmBpA97cEIZU_YOXVTct8zY-U6Egsv1_DKyaT9M7n9DajZPaeX66IZOFaU_F34XhH7_u6Avm4D4K92C9ptnXa_IE-B",
		status: "upcoming",
		quota: 50,
		remainingSlots: 17,
		priceNormal: 15000,
		category: "meetup",
		categoryLabel: "Business",
		categorySecondary: "Networking"
	}
];

/**
 * Return all events whose `startsAt` is in the future, sorted ascending
 * (soonest first).
 */
export function getUpcomingEvents(): Event[] {
	const now = Date.now();
	return EVENTS.filter((e) => new Date(e.startsAt).getTime() >= now).sort(
		(a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
	);
}

/**
 * Return all events whose `startsAt` is in the past, sorted descending
 * (most recent first).
 */
export function getPastEvents(): Event[] {
	const now = Date.now();
	return EVENTS.filter((e) => new Date(e.startsAt).getTime() < now).sort(
		(a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
	);
}

/**
 * Look up a single event by its slug. Returns `undefined` when not found;
 * the route's `+page.server.ts` translates that to a 404.
 */
export function getEventBySlug(slug: string): Event | undefined {
	return EVENTS.find((e) => e.slug === slug);
}
