<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	export type InputProps = WithElementRef<HTMLInputAttributes>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(),
		type = "text",
		...restProps
	}: InputProps = $props();
</script>

<input
	bind:this={ref}
	data-slot="input"
	{type}
	class={cn(
		"h-11 w-full rounded-md border border-outline bg-canvas px-3 text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{...restProps}
/>
