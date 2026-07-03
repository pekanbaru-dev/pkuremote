<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		title,
		description,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title?: string;
		description?: string;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-state"
	class={cn(
		"flex flex-col items-center gap-2 rounded-xl border border-hairline bg-surface-container-lowest px-6 py-10 text-center",
		className
	)}
	{...restProps}
>
	{#if title}
		<h3 class="font-headline-md text-headline-md text-ink">{title}</h3>
	{/if}
	{#if description}
		<p class="text-on-surface-variant max-w-prose text-sm">{description}</p>
	{/if}
	{@render children?.()}
</div>
