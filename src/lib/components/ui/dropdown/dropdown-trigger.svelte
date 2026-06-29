<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { DropdownMenuTriggerProps } from "./dropdown.svelte";

	let { class: className, ref = $bindable(null), children }: DropdownMenuTriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger bind:ref class={cn(className)}>
	{@render children?.()}
</DropdownMenuPrimitive.Trigger>
