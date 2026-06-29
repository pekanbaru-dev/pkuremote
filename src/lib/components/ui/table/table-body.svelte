<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableBodyProps } from "./table.svelte";

	let { class: className, children }: TableBodyProps = $props();
</script>

<tbody class={cn("[&_tr:last-child]:border-0", className)}>
	{@render children?.()}
</tbody>
