<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { RadioGroup } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const radioGroupVariants = tv({
		base: "flex gap-2",
		variants: {
			orientation: {
				vertical: "flex-col",
				horizontal: "flex-row flex-wrap"
			}
		},
		defaultVariants: {
			orientation: "vertical"
		}
	});

	export const radioGroupLabelVariants = tv({
		base: "block text-[0.8125rem] font-medium text-ink",
		variants: {
			required: {
				true: "after:ml-0.5 after:text-destructive after:content-['*']"
			}
		}
	});

	export const radioGroupMessageVariants = tv({
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

	export type RadioGroupOrientation = VariantProps<typeof radioGroupVariants>["orientation"];
	export type RadioGroupMessageTone = VariantProps<typeof radioGroupMessageVariants>["tone"];

	export type RadioGroupProps = WithElementRef<HTMLAttributes<HTMLFieldSetElement>> & {
		value?: string;
		onValueChange?: (value: string) => void;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		orientation?: RadioGroupOrientation;
		label?: string;
		hint?: string;
		error?: string;
		children?: import("svelte").Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		onValueChange,
		name,
		disabled = false,
		required = false,
		orientation = "vertical",
		label,
		hint,
		error,
		children
	}: RadioGroupProps = $props();

	const groupId = $derived(`radio-group-${Math.random().toString(36).slice(2, 9)}`);
</script>

<fieldset
	bind:this={ref}
	id={groupId}
	data-slot="radio-group"
	class={cn("flex flex-col gap-1.5", className)}
>
	{#if label}
		<legend class={cn(radioGroupLabelVariants({ required }))}>{label}</legend>
	{/if}
	<RadioGroup.Root
		{value}
		onValueChange={(v) => {
			value = v;
			onValueChange?.(v);
		}}
		{name}
		{disabled}
		{required}
	>
		<div class={cn(radioGroupVariants({ orientation }))}>
			{@render children?.()}
		</div>
	</RadioGroup.Root>
	{#if error}
		<p class={cn(radioGroupMessageVariants({ tone: "error" }))}>{error}</p>
	{:else if hint}
		<p class={cn(radioGroupMessageVariants({ tone: "hint" }))}>{hint}</p>
	{/if}
</fieldset>
