<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DrawerCloseProps } from "./drawer.svelte";

	let { class: className, ref = $bindable(null), children }: DrawerCloseProps = $props();
</script>

<DialogPrimitive.Close
	bind:ref
	class={cn("text-ink transition-opacity hover:opacity-80", className)}
>
	{@render children?.()}
</DialogPrimitive.Close>
