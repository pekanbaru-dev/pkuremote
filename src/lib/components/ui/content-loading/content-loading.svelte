<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContentLoadingProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		lineNumber?: number;
	};

	const weightSkeleton = ["max-w-[30%]", "max-w-[90%]", "max-w-[60%]", "max-w-[80%]"];
</script>

<script lang="ts">
	let { lineNumber = 4, class: className, ...restProps }: ContentLoadingProps = $props();

	const lines = $derived(
		Array.from({ length: lineNumber }, (_, i) => ({
			id: `line-${i + 1}`,
			width: weightSkeleton[i] ?? weightSkeleton[0]
		}))
	);
</script>

<div
	role="status"
	aria-label="Loading content"
	class={cn("my-4 flex flex-col gap-3", className)}
	{...restProps}
>
	{#each lines as line (line.id)}
		<div class={cn("h-6 animate-pulse rounded bg-muted", line.width)}></div>
	{/each}
</div>
