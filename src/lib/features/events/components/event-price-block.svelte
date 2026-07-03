<script lang="ts" module>
	import type { Event } from "../types.ts";
	import { cn } from "$lib/utils.js";

	export type EventPriceBlockProps = {
		event: Event;
		class?: string;
	};

	function formatIdr(value: number): string {
		return `Rp ${value.toLocaleString("id-ID")}`;
	}
</script>

<script lang="ts">
	let { event, class: className }: EventPriceBlockProps = $props();

	const isFree = $derived(event.priceNormal === undefined);
	const hasPromo = $derived(
		event.pricePromo !== undefined &&
			event.priceNormal !== undefined &&
			event.pricePromo < event.priceNormal
	);
</script>

<div class={cn("flex flex-col gap-1", className)}>
	{#if isFree}
		<span
			class="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[0.875rem] font-semibold text-primary"
		>
			GRATIS
		</span>
	{:else if hasPromo}
		<div class="flex items-baseline gap-2">
			<span class="font-display text-[1.5rem] font-bold text-primary">
				{formatIdr(event.pricePromo!)}
			</span>
			<span class="text-[0.875rem] text-muted-foreground line-through">
				{formatIdr(event.priceNormal!)}
			</span>
			<span
				class="inline-flex items-center rounded-full bg-primary-container px-2 py-0.5 text-[0.6875rem] font-semibold text-on-primary-container"
			>
				Promo
			</span>
		</div>
	{:else}
		<span class="font-display text-[1.5rem] font-bold text-ink">
			{formatIdr(event.priceNormal!)}
		</span>
	{/if}
</div>
