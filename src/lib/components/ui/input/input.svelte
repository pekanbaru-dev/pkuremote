<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const inputVariants = tv({
		base: "w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30",
		variants: {
			size: {
				sm: "h-8 px-2.5 py-1 text-[0.8125rem]",
				default: "h-9 px-3 py-1.5 text-[0.9375rem]",
				lg: "h-10 px-4 py-2 text-[1rem]"
			}
		},
		defaultVariants: {
			size: "default"
		}
	});

	export const inputLabelVariants = tv({
		base: "block text-[0.8125rem] font-medium text-ink",
		variants: {
			required: {
				true: "after:ml-0.5 after:text-destructive after:content-['*']"
			}
		}
	});

	export const inputMessageVariants = tv({
		base: "mt-1 text-[0.75rem]",
		variants: {
			tone: {
				hint: "text-muted-foreground",
				error: "text-destructive"
			}
		},
		defaultVariants: {
			tone: "hint"
		}
	});

	export type InputSize = VariantProps<typeof inputVariants>["size"];
	export type InputMessageTone = VariantProps<typeof inputMessageVariants>["tone"];

	export type InputProps = WithElementRef<Omit<HTMLInputAttributes, "size">> & {
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		size?: InputSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		label,
		hint,
		error,
		required = false,
		size = "default",
		id,
		"aria-invalid": ariaInvalid
	}: InputProps = $props();

	const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
	const hasError = $derived(!!error);
</script>

<div class="flex w-full flex-col gap-1.5">
	{#if label}
		<label for={inputId} class={cn(inputLabelVariants({ required }))}>
			{label}
		</label>
	{/if}
	<input
		bind:this={ref}
		id={inputId}
		data-slot="input"
		aria-invalid={ariaInvalid ?? hasError}
		class={cn(inputVariants({ size }), className)}
	/>
	{#if error}
		<p class={cn(inputMessageVariants({ tone: "error" }))}>{error}</p>
	{:else if hint}
		<p class={cn(inputMessageVariants({ tone: "hint" }))}>{hint}</p>
	{/if}
</div>
