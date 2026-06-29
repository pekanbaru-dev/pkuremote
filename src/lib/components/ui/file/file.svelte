<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const fileVariants = tv({
		base: "block w-full cursor-pointer rounded-md border border-dashed border-hairline bg-canvas text-[0.8125rem] text-ink file:mr-3 file:cursor-pointer file:border-0 file:bg-muted file:px-3 file:py-2 file:text-[0.8125rem] file:font-medium file:text-ink hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive"
	});

	export const fileLabelVariants = tv({
		base: "block text-[0.8125rem] font-medium text-ink",
		variants: {
			required: {
				true: "after:ml-0.5 after:text-destructive after:content-['*']"
			}
		}
	});

	export const fileMessageVariants = tv({
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

	export type FileMessageTone = VariantProps<typeof fileMessageVariants>["tone"];

	export type FileProps = WithElementRef<Omit<HTMLInputAttributes, "type">> & {
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		accept?: string;
		multiple?: boolean;
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
		id,
		"aria-invalid": ariaInvalid
	}: FileProps = $props();

	const inputId = $derived(id ?? `file-${Math.random().toString(36).slice(2, 9)}`);
	const hasError = $derived(!!error);
</script>

<div class="flex w-full flex-col gap-1.5">
	{#if label}
		<label for={inputId} class={cn(fileLabelVariants({ required }))}>
			{label}
		</label>
	{/if}
	<input
		bind:this={ref}
		id={inputId}
		type="file"
		data-slot="file"
		aria-invalid={ariaInvalid ?? hasError}
		class={cn(fileVariants(), className)}
	/>
	{#if error}
		<p class={cn(fileMessageVariants({ tone: "error" }))}>{error}</p>
	{:else if hint}
		<p class={cn(fileMessageVariants({ tone: "hint" }))}>{hint}</p>
	{/if}
</div>
