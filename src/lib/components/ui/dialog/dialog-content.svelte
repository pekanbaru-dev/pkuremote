<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { X } from "@lucide/svelte";
	import { dialogContentVariants, type DialogContentProps } from "./dialog.svelte";

	let {
		class: className,
		size = "default",
		ref = $bindable(null),
		children
	}: DialogContentProps = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
	<DialogPrimitive.Content bind:ref class={cn(dialogContentVariants({ size }), className)}>
		{@render children?.()}
		<DialogPrimitive.Close
			class="absolute top-4 right-4 rounded-sm text-muted-foreground transition-opacity hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none"
		>
			<X class="size-4" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
