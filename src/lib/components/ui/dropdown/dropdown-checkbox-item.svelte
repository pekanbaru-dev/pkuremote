<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { Check } from "@lucide/svelte";
	import type { DropdownMenuCheckboxItemProps } from "./dropdown.svelte";

	let {
		class: className,
		checked = false,
		ref = $bindable(null),
		children
	}: DropdownMenuCheckboxItemProps = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:ref
	checked={checked === "indeterminate" ? false : checked}
	class={cn(
		"relative flex cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-8 text-[0.875rem] outline-none transition-colors select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
>
	<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
		{#if checked}
			<Check class="size-4" />
		{/if}
	</span>
	{@render children?.()}
</DropdownMenuPrimitive.CheckboxItem>
