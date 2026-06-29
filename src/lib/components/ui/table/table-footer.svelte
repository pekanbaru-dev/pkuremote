<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableFooterProps } from "./table.svelte";

	let { class: className, children }: TableFooterProps = $props();
</script>

<tfoot class={cn("border-t border-hairline bg-muted/40 font-medium", className)}>
	{@render children?.()}
</tfoot>
