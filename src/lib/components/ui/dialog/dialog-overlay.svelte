<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";

	let { class: className, ref = $bindable(null) }: { class?: string; ref?: HTMLElement | null } =
		$props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	class={cn("fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm", className)}
/>
