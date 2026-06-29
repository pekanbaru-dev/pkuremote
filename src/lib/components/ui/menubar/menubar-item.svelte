<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import type { MenubarItemProps } from "./menubar.svelte";

	let {
		class: className,
		inset = false,
		ref = $bindable(null),
		children
	}: MenubarItemProps = $props();
</script>

<MenubarPrimitive.Item
	bind:ref
	class={cn(
		"relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-[0.875rem] outline-none select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		inset && "pl-8",
		className
	)}
>
	{@render children?.()}
</MenubarPrimitive.Item>
