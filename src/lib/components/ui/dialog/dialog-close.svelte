<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DialogCloseProps } from "./dialog.svelte";

	let { class: className, ref = $bindable(null), children }: DialogCloseProps = $props();
</script>

<DialogPrimitive.Close
	bind:ref
	class={cn("text-ink transition-opacity hover:opacity-80 focus:outline-none", className)}
>
	{@render children?.()}
</DialogPrimitive.Close>
