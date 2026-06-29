<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const textareaVariants = tv({
		base: "w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30",
		variants: {
			size: {
				sm: "min-h-16 px-2.5 py-1 text-[0.8125rem]",
				default: "min-h-20 px-3 py-1.5 text-[0.9375rem]",
				lg: "min-h-28 px-4 py-2 text-[1rem]"
			}
		},
		defaultVariants: {
			size: "default"
		}
	});

	export const textareaLabelVariants = tv({
		base: "block text-[0.8125rem] font-medium text-ink",
		variants: {
			required: {
				true: "after:ml-0.5 after:text-destructive after:content-['*']"
			}
		}
	});

	export const textareaMessageVariants = tv({
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

	export type TextareaSize = VariantProps<typeof textareaVariants>["size"];
	export type TextareaMessageTone = VariantProps<typeof textareaMessageVariants>["tone"];

	export type TextareaProps = WithElementRef<HTMLTextareaAttributes> & {
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		size?: TextareaSize;
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
	}: TextareaProps = $props();

	const textareaId = $derived(id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`);
	const hasError = $derived(!!error);
</script>

<div class="flex w-full flex-col gap-1.5">
	{#if label}
		<label for={textareaId} class={cn(textareaLabelVariants({ required }))}>
			{label}
		</label>
	{/if}
	<textarea
		bind:this={ref}
		id={textareaId}
		data-slot="textarea"
		aria-invalid={ariaInvalid ?? hasError}
		class={cn(textareaVariants({ size }), className)}></textarea>
	{#if error}
		<p class={cn(textareaMessageVariants({ tone: "error" }))}>{error}</p>
	{:else if hint}
		<p class={cn(textareaMessageVariants({ tone: "hint" }))}>{hint}</p>
	{/if}
</div>
