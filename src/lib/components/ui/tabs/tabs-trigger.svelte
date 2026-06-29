<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Tabs as TabsPrimitive } from "bits-ui";
	import type { TabsTriggerProps } from "./tabs.svelte";

	let { class: className, value, ref = $bindable(null), children }: TabsTriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	{value}
	class={cn(
		"inline-flex cursor-pointer items-center justify-center rounded-sm px-3 py-1 text-[0.875rem] font-medium whitespace-nowrap transition-all data-[state=active]:bg-canvas data-[state=active]:text-ink data-[state=active]:shadow-sm disabled:pointer-events-none disabled:opacity-50",
		className
	)}
>
	{@render children?.()}
</TabsPrimitive.Trigger>
