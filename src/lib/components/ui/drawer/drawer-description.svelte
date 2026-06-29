<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DrawerDescriptionProps } from "./drawer.svelte";

	let { class: className, ref = $bindable(null), children }: DrawerDescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	class={cn("text-[0.875rem] text-muted-foreground", className)}
>
	{@render children?.()}
</DialogPrimitive.Description>
