<script lang="ts" module>
	import { TrendingDown, TrendingUp } from "@lucide/svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type StatCardTrend = "up" | "down";

	export type StatCardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title: string;
		value: string | number;
		change?: string;
		trend?: StatCardTrend;
		icon?: Snippet;
		iconClass?: string;
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	let {
		title,
		value,
		change,
		trend,
		icon,
		iconClass = "bg-muted",
		class: className,
		ref = $bindable(null),
		...restProps
	}: StatCardProps = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		"rounded-xl border border-hairline bg-canvas p-6 shadow-sm transition-shadow hover:shadow-md",
		className
	)}
	{...restProps}
>
	<div class="flex items-center justify-between">
		{#if icon}
			<div class={cn("flex h-12 w-12 items-center justify-center rounded-lg", iconClass)}>
				{@render icon()}
			</div>
		{:else}
			<div></div>
		{/if}
		{#if change}
			<div
				class={cn(
					"flex items-center gap-1 rounded-full px-2 py-1 text-[0.75rem] font-medium",
					trend === "up" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
				)}
			>
				{#if trend === "up"}
					<TrendingUp class="size-3" />
				{:else}
					<TrendingDown class="size-3" />
				{/if}
				{change}
			</div>
		{/if}
	</div>
	<div class="mt-4">
		<p class="text-[0.875rem] text-muted-foreground">{title}</p>
		<p class="mt-1 text-[1.5rem] font-bold text-ink">{value}</p>
	</div>
</div>
