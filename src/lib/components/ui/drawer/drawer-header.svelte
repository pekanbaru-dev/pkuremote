<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { DrawerHeaderProps } from "./drawer.svelte";

	let { class: className, children }: DrawerHeaderProps = $props();
</script>

<div class={cn("flex flex-col gap-1.5", className)}>
	{@render children?.()}
</div>
