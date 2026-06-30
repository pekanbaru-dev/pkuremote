<script lang="ts" module>
	import type { Event, EventCategory } from "../types.ts";

	export type EventCardProps = {
		event: Event;
		class?: string;
	};

	const MONTHS_ID = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"Mei",
		"Jun",
		"Jul",
		"Agu",
		"Sep",
		"Okt",
		"Nov",
		"Des"
	];

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

<a
	href="/events/{event.slug}"
	aria-label={event.title}
	class="group flex flex-col block bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden transition-shadow hover:shadow-lg {className ??
		''}"
>
	<div class="h-48 overflow-hidden">
		{#if event.bannerUrl}
			<img
				src={event.bannerUrl}
				alt=""
				loading="lazy"
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

	<div class="p-md flex-1 flex flex-col gap-3">
		{#if event.categoryLabel || event.categorySecondary}
			<div class="flex gap-sm flex-wrap">
				{#if event.categoryLabel}
					<span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-md font-medium">
						{event.categoryLabel}
					</span>
				{/if}
				{#if event.categorySecondary}
					<span
						class="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-label-md font-medium"
					>
						{event.categorySecondary}
					</span>
				{/if}
			</div>
		{/if}

		<h3 class="font-display text-headline-md font-semibold leading-tight text-ink">
			{event.title}
		</h3>

		<p class="text-on-surface-variant text-body-md line-clamp-2">{event.excerpt}</p>

		<div class="flex items-center justify-between mt-auto">
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
</a>
