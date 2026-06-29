<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Tabs as TabsPrimitive } from "bits-ui";
	import type { TabsContentProps } from "./tabs.svelte";

	let { class: className, value, ref = $bindable(null), children }: TabsContentProps = $props();
</script>

<TabsPrimitive.Content
	bind:ref
	{value}
	class={cn(
		"mt-2 ring-offset-canvas focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:outline-none",
		className
	)}
>
	{@render children?.()}
</TabsPrimitive.Content>
