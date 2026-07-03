<script lang="ts" module>
	import type { Event } from "../types.ts";
	import { cn } from "$lib/utils.js";

	export type EventDetailHeroProps = {
		event: Event;
		class?: string;
	};

	// Formatter is exported so a unit test can pin the `timeZone` to
	// `Asia/Jakarta` and lock the rendered label to WIB regardless of the
	// server/browser locale (the original codex review 3502986909).
	export function formatDateLong(iso: string): string {
		return new Intl.DateTimeFormat("id-ID", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jakarta"
		}).format(new Date(iso));
	}
</script>

<script lang="ts">
	let { event, class: className }: EventDetailHeroProps = $props();

	const isPast = $derived(event.status === "past");
	const dateLabel = $derived(formatDateLong(event.startsAt));
</script>

<header class={cn("flex flex-col gap-6", className)}>
	{#if event.bannerUrl}
		<div class="aspect-[16/9] w-full overflow-hidden rounded-md bg-surface-container">
			<img
				src={event.bannerUrl}
				alt=""
				loading="lazy"
				decoding="async"
				width="1600"
				height="900"
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}

	<div class="flex flex-col gap-3">
		{#if isPast}
			<span
				class="inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-0.5 text-[0.75rem] font-medium text-muted-foreground"
			>
				Selesai
			</span>
		{:else}
			<span
				class="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.75rem] font-medium text-primary"
			>
				Akan datang
			</span>
		{/if}
		<h1
			class="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-ink"
		>
			{event.title}
		</h1>
		<p class="label-meta text-[0.9375rem]">
			{dateLabel} WIB · {event.location}
		</p>
	</div>
</header>
