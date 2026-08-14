<script lang="ts">
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import type { PageData } from "./$types.js";
	import { EventList } from "$lib/features/events";
	import { EmptyState } from "$lib/components/ui/empty-state";
	import SiteHeader from "$lib/components/site-header.svelte";

	let { data }: { data: PageData } = $props();
	const upcoming = $derived(data.upcoming);
	const past = $derived(data.past);
	const filter = $derived(data.filter);

	const canonical = $derived(`${PUBLIC_SITE_URL}/events`);
	const ogImage = $derived(`${PUBLIC_SITE_URL}/og-default.png`);
	const title = $derived(filter ? `Event ${filter.name} — PKUBersua` : "Event — PKUBersua");
	const description = $derived(
		filter
			? `Event PKUBersua kategori ${filter.name} — kumpul, belajar, dan bersua di Pekanbaru.`
			: "Daftar event PKUBersua — kumpul, belajar, dan bersua di Pekanbaru."
	);
	const emptyMessage = $derived(
		filter
			? `Belum ada event '${filter.name}' — coba hapus filter atau pilih kategori lain.`
			: "Belum ada event yang akan datang — pantau terus untuk kabar terbaru."
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="PKUBersua" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<SiteHeader current="events" />

<main class="container-page font-body py-[clamp(3rem,7vw,5rem)]">
	<div class="mb-xl flex flex-col gap-3">
		<h1
			class="font-display text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.05] tracking-[-.04em] text-primary"
		>
			{filter ? `Event ${filter.name}` : "Semua Event"}
		</h1>
		<p class="text-on-surface-variant max-w-prose">
			Workshop, talks, dan meetup lintas profesi — semua kumpul komunitas Pekanbaru di sini.
		</p>
	</div>

	{#if filter}
		<div
			class="mb-lg inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-container-low px-4 py-2 text-label-md text-ink"
			data-testid="filter-chip"
		>
			<span>Filter: <strong>{filter.name}</strong></span>
			<a class="link-quiet text-on-surface-variant" href="/events" data-testid="filter-clear-link"
				>× Hapus filter</a
			>
		</div>
	{/if}

	<section
		id="upcoming"
		class="scroll-mt-20 mb-xl flex flex-col gap-md"
		aria-labelledby="upcoming-heading"
	>
		<h2 id="upcoming-heading" class="font-display text-2xl font-black tracking-[-.03em] text-ink">
			Event Akan Datang
		</h2>
		{#if upcoming.length > 0}
			<EventList events={upcoming} />
		{:else}
			<EmptyState title="Belum ada event" description={emptyMessage} />
		{/if}
	</section>

	{#if past.length > 0}
		<section id="past" class="scroll-mt-20 flex flex-col gap-md" aria-labelledby="past-heading">
			<h2 id="past-heading" class="font-display text-2xl font-black tracking-[-.03em] text-ink">
				Event Sebelumnya
			</h2>
			<EventList events={past} />
		</section>
	{/if}
</main>

<footer class="mt-12 bg-[#073d3d] py-12 text-white">
	<div class="container-page"><p class="label-meta text-white/60">© 2026 PKUBersua</p></div>
</footer>
