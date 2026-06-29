<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import type { MenubarTriggerProps } from "./menubar.svelte";

	let { class: className, ref = $bindable(null), children }: MenubarTriggerProps = $props();
</script>

<MenubarPrimitive.Trigger
	bind:ref
	class={cn(
		"flex cursor-pointer items-center rounded-sm px-3 py-1.5 text-[0.875rem] font-medium outline-none select-none data-[highlighted]:bg-muted data-[state=open]:bg-muted",
		className
	)}
>
	{@render children?.()}
</MenubarPrimitive.Trigger>
