/**
 * Seed content — the demo categories and events used by `db/seed.ts`.
 *
 * Extracted from the seed script so the same data can be reused (e.g. to emit
 * SQL for an environment where running `tsx` is not practical) without
 * importing a module that connects to a database on import.
 *
 * `status` drives the public listings: `getUpcomingEvents()` and
 * `getPastEvents()` filter on `events.status`, NOT on `startsAt`, so a past
 * event needs `status: "past"` to show up in the right place regardless of its
 * date. Banner URLs are intentionally reused across events — replace them with
 * real photographs via the admin UI.
 */

export const CATEGORIES: { name: string; slug: string }[] = [
	{ name: "Workshop", slug: "workshop" },
	{ name: "Hands-on", slug: "hands-on" },
	{ name: "Culture", slug: "culture" },
	{ name: "Festival", slug: "festival" },
	{ name: "Business", slug: "business" },
	{ name: "Networking", slug: "networking" }
];

export const EVENTS: {
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
	status: "upcoming" | "live" | "past";
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
		status: "upcoming",
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
		status: "upcoming",
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
		status: "upcoming",
		categorySlugs: ["business", "networking"]
	},
	{
		slug: "riau-tech-founders-meetup",
		title: "Riau Tech Founders Meetup",
		startsAt: "2026-09-12T18:30:00+07:00",
		endsAt: "2026-09-12T21:00:00+07:00",
		location: "Ruang Kolaborasi, Jl. Sudirman, Pekanbaru",
		excerpt:
			"Founders and builders from across Riau swap notes on shipping products from outside Jakarta.",
		body: "Sesi santai untuk founder, developer, dan product people di Riau. Format lightning talk 10 menit dari tiga founder lokal, lanjut open floor dan networking.\n\nBawa laptop kalau mau demo produk. Tidak ada pitch deck, tidak ada investor — murni sharing teknis dan cerita jatuh-bangun membangun produk dari Pekanbaru.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDUoNiIe9HhntGTFesHtJDseicn_N6aDhToMbKjrPbu4GG2CWGz8yte_3r3LjExbara-8vF1PFmc_tx6KlNTYrIFpARUK6SpVtSjdqwJYBuuPsKAAzmN3tztchNRV9xU30W0SJFdwCqSOQ0PmnOncyDlc1tfmBwPTp9RW9CdAnwInxC8FSmNxgd4IF1bwmYXwMvyfhcYJwVbbflMe3FWnRkUR0IONsYMzs1Z-mED8VzXi5futJ04YoGV2Aidg30w7bMk_eOIdfc_BmK",
		quota: 60,
		remainingSlots: 41,
		priceNormal: null,
		category: "meetup",
		status: "upcoming",
		categorySlugs: ["business", "networking"]
	},
	{
		slug: "bahasa-melayu-storytelling-workshop",
		title: "Bahasa Melayu Storytelling Workshop",
		startsAt: "2026-09-20T09:00:00+07:00",
		endsAt: "2026-09-20T12:30:00+07:00",
		location: "Perpustakaan Soeman HS, Pekanbaru",
		excerpt: "Reclaim the cadence of Melayu oral storytelling with writers who still practise it.",
		body: "Workshop menulis dan bertutur bersama dua penulis Riau. Kita bedah struktur pantun, gurindam, dan cerita rakyat Melayu — lalu praktik langsung menyusun cerita pendek dengan diksi Melayu.\n\nCocok untuk penulis, guru, dan siapa pun yang ingin menulis dengan rasa lokal. Peserta membawa pulang satu draf cerita yang sudah dikomentari mentor.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGP3k-BPnJNzGuJhv0C1w9NZjsyE0lH0QgRec6C5v9rmtfay4zNN34qKVGpngtIek3jFTOgRCx6Qlny5EUsKb82TUhAXGMrcmldBba95J27muA8YV23-LXRf0eyf4J4NF6FUt4fhjyC1d1nB47NECSUKpaMaM0PYnjm-1ziU-4VxGBfIultucN7v3T8uWpRz9gjh3_8mM4Rx68KHtSG_WAJRQldJRNwaiUmkByon5FIbzWK5DNzLypf0guEvXt5jdyUNZJgfZEpV-s",
		quota: 25,
		remainingSlots: 9,
		priceNormal: 75000,
		category: "workshop",
		status: "upcoming",
		categorySlugs: ["workshop", "culture"]
	},
	{
		slug: "pekanbaru-street-food-crawl",
		title: "Pekanbaru Street Food Crawl",
		startsAt: "2026-10-04T17:00:00+07:00",
		endsAt: "2026-10-04T21:00:00+07:00",
		location: "Titik kumpul: Pasar Bawah, Pekanbaru",
		excerpt: "Six stalls, one evening, and the people who have cooked at them for decades.",
		body: "Jalan kaki menyusuri enam warung dan gerobak legendaris di sekitar Pasar Bawah dan Jl. Ahmad Yani. Setiap perhentian kita ngobrol langsung dengan pemiliknya soal resep dan sejarahnya.\n\nHarga sudah termasuk semua porsi makanan di enam titik. Jarak tempuh sekitar 2 km, santai, banyak berhenti. Datang dengan perut kosong.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBC20E2R0F_20RxEXLT12_jAOPuLd50_xVz5WogGhyYT4BoXyGEnRvTi9eQ7C_248zO-5lLLUPv-XRGGOUgSz1VEtqvpiPFE9UknDl4G3HJzSlft4etC_rMw7CCOxHxuGd3QJzizE3OxhyKMzd-p1mtxVmXMHTARBbbqIqNyr-7uItEuKKvEdsmBpA97cEIZU_YOXVTct8zY-U6Egsv1_DKyaT9M7n9DajZPaeX66IZOFaU_F34XhH7_u6Avm4D4K92C9ptnXa_IE-B",
		quota: 20,
		remainingSlots: 6,
		priceNormal: 120000,
		category: "social",
		status: "upcoming",
		categorySlugs: ["culture", "festival"]
	},
	{
		slug: "songket-weaving-intensive",
		title: "Songket Weaving Intensive",
		startsAt: "2026-10-18T09:00:00+07:00",
		endsAt: "2026-10-18T16:00:00+07:00",
		location: "Sanggar Tenun Kampung Bandar, Pekanbaru",
		excerpt: "A full day at the loom with weavers who learned the craft from their grandmothers.",
		body: "Kelas sehari penuh di sanggar tenun. Pagi: mengenal motif songket Riau, jenis benang, dan cara membaca pola. Siang sampai sore: praktik menenun di alat tenun bukan mesin (ATBM) dengan pendampingan satu-satu.\n\nSetiap peserta membawa pulang lembar tenunan sendiri. Termasuk makan siang dan bahan. Tidak perlu pengalaman sebelumnya.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDUoNiIe9HhntGTFesHtJDseicn_N6aDhToMbKjrPbu4GG2CWGz8yte_3r3LjExbara-8vF1PFmc_tx6KlNTYrIFpARUK6SpVtSjdqwJYBuuPsKAAzmN3tztchNRV9xU30W0SJFdwCqSOQ0PmnOncyDlc1tfmBwPTp9RW9CdAnwInxC8FSmNxgd4IF1bwmYXwMvyfhcYJwVbbflMe3FWnRkUR0IONsYMzs1Z-mED8VzXi5futJ04YoGV2Aidg30w7bMk_eOIdfc_BmK",
		quota: 12,
		remainingSlots: 4,
		priceNormal: 250000,
		category: "workshop",
		status: "upcoming",
		categorySlugs: ["workshop", "hands-on"]
	},
	{
		slug: "digital-marketing-for-umkm",
		title: "Digital Marketing for UMKM",
		startsAt: "2026-11-08T13:00:00+07:00",
		endsAt: "2026-11-08T16:00:00+07:00",
		location: "Aula Dinas Koperasi dan UKM, Pekanbaru",
		excerpt: "Practical, no-jargon marketing for small businesses that already have customers.",
		body: "Sesi untuk pemilik UMKM yang usahanya sudah jalan tapi bingung soal pemasaran digital. Materi: menyusun konten yang tidak memakan waktu, membaca angka penjualan, dan memilih satu kanal untuk difokuskan.\n\nBukan kelas teori. Bawa data penjualan tiga bulan terakhir kalau ada — kita bedah bersama di sesi kedua.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGP3k-BPnJNzGuJhv0C1w9NZjsyE0lH0QgRec6C5v9rmtfay4zNN34qKVGpngtIek3jFTOgRCx6Qlny5EUsKb82TUhAXGMrcmldBba95J27muA8YV23-LXRf0eyf4J4NF6FUt4fhjyC1d1nB47NECSUKpaMaM0PYnjm-1ziU-4VxGBfIultucN7v3T8uWpRz9gjh3_8mM4Rx68KHtSG_WAJRQldJRNwaiUmkByon5FIbzWK5DNzLypf0guEvXt5jdyUNZJgfZEpV-s",
		quota: 80,
		remainingSlots: 52,
		priceNormal: null,
		category: "talk",
		status: "upcoming",
		categorySlugs: ["business"]
	},
	{
		slug: "year-end-creative-showcase",
		title: "Year-End Creative Showcase",
		startsAt: "2026-12-13T16:00:00+07:00",
		endsAt: "2026-12-13T22:00:00+07:00",
		location: "Taman Budaya Riau, Pekanbaru",
		excerpt: "Everything the community made this year, in one room, for one night.",
		body: "Pameran dan pertunjukan penutup tahun. Karya dari peserta workshop sepanjang 2026 — tenun, fotografi, tulisan, musik — dipamerkan bersama.\n\nMalam diisi pertunjukan musik akustik dan tari Zapin. Gratis dan terbuka untuk umum, tidak perlu tiket. Datang kapan saja antara jam 4 sore dan 10 malam.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBC20E2R0F_20RxEXLT12_jAOPuLd50_xVz5WogGhyYT4BoXyGEnRvTi9eQ7C_248zO-5lLLUPv-XRGGOUgSz1VEtqvpiPFE9UknDl4G3HJzSlft4etC_rMw7CCOxHxuGd3QJzizE3OxhyKMzd-p1mtxVmXMHTARBbbqIqNyr-7uItEuKKvEdsmBpA97cEIZU_YOXVTct8zY-U6Egsv1_DKyaT9M7n9DajZPaeX66IZOFaU_F34XhH7_u6Avm4D4K92C9ptnXa_IE-B",
		quota: 300,
		remainingSlots: 248,
		priceNormal: null,
		category: "social",
		status: "upcoming",
		categorySlugs: ["festival", "culture"]
	},
	{
		slug: "bersua-open-house",
		title: "Bersua Open House",
		startsAt: "2026-08-31T15:00:00+07:00",
		endsAt: "2026-08-31T20:00:00+07:00",
		location: "Sekretariat PKUBersua, Jl. Riau, Pekanbaru",
		excerpt: "Drop in, meet the organisers, and find out what the community actually does.",
		body: "Sedang berlangsung hari ini. Sekretariat dibuka untuk siapa pun yang penasaran dengan PKUBersua — tidak ada agenda formal, tidak ada presentasi.\n\nDatang, ngobrol dengan pengurus dan anggota, lihat dokumentasi kegiatan tahun ini, dan kalau tertarik bisa langsung daftar jadi anggota di tempat. Kopi gratis.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDUoNiIe9HhntGTFesHtJDseicn_N6aDhToMbKjrPbu4GG2CWGz8yte_3r3LjExbara-8vF1PFmc_tx6KlNTYrIFpARUK6SpVtSjdqwJYBuuPsKAAzmN3tztchNRV9xU30W0SJFdwCqSOQ0PmnOncyDlc1tfmBwPTp9RW9CdAnwInxC8FSmNxgd4IF1bwmYXwMvyfhcYJwVbbflMe3FWnRkUR0IONsYMzs1Z-mED8VzXi5futJ04YoGV2Aidg30w7bMk_eOIdfc_BmK",
		quota: 100,
		remainingSlots: 63,
		priceNormal: null,
		category: "meetup",
		status: "live",
		categorySlugs: ["networking"]
	},
	{
		slug: "zapin-dance-basics",
		title: "Zapin Dance Basics",
		startsAt: "2026-07-19T08:00:00+07:00",
		endsAt: "2026-07-19T11:00:00+07:00",
		location: "Sanggar Tari Laksemana, Pekanbaru",
		excerpt: "The foundational steps of Zapin, taught by dancers who perform it professionally.",
		body: "Kelas pengenalan tari Zapin untuk pemula total. Fokus pada langkah dasar, hitungan, dan koordinasi dengan musik gambus.\n\nTerlaksana Juli 2026 dengan 18 peserta. Dokumentasi dan rekaman kelas tersedia untuk peserta. Kelas lanjutan sedang disusun untuk awal 2027.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGP3k-BPnJNzGuJhv0C1w9NZjsyE0lH0QgRec6C5v9rmtfay4zNN34qKVGpngtIek3jFTOgRCx6Qlny5EUsKb82TUhAXGMrcmldBba95J27muA8YV23-LXRf0eyf4J4NF6FUt4fhjyC1d1nB47NECSUKpaMaM0PYnjm-1ziU-4VxGBfIultucN7v3T8uWpRz9gjh3_8mM4Rx68KHtSG_WAJRQldJRNwaiUmkByon5FIbzWK5DNzLypf0guEvXt5jdyUNZJgfZEpV-s",
		quota: 20,
		remainingSlots: 0,
		priceNormal: 50000,
		category: "workshop",
		status: "past",
		categorySlugs: ["culture", "hands-on"]
	},
	{
		slug: "kopi-tiam-culture-talk",
		title: "Kopi Tiam Culture Talk",
		startsAt: "2026-06-14T19:00:00+07:00",
		endsAt: "2026-06-14T21:00:00+07:00",
		location: "Kedai Kopi Kimteng, Pekanbaru",
		excerpt: "How Pekanbaru's kopi tiam became the city's most durable public space.",
		body: "Diskusi bersama sejarawan lokal dan generasi ketiga pemilik kedai kopi tentang peran kopi tiam sebagai ruang publik di Pekanbaru — dari masa kolonial sampai sekarang.\n\nTerlaksana Juni 2026. Transkrip diskusi sudah diterbitkan di blog komunitas.",
		bannerUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBC20E2R0F_20RxEXLT12_jAOPuLd50_xVz5WogGhyYT4BoXyGEnRvTi9eQ7C_248zO-5lLLUPv-XRGGOUgSz1VEtqvpiPFE9UknDl4G3HJzSlft4etC_rMw7CCOxHxuGd3QJzizE3OxhyKMzd-p1mtxVmXMHTARBbbqIqNyr-7uItEuKKvEdsmBpA97cEIZU_YOXVTct8zY-U6Egsv1_DKyaT9M7n9DajZPaeX66IZOFaU_F34XhH7_u6Avm4D4K92C9ptnXa_IE-B",
		quota: 40,
		remainingSlots: 0,
		priceNormal: null,
		category: "talk",
		status: "past",
		categorySlugs: ["culture"]
	}
];
