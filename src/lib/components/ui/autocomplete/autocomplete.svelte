<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { Combobox } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { Check, ChevronsUpDown } from "@lucide/svelte";
	import { type VariantProps, tv } from "tailwind-variants";

	export const autocompleteVariants = tv({
		base: "flex h-9 w-full items-center justify-between rounded-md border border-hairline bg-canvas px-3 text-[0.875rem] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive"
	});

	export const autocompleteLabelVariants = tv({
		base: "block text-[0.8125rem] font-medium text-ink",
		variants: {
			required: {
				true: "after:ml-0.5 after:text-destructive after:content-['*']"
			}
		}
	});

	export const autocompleteMessageVariants = tv({
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

	export const autocompleteItemVariants = tv({
		base: "relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pl-8 pr-2 text-[0.875rem] text-ink outline-none select-none data-[highlighted]:bg-muted data-[selected]:font-medium data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
	});

	export type AutocompleteMessageTone = VariantProps<typeof autocompleteMessageVariants>["tone"];

	export type AutocompleteProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: string;
		onValueChange?: (value: string | undefined) => void;
		inputValue?: string;
		onInputValueChange?: (value: string) => void;
		options: { value: string; label: string }[];
		placeholder?: string;
		disabled?: boolean;
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		noOptionsMessage?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		value = $bindable<string | undefined>(undefined),
		onValueChange,
		inputValue = $bindable(""),
		onInputValueChange,
		options,
		placeholder = "Search...",
		disabled = false,
		label,
		hint,
		error,
		required = false,
		noOptionsMessage = "No options"
	}: AutocompleteProps = $props();

	const id = $derived(`autocomplete-${Math.random().toString(36).slice(2, 9)}`);
	const hasError = $derived(!!error);

	const filtered = $derived.by(() => {
		const q = inputValue.trim().toLowerCase();
		if (!q) return options;
		return options.filter((o) => o.label.toLowerCase().includes(q));
	});
</script>

<div
	bind:this={ref}
	{id}
	data-slot="autocomplete"
	aria-invalid={hasError}
	class={cn("flex w-full flex-col gap-1.5", className)}
>
	{#if label}
		<label for={id} class={cn(autocompleteLabelVariants({ required }))}>
			{label}
		</label>
	{/if}
	<Combobox.Root
		type="single"
		items={filtered}
		value={value ?? ""}
		onValueChange={(v: string) => {
			value = v || undefined;
			onValueChange?.(v || undefined);
		}}
		{inputValue}
		{disabled}
	>
		<div class="relative">
			<Combobox.Input
				class={cn(autocompleteVariants(), "pr-9")}
				{placeholder}
				oninput={(e: Event) => {
					const v = (e.currentTarget as HTMLInputElement).value;
					inputValue = v;
					onInputValueChange?.(v);
				}}
			/>
			<Combobox.Trigger
				class="absolute top-1/2 right-2 size-5 -translate-y-1/2 text-muted-foreground hover:text-ink"
				aria-label="Toggle options"
			>
				<ChevronsUpDown class="size-4" />
			</Combobox.Trigger>
		</div>
		<Combobox.Portal>
			<Combobox.Content
				class="z-50 max-h-64 w-[var(--bits-combobox-anchor-width)] overflow-hidden rounded-md border border-hairline bg-canvas text-ink shadow-md"
			>
				<Combobox.Viewport class="max-h-64 overflow-y-auto p-1">
					{#each filtered as option (option.value)}
						<Combobox.Item
							value={option.value}
							label={option.label}
							class={cn(autocompleteItemVariants())}
						>
							{#snippet children({ selected })}
								<span class="absolute left-2 inline-flex size-4 items-center justify-center">
									{#if selected}
										<Check class="size-4" />
									{/if}
								</span>
								{option.label}
							{/snippet}
						</Combobox.Item>
					{:else}
						<div class="px-3 py-2 text-[0.875rem] text-muted-foreground">
							{noOptionsMessage}
						</div>
					{/each}
				</Combobox.Viewport>
			</Combobox.Content>
		</Combobox.Portal>
	</Combobox.Root>
	{#if error}
		<p class={cn(autocompleteMessageVariants({ tone: "error" }))}>{error}</p>
	{:else if hint}
		<p class={cn(autocompleteMessageVariants({ tone: "hint" }))}>{hint}</p>
	{/if}
</div>
