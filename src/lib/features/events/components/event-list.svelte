<script lang="ts" module>
	import type { Event } from "../types.ts";
	import EventCard from "./event-card.svelte";
	import { cn } from "$lib/utils.js";

	export type EventListProps = {
		events: Event[];
		class?: string;
	};
</script>

<script lang="ts">
	let { events, class: className }: EventListProps = $props();
</script>

<ul class={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
	{#each events as event (event.id)}
		<li>
			<EventCard {event} />
		</li>
	{/each}
</ul>
