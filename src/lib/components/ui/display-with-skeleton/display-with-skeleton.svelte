<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type DisplayWithSkeletonProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		isLoading: boolean;
		skeletonClass?: string;
		skeletonLines?: number;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		isLoading,
		skeletonClass = "h-6 max-w-[90%]",
		skeletonLines = 1,
		children,
		class: className,
		...restProps
	}: DisplayWithSkeletonProps = $props();
</script>

<div class={cn("inline-block", className)} {...restProps}>
	{#if isLoading}
		<div class="flex flex-col gap-2" aria-busy="true" aria-live="polite">
			{#each Array.from({ length: skeletonLines }), i (i)}
				<div class={cn("animate-pulse rounded bg-muted", skeletonClass)}></div>
			{/each}
		</div>
	{:else if children}
		{@render children()}
	{/if}
</div>
