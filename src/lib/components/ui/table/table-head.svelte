<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableHeadProps } from "./table.svelte";

	let { class: className, children }: TableHeadProps = $props();
</script>

<th
	class={cn(
		"h-10 px-3 text-left align-middle text-[0.75rem] font-semibold tracking-wide text-muted-foreground uppercase",
		className
	)}
>
	{@render children?.()}
</th>
