<script lang="ts">
	import { page } from "$app/state";
	import type { PageData } from "./$types.js";
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import { buildLandingJsonLd } from "$lib/features/events";
	import Search from "@lucide/svelte/icons/search";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import Menu from "@lucide/svelte/icons/menu";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import CalendarDays from "@lucide/svelte/icons/calendar-days";
	import Users from "@lucide/svelte/icons/users";
	import Bookmark from "@lucide/svelte/icons/bookmark";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import MailOpen from "@lucide/svelte/icons/mail-open";
	import Code2 from "@lucide/svelte/icons/code-2";
	import PenTool from "@lucide/svelte/icons/pen-tool";
	import Rocket from "@lucide/svelte/icons/rocket";
	import Camera from "@lucide/svelte/icons/camera";

	let { data }: { data: PageData } = $props();
	const user = $derived(page.data.user);
	const accountHref = $derived(user ? "/myprofile" : "/login");
	const accountLabel = $derived(user ? "Profil saya" : "Log in");
	const landingJsonLd = buildLandingJsonLd();
	let mobileMenuOpen = $state(false);
	let keyword = $state("");
	let toast = $state("");
	const categories = [
		["Semua Event", CalendarDays, "emerald"],
		["Teknologi", Code2, "violet"],
		["Bisnis", Rocket, "orange"],
		["Pendidikan", CalendarDays, "teal"],
		["Komunitas", Users, "purple"],
		["Seni & Budaya", PenTool, "amber"],
		["Hobi", Camera, "pink"]
	] as const;
	const communities = [
		[
			"PKUBersua",
			"1.284 members",
			"Komunitas kolaboratif di Pekanbaru untuk berbagi dan bertumbuh.",
			Users,
			"amber"
		],
		[
			"Pekanbaru Developer",
			"842 members",
			"Wadah bagi developer untuk belajar, berbagi, dan membuat impact bersama.",
			Code2,
			"violet"
		],
		[
			"Design Pekanbaru",
			"623 members",
			"Tempat berkumpulnya para designer untuk inspirasi dan kolaborasi.",
			PenTool,
			"lime"
		],
		[
			"Pekanbaru Startup",
			"512 members",
			"Bangun startup, perluas jaringan, dan wujudkan ide bersama.",
			Rocket,
			"orange"
		],
		[
			"Photography ID",
			"436 members",
			"Belajar fotografi, berbagi karya, dan hunting spot di sekitar Riau.",
			Camera,
			"pink"
		]
	] as const;
	const articles = [
		"5 Cara Memaksimalkan Networking di Event",
		"Manfaat Bergabung di Komunitas Lokal",
		"Recap: UI/UX Workshop Juli 2026",
		"Bangun Kebiasaan Positif Lewat Komunitas"
	];
	const formatDate = (iso: string) =>
		new Intl.DateTimeFormat("id-ID", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric"
		}).format(new Date(iso));
	const price = (event: PageData["events"][number]) =>
		(event.pricePromo ?? event.priceNormal)
			? `Rp ${(event.pricePromo ?? event.priceNormal)?.toLocaleString("id-ID")}`
			: "GRATIS";
	const showToast = (message: string) => {
		toast = message;
		setTimeout(() => (toast = ""), 2600);
	};
</script>

<svelte:head>
	<title>PKUBersua — Komunitas, Event, Bersua</title>
	<meta name="description" content="Temukan event dan komunitas terbaik di Pekanbaru." />
	<link rel="canonical" href="{PUBLIC_SITE_URL}/" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html landingJsonLd}
</svelte:head>

<header
	id="home"
	class="relative min-h-[540px] overflow-visible bg-[#073d3d] bg-[linear-gradient(180deg,rgba(3,23,32,.18),rgba(3,23,32,.94))] text-white"
>
	<nav
		class="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between gap-4 px-3 md:px-4"
		aria-label="Navigasi utama"
	>
		<a href="#home" class="flex items-center gap-2.5 font-extrabold"
			><span
				class="grid h-9 w-9 rotate-[30deg] place-items-center rounded-xl bg-gradient-to-br from-emerald-300 via-amber-300 to-white shadow-lg"
				><span class="h-4 w-4 rounded border-2 border-[#073d3d]"></span></span
			><span class="grid leading-none"
				><b>PKUBersua</b><small class="mt-1 text-[9px] font-medium text-white/70"
					>Komunitas. Event. Bersua.</small
				></span
			></a
		>
		<div class="hidden items-center gap-7 text-sm font-semibold lg:flex">
			<a href="#events">Explore</a><a href="#communities">Communities</a><a href="#events">Events</a
			><a href="#articles">To Dos <span class="text-pink-400">●</span></a><a href="#partners"
				>Venues</a
			><a href="#partners">For Organizers</a>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="hidden min-h-10 items-center gap-2 rounded-xl border border-white/35 bg-slate-950/20 px-3 text-xs font-semibold sm:flex"
				><MapPin size={15} />Pekanbaru<ChevronDown size={13} /></button
			><a
				class="hidden min-h-10 items-center rounded-xl border border-white/35 bg-slate-950/20 px-4 text-xs font-semibold sm:flex"
				href={accountHref}>{accountLabel}</a
			><a
				class="grid min-h-10 place-items-center rounded-xl bg-[#f7b91d] px-4 text-xs font-extrabold text-[#102126]"
				href={accountHref}>Sign up</a
			><button
				class="grid h-10 w-10 place-items-center rounded-xl border border-white/35 bg-slate-950/20 lg:hidden"
				aria-label="Buka menu"
				aria-expanded={mobileMenuOpen}
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}><Menu size={19} /></button
			>
		</div>
	</nav>
	{#if mobileMenuOpen}<div
			class="absolute left-3 right-3 top-[68px] z-30 grid gap-1 rounded-2xl border border-white/15 bg-[#073d3df5] p-4 shadow-2xl lg:hidden"
		>
			<a
				class="rounded-xl px-3 py-2.5 text-sm font-semibold"
				href="#events"
				onclick={() => (mobileMenuOpen = false)}>Explore</a
			><a class="rounded-xl px-3 py-2.5 text-sm font-semibold" href="#communities">Communities</a><a
				class="rounded-xl px-3 py-2.5 text-sm font-semibold"
				href="#articles">To Dos</a
			><a class="rounded-xl px-3 py-2.5 text-sm font-semibold" href={accountHref}>Log in</a>
		</div>{/if}
	<div class="mx-auto w-full max-w-[1180px] px-3 pb-20 pt-12 text-center md:px-4">
		<h1
			class="mx-auto max-w-4xl text-[38px] font-black leading-[1.03] tracking-[-.045em] sm:text-5xl lg:text-[62px]"
		>
			Temukan <u class="underline decoration-2 underline-offset-4">komunitasmu.</u><br />Datang.
			Bertemu. <strong class="text-[#ffd66f]">Bersua.</strong>
		</h1>
		<p class="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
			PKUBersua adalah tempat terbaik untuk menemukan event dan komunitas yang relevan untukmu di
			Pekanbaru.
		</p>
		<form
			class="mx-auto mt-8 w-full max-w-[880px] rounded-2xl bg-white/95 p-3.5 text-left text-[#102126] shadow-2xl"
			onsubmit={(event) => {
				event.preventDefault();
				showToast(keyword ? `Mencari “${keyword}” di Pekanbaru` : "Masukkan kata kunci pencarian");
			}}
		>
			<div class="grid gap-2.5 md:grid-cols-[1.8fr_.8fr_auto]">
				<label
					class="flex min-h-[54px] items-center gap-3 rounded-xl border border-[#e8ecec] bg-white px-4"
					><Search size={17} class="text-slate-400" /><input
						bind:value={keyword}
						type="search"
						placeholder="Cari event, komunitas, atau topik"
						class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
					/></label
				><label
					class="flex min-h-[54px] items-center gap-3 rounded-xl border border-[#e8ecec] bg-white px-4"
					><MapPin size={17} class="text-slate-400" /><select
						class="w-full bg-transparent text-sm font-medium outline-none"
						><option>Pekanbaru</option><option>Rumbai</option><option>Panam</option></select
					></label
				><button
					class="min-h-[50px] rounded-xl bg-[#f7b91d] px-6 text-sm font-extrabold"
					type="submit">Cari Sekarang</button
				>
			</div>
			<div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
				<b class="text-slate-700">Trending:</b
				>{#each ["Teknologi", "Startup", "Desain", "Webinar", "Bisnis", "Gratis", "Weekend"] as trend}<button
						type="button"
						class="rounded-full bg-slate-100 px-3 py-1.5"
						onclick={() => (keyword = trend)}>{trend}</button
					>{/each}
			</div>
		</form>
	</div>
</header>

<main class="mx-auto w-full max-w-[1180px] px-3 pb-10 md:px-4">
	<div
		class="relative z-10 -mt-1 grid overflow-hidden rounded-2xl border border-[#e8ecec] bg-white shadow-xl lg:-mt-11 sm:grid-cols-2 lg:grid-cols-7"
	>
		{#each categories as [label, Icon]}<a
				href="#events"
				class="grid min-h-[88px] place-items-center gap-1.5 border-b border-r border-[#e8ecec] p-3 text-center text-xs font-bold transition hover:bg-slate-50"
				><span class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"
					><Icon size={20} /></span
				>{label}</a
			>{/each}
	</div>
	<section id="events" class="pt-11">
		<div class="mb-5 flex items-end justify-between gap-4">
			<div>
				<h2 class="text-xl font-black tracking-tight sm:text-2xl">Event Populer Minggu Ini 🔥</h2>
				<p class="mt-1 text-xs text-[#66747a]">Temukan event seru dan bertemu orang-orang baru.</p>
			</div>
			<a
				class="flex shrink-0 items-center gap-1 text-xs font-extrabold text-[#0a5350]"
				href="/events">Lihat semua event <ArrowRight size={14} /></a
			>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each data.events.slice(0, 4) as event (event.id)}<article
					class="overflow-hidden rounded-2xl border border-[#e8ecec] bg-white shadow-md"
				>
					<a
						href="/events/{event.slug}"
						class="relative block h-[212px] overflow-hidden bg-gradient-to-br from-[#1d164d] to-[#315c53] text-white"
						>{#if event.bannerUrl}<img
								src={event.bannerUrl}
								alt=""
								class="h-full w-full object-cover"
							/>{:else}<div
								class="grid h-full place-items-center p-5 text-center text-xl font-black"
							>
								{event.title}
							</div>{/if}
						<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/85"></div>
						<span
							class="absolute left-3 top-3 rounded-md bg-violet-700 px-2 py-1 text-[9px] font-black"
							>{event.categories[0]?.name ?? "KOMUNITAS"}</span
						><button
							class="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/35"
							aria-label="Simpan event"
							onclick={(e) => {
								e.preventDefault();
								showToast("Event disimpan");
							}}><Bookmark size={16} /></button
						>
						<div class="absolute inset-x-4 bottom-4">
							<h3 class="text-[22px] font-black leading-[1.05]">{event.title}</h3>
							<p class="mt-2 text-[11px] text-white/80">{formatDate(event.startsAt)}</p>
							<p class="mt-1 text-[11px] text-white/80">{event.location}</p>
						</div></a
					>
					<div class="flex justify-between px-3.5 py-3 text-[11px] font-bold">
						<span>PKUBersua</span><span class="text-emerald-600">{price(event)}</span>
					</div>
				</article>{:else}<p class="col-span-full p-8 text-center text-sm text-[#66747a]">
					Belum ada event mendatang.
				</p>{/each}
		</div>
	</section>
	{#if data.pastEventsTotal > 0}<section class="pt-8">
			<div class="flex justify-between">
				<div>
					<h2 class="text-xl font-black">Event Sebelumnya</h2>
					<p class="mt-1 text-xs text-[#66747a]">Lihat apa yang sudah kita selenggarakan.</p>
				</div>
				{#if data.pastEventsTotal > 6}<a class="text-xs font-bold text-[#0a5350]" href="/events"
						>Lihat semua</a
					>{/if}
			</div>
		</section>{/if}
	<section id="communities" class="pt-11">
		<div class="mb-5 flex items-end justify-between gap-4">
			<div>
				<h2 class="text-xl font-black tracking-tight sm:text-2xl">Komunitas Populer</h2>
				<p class="mt-1 text-xs text-[#66747a]">
					Temukan ruang yang cocok untuk berkembang bersama.
				</p>
			</div>
			<a class="text-xs font-extrabold text-[#0a5350]" href="#communities"
				>Lihat semua komunitas →</a
			>
		</div>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			{#each communities as [name, members, description, Icon]}<article
					class="flex min-h-[270px] flex-col items-center rounded-2xl border border-[#e8ecec] bg-white p-4 pt-6 text-center shadow-md"
				>
					<span class="grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-500"
						><Icon size={30} /></span
					>
					<h3 class="mt-3 text-sm font-black">{name}</h3>
					<small class="mt-1 text-[11px] text-slate-400">{members}</small>
					<p class="mt-3 text-xs leading-5 text-[#66747a]">{description}</p>
					<button
						class="mt-auto w-full rounded-xl bg-amber-50 py-2.5 text-xs font-extrabold text-amber-800"
						onclick={() => showToast(`Bergabung dengan ${name}`)}>Join Community</button
					>
				</article>{/each}
		</div>
		<div
			class="mt-5 grid overflow-hidden rounded-2xl border border-[#e8ecec] bg-gradient-to-r from-violet-50/60 to-amber-50/60 sm:grid-cols-2 lg:grid-cols-5"
		>
			<div class="p-5 lg:col-span-1">
				<h3 class="font-black">Kenapa PKUBersua?</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Semua yang kamu butuhkan untuk bertumbuh, belajar, dan bertemu.
				</p>
			</div>
			<div class="min-h-[124px] border-t border-[#e8ecec] p-5 lg:border-l">
				<CalendarDays size={23} class="mb-2 text-amber-500" />
				<h3 class="text-sm font-black">Temukan Event</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
			<div class="min-h-[124px] border-t border-[#e8ecec] p-5 lg:border-l">
				<Users size={23} class="mb-2 text-amber-500" />
				<h3 class="text-sm font-black">Bangun Relasi</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
			<div class="min-h-[124px] border-t border-[#e8ecec] p-5 lg:border-l">
				<Users size={23} class="mb-2 text-amber-500" />
				<h3 class="text-sm font-black">Ikut Komunitas</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
			<div class="min-h-[124px] border-t border-[#e8ecec] p-5 lg:border-l">
				<Rocket size={23} class="mb-2 text-amber-500" />
				<h3 class="text-sm font-black">Kembangkan Diri</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
		</div>
		<div
			class="relative mt-5 grid gap-6 rounded-2xl bg-gradient-to-r from-[#142a61] to-[#4c188b] p-6 text-white lg:grid-cols-[1.15fr_1fr] lg:items-center"
		>
			<MailOpen size={90} class="absolute -left-3 top-2 -rotate-12 text-white/15" />
			<div class="relative lg:pl-24">
				<h3 class="text-lg font-black">Jangan lewatkan event seru lainnya!</h3>
				<p class="mt-1 text-xs leading-5 text-white/70">
					Dapatkan rekomendasi event dan update komunitas terbaik di Pekanbaru.
				</p>
			</div>
			<form
				class="relative flex flex-col gap-2 rounded-xl bg-white p-2 sm:flex-row"
				onsubmit={(event) => {
					event.preventDefault();
					showToast("Email kamu sudah terdaftar");
				}}
			>
				<input
					required
					type="email"
					placeholder="Masukkan email kamu"
					class="min-h-11 min-w-0 flex-1 rounded-lg px-3 text-sm text-[#102126] outline-none"
				/><button
					class="min-h-11 rounded-lg bg-[#f7b91d] px-6 text-sm font-extrabold text-[#102126]"
					>Berlangganan</button
				>
			</form>
		</div>
	</section>
	<section id="articles" class="pt-11">
		<div class="mb-5 flex items-end justify-between">
			<div>
				<h2 class="text-xl font-black tracking-tight sm:text-2xl">Artikel & Blog Terbaru</h2>
				<p class="mt-1 text-xs text-[#66747a]">Insight dan cerita dari komunitas Pekanbaru.</p>
			</div>
			<a class="text-xs font-extrabold text-[#0a5350]" href="#articles">Lihat semua artikel →</a>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each articles as article}<article
					class="overflow-hidden rounded-2xl border border-[#e8ecec] bg-white shadow-md"
				>
					<div class="h-40 bg-gradient-to-br from-[#2e3230] to-[#315c53]"></div>
					<div class="p-4">
						<span class="rounded-md bg-violet-50 px-2 py-1 text-[9px] font-black text-violet-700"
							>KOMUNITAS</span
						>
						<h3 class="mt-3 text-[15px] font-black leading-5">{article}</h3>
						<p class="mt-2 text-xs leading-5 text-[#66747a]">
							Cerita, tips, dan insight untuk bertumbuh bersama komunitas.
						</p>
						<small class="mt-3 block text-[10px] text-slate-400">12 Agu 2026 · 5 min read</small>
					</div>
				</article>{/each}
		</div>
		<div
			id="partners"
			class="my-11 rounded-2xl border border-amber-100 bg-gradient-to-r from-emerald-50/60 to-amber-50/80 p-5 sm:p-7"
		>
			<div class="flex flex-col items-start justify-between gap-5 lg:flex-row">
				<div>
					<small class="text-[10px] font-black tracking-widest text-emerald-700"
						>PARTNERSHIP ECOSYSTEM</small
					>
					<h2 class="mt-1 text-xl font-black sm:text-2xl">
						Berkolaborasi dengan brand dan komunitas <span class="text-amber-500">terbaik</span>
					</h2>
					<p class="mt-1 max-w-2xl text-xs leading-5 text-[#66747a]">
						PKUBersua bekerja sama dengan berbagai perusahaan, komunitas, dan institusi di
						Pekanbaru.
					</p>
				</div>
				<button
					class="w-full rounded-xl bg-[#073d3d] px-5 py-3 text-sm font-extrabold text-white lg:w-auto"
					onclick={() => showToast("Kami akan menghubungi kamu")}>Jadi Partner PKUBersua →</button
				>
			</div>
			<div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				{#each ["Telkomsel", "gojek", "BCA", "OVO", "ruangguru", "wondr"] as partner}<div
						class="grid min-h-[58px] place-items-center rounded-xl border border-[#e8ecec] bg-white text-sm font-black"
					>
						{partner}
					</div>{/each}
			</div>
		</div>
	</section>
</main>

<footer class="bg-[#073d3d] pb-5 pt-9 text-white">
	<div
		class="mx-auto grid w-full max-w-[1180px] gap-8 px-3 sm:grid-cols-2 lg:grid-cols-[1.55fr_repeat(4,1fr)] lg:px-4"
	>
		<div class="sm:col-span-2 lg:col-span-1">
			<a href="#home" class="font-extrabold">PKUBersua</a>
			<p class="mt-4 w-full max-w-none text-xs leading-5 text-white/65">
				Platform komunitas dan event terbaik di Pekanbaru untuk bertemu, belajar, dan bertumbuh
				bersama.
			</p>
		</div>
		{#each [["Jelajahi", "Event · Community · Blog"], ["Untuk Organizer", "Buat Event · Kelola Event · Bantuan"], ["Perusahaan", "Tentang Kami · Mitra · Kontak"], ["Legal", "Syarat & Ketentuan · Privasi"]] as column}<div
			>
				<h4 class="text-sm font-black">{column[0]}</h4>
				<p class="mt-3 text-xs leading-6 text-white/65">{column[1]}</p>
			</div>{/each}
	</div>
	<div
		class="mx-auto mt-7 flex w-full max-w-[1180px] flex-col justify-between gap-3 border-t border-white/10 px-3 pt-5 text-[11px] text-white/50 sm:flex-row sm:px-4"
	>
		© 2026 PKUBersua. All rights reserved.<span>Dibuat di Pekanbaru, untuk Indonesia. 🇮🇩 💛</span>
	</div>
</footer>
{#if toast}<div
		class="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"
		role="status"
		aria-live="polite"
	>
		{toast}
	</div>{/if}
