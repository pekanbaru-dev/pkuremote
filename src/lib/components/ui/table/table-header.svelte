<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableHeaderProps } from "./table.svelte";

	let { class: className, children }: TableHeaderProps = $props();
</script>

<thead class={cn("border-b border-hairline bg-muted/40", className)}>
	{@render children?.()}
</thead>
