<script lang="ts" module>
	import { Autocomplete } from "$lib/components/ui/autocomplete";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import currencies from "./currencies.json";

	const currencySeparator = "   ";

	const options = Object.keys(currencies).map((code) => ({
		label: `${currencies[code as keyof typeof currencies]}${currencySeparator}${code}`,
		value: code
	}));

	export type CurrencySelectProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: string;
		onValueChange?: (value: string | undefined) => void;
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		placeholder?: string;
		noOptionsMessage?: string;
	};
</script>

<script lang="ts">
	let {
		value = $bindable<string | undefined>(undefined),
		onValueChange,
		label,
		hint,
		error,
		required = false,
		placeholder = "Select currency...",
		noOptionsMessage = "No currencies",
		class: className,
		...restProps
	}: CurrencySelectProps = $props();
</script>

<Autocomplete
	{label}
	{hint}
	{error}
	{required}
	{placeholder}
	{noOptionsMessage}
	{options}
	bind:value
	onValueChange={(v) => {
		value = v;
		onValueChange?.(v);
	}}
	class={cn(className)}
	{...restProps}
/>
