<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { drawerContentVariants, type DrawerContentProps } from "./drawer.svelte";

	let {
		class: className,
		side = "right",
		ref = $bindable(null),
		children
	}: DrawerContentProps = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
	<DialogPrimitive.Content bind:ref class={cn(drawerContentVariants({ side }), "p-6", className)}>
		{@render children?.()}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
