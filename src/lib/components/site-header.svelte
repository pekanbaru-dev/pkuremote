<script lang="ts">
	/* eslint-disable svelte/no-restricted-html-elements */
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import Search from "@lucide/svelte/icons/search";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import Menu from "@lucide/svelte/icons/menu";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";

	let { current = "", variant = "dark" }: { current?: "events" | ""; variant?: "dark" | "light" } = $props();
	const user = $derived(page.data.user);
	const accountHref = $derived(user ? "/auth/myprofile" : "/login");
	const accountLabel = $derived(user ? "Dashboard" : "Login / Sign Up");
	let mobileMenuOpen = $state(false);
	let keyword = $state("");

	const isLight = $derived(variant === "light");

	async function submitSearch(event: SubmitEvent) {
		event.preventDefault();
		await goto(keyword.trim() ? `/events?q=${encodeURIComponent(keyword.trim())}` : "/events");
	}
</script>

<header
	class={isLight
		? "sticky top-0 z-40 border-b border-hairline bg-white/95 font-body text-ink shadow-sm backdrop-blur"
		: "sticky top-0 z-40 border-b border-white/10 bg-[#073d3d]/95 font-body text-white shadow-md backdrop-blur"}
>
	<nav
		class="mx-auto flex min-h-[72px] w-full max-w-[1180px] items-center justify-between gap-4 px-3 md:px-4"
		aria-label="Navigasi utama"
	>
		<a href="/" class="flex items-center gap-2.5 font-extrabold" aria-label="PKUBersua — beranda">
			<span
				class="grid h-9 w-9 rotate-[30deg] place-items-center rounded-xl bg-gradient-to-br from-emerald-300 via-amber-300 to-white shadow-lg"
				><span class="h-4 w-4 rounded border-2 border-[#073d3d]"></span></span
			>
			<span class="grid leading-none"
				><b>PKUBersua</b><small class={`mt-1 text-[9px] font-medium ${isLight ? "text-ink/50" : "text-white/70"}`}
					>Komunitas, Event, Cerita</small
				></span
			>
		</a>
		<div class="hidden items-center gap-6 text-sm font-semibold lg:flex">
			<a class={current === "" ? (isLight ? "text-primary" : "text-[#ffd66f]") : (isLight ? "text-ink/70 hover:text-primary" : "text-white/85 hover:text-[#ffd66f]")} href="/">Explore</a>
			<a class={current === "events" ? (isLight ? "text-primary" : "text-[#ffd66f]") : (isLight ? "text-ink/70 hover:text-primary" : "text-white/85 hover:text-[#ffd66f]")} href="/events">Events</a>
			<a class={isLight ? "text-ink/70 hover:text-primary" : "text-white/85 hover:text-[#ffd66f]"} href="/#communities">Communities</a>
			<a class={isLight ? "text-ink/70 hover:text-primary" : "text-white/85 hover:text-[#ffd66f]"} href="/#articles">To Dos <span class="text-pink-400">●</span></a>
			<a class={isLight ? "text-ink/70 hover:text-primary" : "text-white/85 hover:text-[#ffd66f]"} href="/#partners">For Organizers</a>
		</div>
		<div class="flex items-center gap-2">
			<form
				class={isLight
					? "hidden h-10 items-center gap-2 rounded-xl border border-hairline bg-surface-container px-3 lg:flex"
					: "hidden h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 lg:flex"}
				onsubmit={submitSearch}
			>
				<Search size={15} class={isLight ? "text-ink/40" : "text-white/60"} /><input
					bind:value={keyword}
					class={isLight ? "w-40 bg-transparent text-xs outline-none placeholder:text-ink/40" : "w-40 bg-transparent text-xs outline-none placeholder:text-white/55"}
					placeholder="Cari event..."
					aria-label="Cari event"
				/>
			</form>
			<button
				class={isLight
					? "hidden min-h-10 items-center gap-2 rounded-xl border border-hairline bg-surface-container px-3 text-xs font-semibold xl:flex"
					: "hidden min-h-10 items-center gap-2 rounded-xl border border-white/35 bg-slate-950/20 px-3 text-xs font-semibold xl:flex"}
				><MapPin size={15} />Pekanbaru<ChevronDown size={13} /></button
			>
			<a
				class="hidden min-h-10 items-center rounded-xl bg-[#f7b91d] px-4 text-xs font-semibold text-ink sm:flex"
				href={accountHref}>{accountLabel}</a
			>
			<button
				class={isLight
					? "grid h-10 w-10 place-items-center rounded-xl border border-hairline bg-surface-container lg:hidden"
					: "grid h-10 w-10 place-items-center rounded-xl border border-white/35 bg-slate-950/20 lg:hidden"}
				aria-label="Buka menu"
				aria-expanded={mobileMenuOpen}
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}><Menu size={19} /></button
			>
		</div>
	</nav>
	{#if mobileMenuOpen}
		<div
			class={isLight
				? "absolute left-3 right-3 top-[68px] z-50 grid gap-1 rounded-2xl border border-hairline bg-white p-4 shadow-xl lg:hidden"
				: "absolute left-3 right-3 top-[68px] z-50 grid gap-1 rounded-2xl border border-white/15 bg-[#073d3d] p-4 shadow-2xl lg:hidden"}
		>
			<form
				class="mb-2 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-ink border border-hairline"
				onsubmit={submitSearch}
			>
				<Search size={16} /><input
					bind:value={keyword}
					class="min-w-0 flex-1 bg-transparent text-sm outline-none"
					placeholder="Cari event..."
					aria-label="Cari event"
				/>
			</form>
			<a class={`rounded-xl px-3 py-2.5 text-sm font-semibold ${isLight ? "text-ink" : "text-white"}`} href="/events">Events</a>
			<a class={`rounded-xl px-3 py-2.5 text-sm font-semibold ${isLight ? "text-ink" : "text-white"}`} href="/#communities">Communities</a>
			<a class={`rounded-xl px-3 py-2.5 text-sm font-semibold ${isLight ? "text-ink" : "text-white"}`} href="/#articles">To Dos</a>
			<a class={`rounded-xl px-3 py-2.5 text-sm font-semibold ${isLight ? "text-ink" : "text-white"}`} href={accountHref}>{accountLabel}</a>
		</div>
	{/if}
</header>
