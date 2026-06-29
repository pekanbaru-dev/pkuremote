<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DialogTriggerProps } from "./dialog.svelte";

	let { class: className, ref = $bindable(null), children }: DialogTriggerProps = $props();
</script>

<DialogPrimitive.Trigger bind:ref class={cn(className)}>
	{@render children?.()}
</DialogPrimitive.Trigger>
