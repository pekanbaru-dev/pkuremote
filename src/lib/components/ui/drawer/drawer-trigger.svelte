<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DrawerTriggerProps } from "./drawer.svelte";

	let { class: className, ref = $bindable(null), children }: DrawerTriggerProps = $props();
</script>

<DialogPrimitive.Trigger bind:ref class={cn(className)}>
	{@render children?.()}
</DialogPrimitive.Trigger>
