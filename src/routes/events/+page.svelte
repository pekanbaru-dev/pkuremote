<script lang="ts">
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import type { PageData } from "./$types.js";
	import { EventList } from "$lib/features/events";
	import { EmptyState } from "$lib/components/ui/empty-state";

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

<header class="sticky top-0 z-10 border-b border-hairline bg-canvas/90 backdrop-blur">
	<div class="container-page flex items-center justify-between py-4">
		<a
			href="/"
			class="font-display text-lg font-bold tracking-tight text-ink"
			aria-label="PKUBersua — beranda"
		>
			PKUBersua
		</a>
		<a class="link-quiet text-label-lg text-on-surface-variant" href="/">Kembali ke beranda</a>
	</div>
</header>

<main class="container-page py-[clamp(3rem,7vw,5rem)]">
	<div class="mb-xl flex flex-col gap-3">
		<h1
			class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary"
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
		<h2 id="upcoming-heading" class="font-headline-md text-headline-md text-ink">
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
			<h2 id="past-heading" class="font-headline-md text-headline-md text-ink">Event Sebelumnya</h2>
			<EventList events={past} />
		</section>
	{/if}
</main>

<footer class="container-page py-12">
	<p class="label-meta">© 2026 PKUBersua</p>
</footer>
