<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { TableCaptionProps } from "./table.svelte";

	let { class: className, children }: TableCaptionProps = $props();
</script>

<caption class={cn("mt-4 text-[0.875rem] text-muted-foreground", className)}>
	{@render children?.()}
</caption>
