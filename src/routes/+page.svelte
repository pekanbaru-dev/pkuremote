<script lang="ts">
	/* eslint-disable svelte/no-restricted-html-elements, svelte/require-each-key, svelte/no-at-html-tags */
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import type { PageData } from "./$types.js";
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import { buildLandingJsonLd } from "$lib/features/events";
	import Search from "@lucide/svelte/icons/search";
	import Menu from "@lucide/svelte/icons/menu";
	import CalendarDays from "@lucide/svelte/icons/calendar-days";
	import Users from "@lucide/svelte/icons/users";
	import Bookmark from "@lucide/svelte/icons/bookmark";
	import Code2 from "@lucide/svelte/icons/code-2";
	import PenTool from "@lucide/svelte/icons/pen-tool";
	import Rocket from "@lucide/svelte/icons/rocket";
	import Camera from "@lucide/svelte/icons/camera";

	let { data }: { data: PageData } = $props();
	const user = $derived(page.data.user);
	const accountHref = $derived(user ? "/myprofile" : "/login");
	const accountLabel = $derived(user ? "Dashboard" : "Login / Sign Up");
	const landingJsonLd = buildLandingJsonLd();
	let mobileMenuOpen = $state(false);
	let hasScrolled = $state(false);
	let keyword = $state("");
	let toast = $state("");
	const typingPhrases = [
		"Cerita",
		"Cerita",
		"Cerita",
		"Pasangan",
		"Oleh-oleh",
		"Kenangan",
		"Talam Durian",
		"Kemojo",
		"Keripik Nenas",
		"Lapek Bugih"
	];
	let typingPhrase = $state("");
	let typingIndex = $state(0);
	let typingCharacterIndex = $state(0);
	let isDeleting = $state(false);
	let isCorrectingTypo = $state(false);
	const categories = [
		["Semua Event", CalendarDays, "emerald"],
		["Teknologi", Code2, "violet"],
		["Bisnis", Rocket, "orange"],
		["Pendidikan", CalendarDays, "teal"],
		["Komunitas", Users, "purple"],
		["Seni & Budaya", PenTool, "amber"],
		["Hobi", Camera, "pink"]
	] as const;
	const categoryStyles = {
		emerald: "bg-[#073d3d] text-white group-hover:bg-[#0a5350]",
		violet: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		orange: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		teal: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		purple: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		amber: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white",
		pink: "bg-[#e6f2f0] text-[#0a5350] group-hover:bg-[#0a5350] group-hover:text-white"
	} as const;
	const communities = [
		[
			"PKUBersua",
			"1.284 members",
			"Komunitas kolaboratif di Pekanbaru untuk berbagi dan bertumbuh.",
			"PK",
			"amber"
		],
		[
			"Pekanbaru Developer",
			"842 members",
			"Wadah bagi developer untuk belajar, berbagi, dan membuat impact bersama.",
			"PD",
			"violet"
		],
		[
			"Design Pekanbaru",
			"623 members",
			"Tempat berkumpulnya para designer untuk inspirasi dan kolaborasi.",
			"DP",
			"lime"
		],
		[
			"Pekanbaru Startup",
			"512 members",
			"Bangun startup, perluas jaringan, dan wujudkan ide bersama.",
			"SP",
			"orange"
		],
		[
			"Photography ID",
			"436 members",
			"Belajar fotografi, berbagi karya, dan hunting spot di sekitar Riau.",
			"PI",
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
	const updateHeaderScrollState = () => {
		hasScrolled = window.scrollY > 0;
	};

	onMount(() => {
		updateHeaderScrollState();
		window.addEventListener("scroll", updateHeaderScrollState, { passive: true });
		let timer: ReturnType<typeof setTimeout>;
		const typingDelay = () =>
			70 + Math.random() * 60 + (Math.random() < 0.16 ? 160 + Math.random() * 260 : 0);
		const pickNextTypingIndex = () => {
			let nextIndex = typingIndex;

			while (typingPhrases[nextIndex] === typingPhrases[typingIndex]) {
				nextIndex = Math.floor(Math.random() * typingPhrases.length);
			}

			return nextIndex;
		};

		const tick = () => {
			const phrase = typingPhrases[typingIndex];

			if (isCorrectingTypo) {
				typingPhrase = phrase.slice(0, typingCharacterIndex);
				isCorrectingTypo = false;
				timer = setTimeout(tick, 110 + Math.random() * 80);
				return;
			}

			if (isDeleting) {
				typingCharacterIndex -= 1;
				typingPhrase = phrase.slice(0, typingCharacterIndex);

				if (typingCharacterIndex === 0) {
					typingIndex = pickNextTypingIndex();
					isDeleting = false;
					timer = setTimeout(tick, 350);
					return;
				}
			} else {
				typingCharacterIndex += 1;
				typingPhrase = phrase.slice(0, typingCharacterIndex);

				if (typingCharacterIndex < phrase.length && Math.random() < 0.018) {
					typingPhrase += "a";
					isCorrectingTypo = true;
				}

				if (typingCharacterIndex === phrase.length) {
					isDeleting = true;
					timer = setTimeout(tick, 5400);
					return;
				}
			}

			timer = setTimeout(tick, isDeleting ? 45 + Math.random() * 35 : typingDelay());
		};

		timer = setTimeout(tick, 450);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("scroll", updateHeaderScrollState);
		};
	});
</script>

<svelte:head>
	<title>PKUBersua — Komunitas, Event, Bersua</title>
	<meta name="description" content="Temukan event dan komunitas terbaik di Pekanbaru." />
	<link rel="canonical" href="{PUBLIC_SITE_URL}/" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html landingJsonLd}
</svelte:head>

<header
	id="home"
	class="relative min-h-[540px] overflow-visible bg-[#073d3d] bg-[linear-gradient(180deg,rgba(3,23,32,.32),rgba(3,23,32,.88)),url('/images/hero/header.svg')] bg-cover bg-center bg-no-repeat text-white"
>
	<nav
		class={`fixed inset-x-0 top-0 z-50 h-[72px] w-full transition-colors duration-200 ${hasScrolled ? "border-b border-slate-200/70 bg-white/88 text-[#24383c] backdrop-blur-md" : "bg-transparent text-white"}`}
		aria-label="Navigasi utama"
	>
		<div
			class="mx-auto flex h-full w-full max-w-[1180px] items-center justify-between gap-4 px-3 md:px-4"
		>
			<a href="#home" class="flex items-center gap-2.5 font-extrabold"
			><span
				class="grid h-9 w-9 rotate-[30deg] place-items-center rounded-xl bg-gradient-to-br from-emerald-300 via-amber-300 to-white shadow-lg"
				><span class="h-4 w-4 rounded border-2 border-[#073d3d]"></span></span
			><span class="grid leading-none"
				><b>PKUBersua</b><small
					class={`mt-1 text-[9px] font-medium ${hasScrolled ? "text-[#66747a]" : "text-white/70"}`}
					>Komunitas, Event, Cerita</small
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
			<a
				class="hidden min-h-10 items-center rounded-xl bg-[#f7b91d] px-4 text-xs font-semibold text-ink sm:flex"
				href={accountHref}>{accountLabel}</a
			><button
				class={`grid h-10 w-10 place-items-center rounded-xl border lg:hidden ${hasScrolled ? "border-slate-200 bg-slate-100 text-[#24383c]" : "border-white/35 bg-slate-950/20"}`}
				aria-label="Buka menu"
				aria-expanded={mobileMenuOpen}
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}><Menu size={19} /></button
			>
		</div>
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
			><a class="rounded-xl px-3 py-2.5 text-sm font-semibold" href={accountHref}>{accountLabel}</a>
		</div>{/if}
	<div class="mx-auto w-full max-w-[1180px] px-3 pb-20 pt-28 text-center md:px-4">
		<h1
			class="mx-auto max-w-3xl text-[34px] font-bold leading-[1.15] tracking-[-.04em] text-white sm:text-[42px] lg:text-[52px]"
		>
			Datang <em>’tuk</em>&nbsp;&nbsp;<u class="underline decoration-2 underline-offset-4">Bersua</u
			>,<br />Pulang
			<strong class="text-[#f7b91d]"
				>Bawa <span aria-live="polite">{typingPhrase}</span><span
					aria-hidden="true"
					class="animate-cursor-blink">|</span
				>.</strong
			>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-white sm:text-base">
			PKUBersua adalah tempat terbaik untuk menemukan event dan komunitas yang relevan untukmu di
			Pekanbaru.
		</p>
		<form
			class="mx-auto mt-8 w-full max-w-[880px] rounded-2xl bg-white/95 p-4 text-left text-ink shadow-[0_18px_50px_rgba(3,23,32,0.22)] sm:p-5"
			onsubmit={(event) => {
				event.preventDefault();
				showToast(keyword ? `Mencari “${keyword}” di Pekanbaru` : "Masukkan kata kunci pencarian");
			}}
		>
			<div class="grid gap-5 md:grid-cols-[1fr_auto]">
				<label
					class="flex min-h-14 items-center gap-4 rounded-xl border border-slate-300 bg-white px-5 transition focus-within:border-[#0a5350] focus-within:ring-2 focus-within:ring-[#0a5350]/10"
				>
					<Search size={17} class="text-slate-400" />
					<input
						bind:value={keyword}
						type="search"
						placeholder="Cari event, komunitas, atau topik"
						class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
					/>
				</label>
				<button
					class="min-h-14 w-full rounded-xl bg-[#f7b91d] px-7 text-sm font-semibold md:w-44"
					type="submit"
				>
					Temukan
				</button>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-xs text-slate-500">
				<b class="text-slate-700">Trending:</b
				>{#each ["Teknologi", "Startup", "Desain", "Webinar", "Bisnis", "Gratis", "Weekend"] as trend}<button
						type="button"
						class="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-[#0a5350] hover:text-[#0a5350]"
						onclick={() => (keyword = trend)}>{trend}</button
					>{/each}
			</div>
		</form>
	</div>
</header>

<main class="mx-auto w-full max-w-[1180px] px-3 pb-10 md:px-4">
	<div
		class="relative z-10 -mt-1 grid overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_16px_40px_rgba(7,61,61,0.14)] lg:-mt-11 sm:grid-cols-2 lg:grid-cols-7"
	>
		{#each categories as [label, Icon, tone]}<a
				href="#events"
				class={[
					"group grid min-h-[88px] place-items-center gap-1.5 border-b border-r border-slate-100 p-3 text-center text-xs font-semibold text-ink transition",
					tone === "emerald"
						? "border-b-2 border-b-[#073d3d] bg-[#f7fbfa]"
						: "hover:bg-[#fffdf5]"
				]}
				><span
					class={[
						"grid h-9 w-9 place-items-center rounded-xl transition duration-200 group-hover:scale-105",
						categoryStyles[tone]
					]}><Icon size={20} /></span
				>{label}</a
			>{/each}
	</div>
	<section id="events" class="pt-11">
		<div class="mb-5 flex items-end justify-between gap-4">
			<div>
				<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">
					Rekomendasi Buat Kamu
				</h2>
				<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
					Temukan event seru dan bertemu orang-orang baru.
				</p>
			</div>
			<a
				class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
				href="/events"
			>
				Lihat semua event
			</a>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each data.events.slice(0, 4) as event (event.id)}<article
					class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
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
						<div
							class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/90"
						></div>
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
							<h3
								class="text-lg font-black leading-[1.1] [-webkit-text-stroke:0.75px_#334155] [paint-order:stroke_fill]"
							>
								{event.title}
							</h3>
							<p
								class="mt-2 text-[11px] text-white/95 [-webkit-text-stroke:0.35px_#334155] [paint-order:stroke_fill]"
							>
								{formatDate(event.startsAt)}
							</p>
							<p
								class="mt-1 text-[11px] text-white/95 [-webkit-text-stroke:0.35px_#334155] [paint-order:stroke_fill]"
							>
								{event.location}
							</p>
						</div></a
					>
					<div class="flex justify-between px-3.5 py-3 text-[11px] font-bold">
						<span class="flex items-center gap-1.5"
							><span
								class="grid h-6 w-6 place-items-center rounded-full bg-violet-700 text-[8px] font-black text-white"
								aria-hidden="true">PK</span
							>PKUBersua</span
						><span class="text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4">{price(event)}</span>
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
					<p class="mt-1 text-sm text-[#66747a]">Lihat apa yang sudah kita selenggarakan.</p>
				</div>
				{#if data.pastEventsTotal > 6}<a class="text-xs font-bold text-[#0a5350]" href="/events"
						>Lihat semua</a
					>{/if}
			</div>
		</section>{/if}
	<section id="communities" class="pt-11">
		<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
			<div class="max-w-[36rem]">
				<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">
					Komunitas Populer
				</h2>
				<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
					Temukan circle baru, bertukar ide, dan tumbuh bersama komunitas lokal.
				</p>
			</div>
			<a
				class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
				href="#communities"
			>
				Lihat semua komunitas
			</a>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			{#each communities as [name, , description, avatar]}<article
					class="group flex min-h-[280px] flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-center transition duration-200 hover:-translate-y-1 hover:border-[#0a5350]/25 hover:shadow-[0_14px_36px_rgba(7,61,61,0.10)] motion-reduce:transform-none motion-reduce:transition-none"
				>
					<span
						class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ffefc5] text-amber-500 transition-colors group-hover:bg-[#f7b91d] group-hover:text-[#073d3d]"
					>
						<span class="text-lg font-black tracking-tight">{avatar}</span>
					</span>
					<h3 class="mt-4 text-[15px] font-bold leading-5 text-ink">{name}</h3>
					<p class="mt-2 max-w-[18rem] text-xs leading-[1.7] text-[#66747a]">{description}</p>
					<button
						type="button"
						class="mt-auto min-h-9 w-full rounded-xl bg-[#073d3d] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#0a5350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-2 active:translate-y-px"
						aria-label={`Bergabung dengan ${name}`}
						onclick={() => showToast(`Bergabung dengan ${name}`)}
					>
						Join Community
					</button>
				</article>{/each}
		</div>
		<div
			class="mt-8 grid min-h-[138px] overflow-hidden rounded-2xl border border-[#edf0f4] bg-gradient-to-r from-[#f9f8ff] via-white to-[#fffdf3] sm:grid-cols-2 lg:grid-cols-5"
		>
			<div class="p-5 lg:col-span-1 lg:p-6">
				<h3 class="font-black text-[#0a5350]">Kenapa PKUBersua?</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Semua yang kamu butuhkan untuk bertumbuh, belajar, dan bertemu.
				</p>
			</div>
			<div class="min-h-[138px] border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
				<CalendarDays size={23} class="mb-2 text-amber-500" />
				<h3 class="text-[15px] font-black text-[#0a5350]">Temukan Event</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
			<div class="min-h-[138px] border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
				<Users size={23} class="mb-2 text-amber-500" />
				<h3 class="text-[15px] font-black text-[#0a5350]">Bangun Relasi</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
			<div class="min-h-[138px] border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
				<Users size={23} class="mb-2 text-amber-500" />
				<h3 class="text-[15px] font-black text-[#0a5350]">Ikut Komunitas</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
			<div class="min-h-[138px] border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
				<Rocket size={23} class="mb-2 text-amber-500" />
				<h3 class="text-[15px] font-black text-[#0a5350]">Kembangkan Diri</h3>
				<p class="mt-1 text-xs leading-5 text-[#66747a]">
					Bertemu, belajar, dan berkembang bersama.
				</p>
			</div>
		</div>
		<div
			class="relative mt-8 grid gap-6 rounded-2xl border border-slate-100 bg-gradient-to-r from-[#142a61] to-[#4c188b] p-6 text-white lg:grid-cols-[1.15fr_1fr] lg:items-center"
		>
			<img
				src="/images/hero/rebung.svg"
				alt=""
				aria-hidden="true"
				class="absolute -left-3 top-2 h-[90px] w-[90px] -rotate-12 object-contain opacity-15"
			/>
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
					class="min-h-11 min-w-0 flex-1 rounded-lg px-3 text-sm text-ink outline-none"
				/><button class="min-h-11 rounded-lg bg-[#f7b91d] px-6 text-xs font-semibold text-ink"
					>Berlangganan</button
				>
			</form>
		</div>
	</section>
	<section id="articles" class="pt-11">
		<div class="mb-5 flex items-end justify-between">
			<div>
				<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">
					Artikel & Blog Terbaru
				</h2>
				<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
					Insight dan cerita dari komunitas Pekanbaru.
				</p>
			</div>
			<a
				class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
				href="#articles"
			>
				Lihat semua artikel
			</a>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each articles as article}<article
					class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
				>
					<div class="h-40 bg-gradient-to-br from-[#2e3230] to-[#315c53]"></div>
					<div class="flex min-h-[138px] flex-col p-4">
						<div class="flex items-center justify-between gap-3">
							<span class="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700"
								>Komunitas</span
							>
							<span class="text-xs leading-5 text-[#66747a]">12 Agu 2026</span>
						</div>
						<h3 class="mt-3 text-[15px] font-black leading-5">{article}</h3>
						<div class="mt-auto flex items-center gap-2 text-xs leading-5 text-[#66747a]">
							<span
								class="grid h-6 w-6 place-items-center rounded-full bg-violet-700 text-[8px] font-black text-white"
								aria-hidden="true">PK</span
							>
							<span>PKUBersua · 5 min read</span>
						</div>
					</div>
				</article>{/each}
		</div>
		<div
			id="partners"
			class="relative my-11 overflow-hidden rounded-[28px] border border-[#32267a] bg-gradient-to-r from-[#142a61] to-[#4c188b] px-5 py-7 text-white sm:px-8 sm:py-9"
		>
			<div
				class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#f7b91d]/10 blur-2xl"
			></div>
			<img
				src="/images/hero/rebung.svg"
				alt=""
				aria-hidden="true"
				class="pointer-events-none absolute -right-8 top-[42%] h-[310px] w-[310px] -translate-y-1/2 -rotate-12 object-contain opacity-[0.12]"
			/>
			<div class="relative z-10 grid items-start gap-6 lg:grid-cols-[1fr_auto]">
				<div class="max-w-3xl">
					<p class="text-[10px] font-extrabold tracking-[0.18em] text-[#ffd66f]">
						PARTNERSHIP ECOSYSTEM
					</p>
					<h2 class="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-[30px]">
						Tumbuh bersama partner yang
						<span class="text-[#ffd66f]">percaya pada Pekanbaru.</span>
					</h2>
					<p class="mt-2 max-w-2xl text-sm leading-6 text-white/70">
						Kami membuka kolaborasi untuk brand, komunitas, dan institusi yang ingin menciptakan
						dampak nyata melalui event lokal.
					</p>
				</div>
				<a
					href="#partners"
					class="inline-flex items-center text-sm font-semibold text-[#ffd66f] underline decoration-2 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd66f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#32267a]"
					onclick={() => showToast("Kami akan menghubungi kamu")}
				>
					Ingin Jadi Partner?
				</a>
			</div>
			<div class="relative z-10 mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
				{#each ["IDCLOUDHOST", "gojek", "BCA", "OVO", "ruangguru", "wondr"] as partner}<div
						class="grid min-h-[58px] place-items-center rounded-xl border border-white/15 bg-white/95 px-3 text-sm font-bold text-[#24383c] transition hover:-translate-y-0.5 hover:bg-white motion-reduce:transform-none"
					>
						{partner}
					</div>{/each}
			</div>
		</div>
	</section>
</main>

<footer class="bg-[#032f2f] pb-5 pt-9 text-white">
	<div
		class="mx-auto grid w-full max-w-[1180px] gap-8 px-3 sm:grid-cols-2 lg:grid-cols-[1.55fr_repeat(4,1fr)] lg:px-4"
	>
		<div class="sm:col-span-2 lg:col-span-1">
			<a href="#home" class="font-extrabold">PKUBersua</a>
			<p class="mt-4 w-full max-w-none text-xs leading-5 text-white/65">
				Platform komunitas dan event terbaik di Pekanbaru untuk bertemu, belajar, dan bertumbuh
				bersama.
			</p>
			<a
				href="mailto:contact@pkubersua.com"
				class="mt-4 inline-flex text-xs font-semibold text-[#ffd66f] underline decoration-white/30 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#032f2f]"
			>
				contact@pkubersua.com
			</a>
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
