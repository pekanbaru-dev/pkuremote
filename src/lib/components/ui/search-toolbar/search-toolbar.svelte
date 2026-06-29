<script lang="ts" module>
	import { Filter, Search } from "@lucide/svelte";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SearchToolbarProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value: string;
		onValueChange: (value: string) => void;
		placeholder?: string;
		showFilterButton?: boolean;
		onFilterClick?: () => void;
		filterLabel?: string;
	};
</script>

<script lang="ts">
	let {
		value = $bindable(""),
		onValueChange,
		placeholder = "Search...",
		showFilterButton = false,
		onFilterClick,
		filterLabel = "Filter",
		class: className,
		ref = $bindable(null),
		...restProps
	}: SearchToolbarProps = $props();
</script>

<div
	bind:this={ref}
	class={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
	{...restProps}
>
	<div class="flex-1">
		<Input
			{placeholder}
			{value}
			oninput={(e) => {
				const v = (e.currentTarget as HTMLInputElement).value;
				value = v;
				onValueChange(v);
			}}
		/>
		<Search class="hidden" />
	</div>
	{#if showFilterButton}
		<Button variant="outline" size="default" onclick={onFilterClick}>
			<Filter class="mr-2 size-4" />
			{filterLabel}
		</Button>
	{/if}
</div>
