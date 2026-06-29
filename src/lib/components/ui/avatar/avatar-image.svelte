<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import type { HTMLImgAttributes } from "svelte/elements";

	let {
		class: className,
		src,
		alt,
		ref = $bindable(null)
	}: HTMLImgAttributes & { ref?: HTMLElement | null } = $props();
</script>

<AvatarPrimitive.Image bind:ref {src} {alt} class={cn("aspect-square h-full w-full", className)} />
