<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { DropdownMenuItemProps } from "./dropdown.svelte";

	let {
		class: className,
		inset = false,
		ref = $bindable(null),
		children
	}: DropdownMenuItemProps = $props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	class={cn(
		"relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[0.875rem] outline-none transition-colors select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
		inset && "pl-8",
		className
	)}
>
	{@render children?.()}
</DropdownMenuPrimitive.Item>
