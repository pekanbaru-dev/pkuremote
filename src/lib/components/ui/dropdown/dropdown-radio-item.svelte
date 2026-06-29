<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { Circle } from "@lucide/svelte";
	import type { DropdownMenuRadioItemProps } from "./dropdown.svelte";

	let {
		class: className,
		value,
		ref = $bindable(null),
		children
	}: DropdownMenuRadioItemProps = $props();
</script>

<DropdownMenuPrimitive.RadioItem
	bind:ref
	{value}
	class={cn(
		"relative flex cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-8 text-[0.875rem] outline-none transition-colors select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
>
	<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
		<Circle class="size-2 fill-current" />
	</span>
	{@render children?.()}
</DropdownMenuPrimitive.RadioItem>
