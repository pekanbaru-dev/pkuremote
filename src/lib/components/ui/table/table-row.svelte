<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableRowProps } from "./table.svelte";

	let { class: className, children }: TableRowProps = $props();
</script>

<tr
	class={cn(
		"border-b border-hairline transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted",
		className
	)}
>
	{@render children?.()}
</tr>
