<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { DialogTitleProps } from "./dialog.svelte";

	let { class: className, ref = $bindable(null), children }: DialogTitleProps = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	class={cn("text-[1.125rem] font-semibold leading-none tracking-tight text-ink", className)}
>
	{@render children?.()}
</DialogPrimitive.Title>
