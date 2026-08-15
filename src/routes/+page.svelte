<script lang="ts">
	import { onMount } from "svelte";
	import { buildLandingJsonLd } from "$lib/features/events";
	import {
		HeroSection,
		CategoryTiles,
		EventsSection,
		CommunitiesSection,
		ArticlesSection,
		PartnersCta
	} from "$lib/features/landing";
	import SiteFooter from "$lib/components/site-footer.svelte";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();

	const landingJsonLd = buildLandingJsonLd();
	let toast = $state("");

	const showToast = (message: string) => {
		toast = message;
		setTimeout(() => (toast = ""), 2600);
	};

	onMount(() => {
		const handler = (e: Event) => showToast((e as CustomEvent<string>).detail);
		window.addEventListener("landing-toast", handler);
		return () => window.removeEventListener("landing-toast", handler);
	});
</script>

<HeroSection {landingJsonLd} />

<main class="mx-auto w-full max-w-[1180px] px-3 pb-10 md:px-4">
	<CategoryTiles />
	<EventsSection events={data.events} pastEventsTotal={data.pastEventsTotal} {showToast} />
	<CommunitiesSection {showToast} />
	<ArticlesSection />
	<PartnersCta {showToast} />
</main>

<SiteFooter />

{#if toast}
	<div
		class="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"
		role="status"
		aria-live="polite"
	>
		{toast}
	</div>
{/if}
