<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { DialogHeaderProps } from "./dialog.svelte";

	let { class: className, children }: DialogHeaderProps = $props();
</script>

<div class={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}>
	{@render children?.()}
</div>
