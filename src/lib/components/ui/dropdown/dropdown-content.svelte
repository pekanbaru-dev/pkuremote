<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { DropdownMenuContentProps } from "./dropdown.svelte";

	let {
		class: className,
		sideOffset = 4,
		ref = $bindable(null),
		children
	}: DropdownMenuContentProps = $props();
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.Content
		bind:ref
		{sideOffset}
		class={cn(
			"z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border border-hairline bg-canvas p-1 text-ink shadow-md",
			className
		)}
	>
		{@render children?.()}
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
