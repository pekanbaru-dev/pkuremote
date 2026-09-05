<script lang="ts" module>
	import type { Event, EventCategory } from "../types.ts";

	export type EventCardProps = {
		event: Event;
		class?: string;
	};

	const MONTHS_ID = ["Jan", "Feb", "Mar", "Mei", "Jun", "Juli", "Agu", "Sep", "Okt", "Nov", "Des"];

	function formatDate(iso: string): string {
		const d = new Date(iso);
		const month = MONTHS_ID[d.getMonth()];
		return `${month} ${d.getDate()}, ${d.getFullYear()}`;
	}

	function ctaLabel(category: EventCategory | undefined): string {
		if (category === "workshop") return "Book Now";
		if (category === "meetup" || category === "talk") return "RSVP";
		return "Register";
	}
</script>

<script lang="ts">
	let { event, class: className }: EventCardProps = $props();

	const dateLabel = $derived(formatDate(event.startsAt));
	const cta = $derived(ctaLabel(event.category));
</script>

<!--
  Outer wrapper is a <div> (not an <a>) so the category pills and the body
  link can be sibling navigable elements without nesting <a> inside <a>.
  - The body link covers the banner, title, and excerpt (the "main" click
    target — clicking anywhere on the card body goes to the detail page).
  - Each category pill is its own <a> to /events?category={slug} for the
    filtered listing.
  - The date row and CTA are plain <div>/<span> (decorative).
-->
<div
	class="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest shadow-md transition-shadow hover:-translate-y-1 hover:shadow-xl {className ??
		''}"
>
	<a href="/events/{event.slug}" aria-label={event.title} class="flex flex-col flex-1">
		<div class="h-52 overflow-hidden bg-surface-container">
			{#if event.bannerUrl}
				<img
					src={event.bannerUrl}
					alt=""
					loading="eager"
					decoding="async"
					width="1600"
					height="900"
					class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			{:else}
				<div class="w-full h-full bg-surface-container flex items-center justify-center">
					<span class="font-label text-[0.75rem] uppercase tracking-wide text-muted-foreground"
						>Event</span
					>
				</div>
			{/if}
		</div>

		<div class="flex flex-1 flex-col gap-3 p-4">
			<h3 class="font-display text-headline-md font-semibold leading-tight text-ink">
				{event.title}
			</h3>
			<p class="text-on-surface-variant text-body-md line-clamp-2">{event.excerpt}</p>
		</div>
	</a>

	{#if event.categories.length > 0}
		<div class="px-md pb-3 flex gap-sm flex-wrap">
			{#each event.categories as category, i (category.id)}
				<a
					href="/events?category={encodeURIComponent(category.slug)}"
					class="px-3 py-1 rounded-full text-label-md font-medium transition-colors {i % 2 === 0
						? 'bg-primary/10 text-primary hover:bg-primary/20'
						: 'bg-secondary/10 text-secondary hover:bg-secondary/20'}"
				>
					{category.name}
				</a>
			{/each}
		</div>
	{/if}

	<div class="mt-auto flex items-center justify-between px-4 pb-4">
		<div class="flex items-center text-on-surface-variant font-label text-label-md">
			<span class="material-symbols-outlined text-base mr-1">calendar_today</span>
			<span>{dateLabel}</span>
		</div>
		<span
			class="text-primary font-label font-bold text-label-md hover:translate-x-1 transition-transform"
		>
			{cta}
		</span>
	</div>
</div>
