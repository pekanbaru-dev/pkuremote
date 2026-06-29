<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { DialogFooterProps } from "./dialog.svelte";

	let { class: className, children }: DialogFooterProps = $props();
</script>

<div class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>
	{@render children?.()}
</div>
