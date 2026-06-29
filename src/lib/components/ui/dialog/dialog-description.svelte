<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DialogDescriptionProps } from "./dialog.svelte";

	let { class: className, ref = $bindable(null), children }: DialogDescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	class={cn("text-[0.875rem] text-muted-foreground", className)}
>
	{@render children?.()}
</DialogPrimitive.Description>
