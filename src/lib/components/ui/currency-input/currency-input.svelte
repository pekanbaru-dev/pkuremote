<script lang="ts" module>
	import { cn } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";

	function cleanCurrencyInput(value: string): number {
		const digits = value.replace(/[^\d]/g, "");
		return Number.parseFloat(digits) || 0;
	}

	function formatCurrency(value: number, locale = "en-US", currency = "USD"): string {
		if (!value) return "";
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency
		}).format(value);
	}

	export type CurrencyInputProps = Omit<HTMLInputAttributes, "type" | "oninput" | "value"> & {
		value?: number;
		onValueChange?: (value: number) => void;
		locale?: string;
		currency?: string;
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		ref?: HTMLInputElement | null;
	};
</script>

<script lang="ts">
	let {
		value = $bindable(0),
		onValueChange,
		locale = "en-US",
		currency = "USD",
		label,
		hint,
		error,
		required = false,
		class: className,
		id,
		...restProps
	}: CurrencyInputProps = $props();

	const inputId = $derived(id ?? `currency-input-${Math.random().toString(36).slice(2, 9)}`);
	const hasError = $derived(!!error);
	const display = $derived(formatCurrency(value ?? 0, locale, currency));

	function handleInput(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value;
		const cleaned = cleanCurrencyInput(v);
		value = cleaned;
		onValueChange?.(cleaned);
	}
</script>

<div class={cn("flex w-full flex-col gap-1.5", className)}>
	{#if label}
		<label for={inputId} class="block text-[0.8125rem] font-medium text-ink">
			{label}{#if required}<span class="ml-0.5 text-destructive">*</span>{/if}
		</label>
	{/if}
	<input
		id={inputId}
		type="text"
		inputmode="numeric"
		value={display}
		class="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive"
		aria-invalid={hasError}
		oninput={handleInput}
		{...restProps}
	/>
	{#if error}
		<p class="text-[0.75rem] text-destructive">{error}</p>
	{:else if hint}
		<p class="text-[0.75rem] text-muted-foreground">{hint}</p>
	{/if}
</div>
