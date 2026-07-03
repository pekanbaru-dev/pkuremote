<script lang="ts" module>
	import type { Event } from "../types.ts";
	import { cn } from "$lib/utils.js";

	export type EventQuotaMeterProps = {
		event: Event;
		class?: string;
	};
</script>

<script lang="ts">
	let { event, class: className }: EventQuotaMeterProps = $props();

	const show = $derived(event.quota !== undefined && event.remainingSlots !== undefined);
	const percentFilled = $derived(
		show && event.quota! > 0
			? Math.round(((event.quota! - event.remainingSlots!) / event.quota!) * 100)
			: 0
	);
	const isFull = $derived(show && event.remainingSlots === 0);
</script>

{#if show}
	<div class={cn("flex flex-col gap-2", className)}>
		<div class="flex items-center justify-between">
			<span class="label-meta">Slot tersedia</span>
			<span class="font-label text-[0.8125rem] font-medium text-ink tabular-nums">
				{event.remainingSlots}/{event.quota}
			</span>
		</div>
		<div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
			<div
				class={cn(
					"h-full rounded-full transition-all duration-500",
					isFull ? "bg-destructive" : "bg-primary"
				)}
				style="width: {percentFilled}%"
			></div>
		</div>
	</div>
{/if}
