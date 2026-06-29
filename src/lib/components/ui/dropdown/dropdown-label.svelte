<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { DropdownMenuLabelProps } from "./dropdown.svelte";

	let {
		class: className,
		inset = false,
		ref = $bindable(null),
		children
	}: DropdownMenuLabelProps = $props();
</script>

<DropdownMenuPrimitive.GroupHeading
	bind:ref
	class={cn("px-2 py-1.5 text-[0.875rem] font-semibold", inset && "pl-8", className)}
>
	{@render children?.()}
</DropdownMenuPrimitive.GroupHeading>
