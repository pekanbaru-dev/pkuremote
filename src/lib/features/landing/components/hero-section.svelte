<script lang="ts" module>
	export type HeroSectionProps = {
		landingJsonLd: string;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import Search from "@lucide/svelte/icons/search";
	import Menu from "@lucide/svelte/icons/menu";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";

	let { landingJsonLd }: HeroSectionProps = $props();

	const user = $derived(page.data.user);
	const accountHref = $derived(user ? "/myprofile" : "/login");
	const accountLabel = $derived(user ? "Dashboard" : "Login / Sign Up");

	let mobileMenuOpen = $state(false);
	let hasScrolled = $state(false);
	let keyword = $state("");

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

	const showToast = (message: string) => {
		window.dispatchEvent(new CustomEvent("landing-toast", { detail: message }));
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
	<!-- eslint-disable svelte/no-at-html-tags -->{@html landingJsonLd}<!-- eslint-enable svelte/no-at-html-tags -->
</svelte:head>

<header
	id="home"
	class="relative min-h-135 overflow-visible bg-[#073d3d] bg-[linear-gradient(180deg,rgba(3,23,32,.32),rgba(3,23,32,.88)),url('/images/hero/header.svg')] bg-cover bg-center bg-no-repeat text-white"
>
	<nav
		class={`fixed inset-x-0 top-0 z-50 h-18 w-full transition-colors duration-200 ${hasScrolled ? "border-b border-slate-200/70 bg-white/88 text-[#24383c] backdrop-blur-md" : "bg-transparent text-white"}`}
		aria-label="Navigasi utama"
	>
		<div
			class="mx-auto flex h-full w-full max-w-295 items-center justify-between gap-4 px-3 md:px-4"
		>
			<a href="#home" class="flex items-center gap-2.5 font-extrabold"
				><span
					class="grid h-9 w-9 rotate-30 place-items-center rounded-xl bg-linear-to-br from-emerald-300 via-amber-300 to-white shadow-lg"
					><span class="h-4 w-4 rounded border-2 border-[#073d3d]"></span></span
				><span class="grid leading-none"
					><b>PKUBersua</b><small
						class={`mt-1 text-[9px] font-medium ${hasScrolled ? "text-[#66747a]" : "text-white/70"}`}
						>Komunitas, Event, Cerita</small
					></span
				></a
			>
			<div class="hidden items-center gap-7 text-sm font-semibold lg:flex">
				<a href="#events">Explore</a><a href="#communities">Communities</a><a href="#events"
					>Events</a
				><a href="#articles">To Dos <span class="text-pink-400">●</span></a><a href="#partners"
					>Venues</a
				><a href="#partners">For Organizers</a>
			</div>
			<div class="flex items-center gap-2">
				<a
					class="hidden min-h-10 items-center rounded-xl bg-[#f7b91d] px-4 text-xs font-semibold text-ink sm:flex"
					href={accountHref}>{accountLabel}</a
				><Button
					class={`grid h-10 w-10 place-items-center rounded-xl border lg:hidden ${hasScrolled ? "border-slate-200 bg-slate-100 text-[#24383c]" : "border-white/35 bg-slate-950/20"}`}
					aria-label="Buka menu"
					aria-expanded={mobileMenuOpen}
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}><Menu size={19} /></Button
				>
			</div>
		</div>
	</nav>
	{#if mobileMenuOpen}
		<div
			class="absolute left-3 right-3 top-17 z-30 grid gap-1 rounded-2xl border border-white/15 bg-[#073d3df5] p-4 shadow-2xl lg:hidden"
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
	<div class="mx-auto w-full max-w-295 px-3 pb-20 pt-28 text-center md:px-4">
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
			class="mx-auto mt-8 w-full max-w-220 rounded-2xl bg-white/95 p-4 text-left text-ink shadow-[0_18px_50px_rgba(3,23,32,0.22)] sm:p-5"
			onsubmit={(event) => {
				event.preventDefault();
				showToast(keyword ? `Mencari "${keyword}" di Pekanbaru` : "Masukkan kata kunci pencarian");
			}}
		>
			<div class="grid gap-5 md:grid-cols-[1fr_auto]">
				<label
					class="flex min-h-14 items-center gap-4 rounded-xl border border-slate-300 bg-white px-5 transition focus-within:border-[#0a5350] focus-within:ring-2 focus-within:ring-[#0a5350]/10"
				>
					<Search size={17} class="text-slate-400" />
					<Input
						bind:value={keyword}
						type="search"
						placeholder="Cari event, komunitas, atau topik"
						class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
					/>
				</label>
				<Button
					class="min-h-14 w-full rounded-xl bg-[#f7b91d] px-7 text-sm font-semibold md:w-44"
					type="submit"
				>
					Temukan
				</Button>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-xs text-slate-500">
				<b class="text-slate-700">Trending:</b>
				{#each ["Teknologi", "Startup", "Desain", "Webinar", "Bisnis", "Gratis", "Weekend"] as trend (trend)}
					<Button
						type="button"
						variant="outline"
						class="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-[#0a5350] hover:text-[#0a5350]"
						onclick={() => (keyword = trend)}>{trend}</Button
					>{/each}
			</div>
		</form>
	</div>
</header>
