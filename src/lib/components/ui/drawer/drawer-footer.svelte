<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { DrawerFooterProps } from "./drawer.svelte";

	let { class: className, children }: DrawerFooterProps = $props();
</script>

<div class={cn("mt-auto flex flex-col gap-2", className)}>
	{@render children?.()}
</div>
