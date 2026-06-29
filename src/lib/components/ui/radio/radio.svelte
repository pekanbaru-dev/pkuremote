<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { tv } from "tailwind-variants";

	export const radioVariants = tv({
		base: "size-4 cursor-pointer rounded-full border border-hairline bg-canvas text-primary accent-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive"
	});

	export const radioLabelVariants = tv({
		base: "text-[0.875rem] text-ink select-none",
		variants: {
			disabled: {
				true: "cursor-not-allowed opacity-50"
			}
		}
	});

	export type RadioProps = WithElementRef<Omit<HTMLInputAttributes, "type" | "size">> & {
		label?: string;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), class: className, label, id, disabled }: RadioProps = $props();

	const radioId = $derived(id ?? `radio-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="flex items-center gap-2">
	<input
		bind:this={ref}
		id={radioId}
		type="radio"
		{disabled}
		class={cn(radioVariants(), className)}
	/>
	{#if label}
		<label for={radioId} class={cn(radioLabelVariants({ disabled: !!disabled }))}>
			{label}
		</label>
	{/if}
</div>
