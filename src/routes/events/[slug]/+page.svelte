<script lang="ts">
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import type { PageData } from "./$types.js";
	import {
		EventDetailHero,
		EventBookingCta,
		EventPriceBlock,
		EventQuotaMeter,
		buildEventJsonLd
	} from "$lib/features/events";

	let { data }: { data: PageData } = $props();
	const event = $derived(data.event);

	const canonical = $derived(`${PUBLIC_SITE_URL}/events/${event.slug}`);
	const ogImage = $derived(event.bannerUrl ? event.bannerUrl : `${PUBLIC_SITE_URL}/og-default.png`);
	const description = $derived(event.excerpt.slice(0, 160));
	const jsonLdScript = $derived(buildEventJsonLd(event));
</script>

<svelte:head>
	<title>{event.title} — PKUBersua</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={`${event.title} — PKUBersua`} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="PKUBersua" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${event.title} — PKUBersua`} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
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
	</div>
</header>

<main class="container-page py-[clamp(3rem,7vw,5rem)]">
	<article class="flex flex-col gap-12">
		<EventDetailHero {event} />

		<div class="grid grid-cols-1 gap-12 desktop:grid-cols-3">
			<div class="desktop:col-span-2">
				<div class="measure-prose flex flex-col gap-4">
					{#each event.body.split("\n\n") as paragraph, i (i)}
						<p class="text-[1rem] leading-relaxed text-ink">{paragraph}</p>
					{/each}
				</div>
			</div>

			<aside class="flex flex-col gap-6 desktop:sticky desktop:top-24 desktop:self-start">
				<EventPriceBlock {event} />
				<EventQuotaMeter {event} />
				<EventBookingCta {event} mode="desktop" />
			</aside>
		</div>
	</article>

	<EventBookingCta {event} mode="mobile" />
</main>

<footer class="container-page py-12">
	<p class="label-meta">© 2026 PKUBersua</p>
</footer>
