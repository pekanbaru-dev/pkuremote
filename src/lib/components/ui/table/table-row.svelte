<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn(
		"hover:bg-surface-container-high data-[state=selected]:bg-surface-container-highest border-b transition-colors",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
