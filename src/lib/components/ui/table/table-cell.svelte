<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableCellProps } from "./table.svelte";

	let { class: className, children }: TableCellProps = $props();
</script>

<td class={cn("px-3 align-middle text-ink", className)}>
	{@render children?.()}
</td>
