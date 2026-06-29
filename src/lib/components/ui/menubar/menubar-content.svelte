<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import type { MenubarContentProps } from "./menubar.svelte";

	let {
		class: className,
		align = "start",
		sideOffset = 8,
		ref = $bindable(null),
		children
	}: MenubarContentProps = $props();
</script>

<MenubarPrimitive.Portal>
	<MenubarPrimitive.Content
		bind:ref
		{align}
		{sideOffset}
		class={cn(
			"z-50 min-w-[12rem] overflow-hidden rounded-md border border-hairline bg-canvas p-1 text-ink shadow-md",
			className
		)}
	>
		{@render children?.()}
	</MenubarPrimitive.Content>
</MenubarPrimitive.Portal>
