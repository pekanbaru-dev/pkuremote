<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Tabs as TabsPrimitive } from "bits-ui";
	import type { TabsListProps } from "./tabs.svelte";

	let { class: className, ref = $bindable(null), children }: TabsListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	class={cn(
		"inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
		className
	)}
>
	{@render children?.()}
</TabsPrimitive.List>
