<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import currencies from "./currencies.json";

	const currencySeparator = "  ";

	const options = Object.keys(currencies).map((code) => ({
		label: `${currencies[code as keyof typeof currencies]}${currencySeparator}${code}`,
		value: code
	}));

	export type CurrencyDisplayProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		value: string;
		size?: "sm" | "default" | "lg";
	};

	export const currencyDisplayVariants = {
		sm: "text-[0.8125rem]",
		default: "text-[0.9375rem]",
		lg: "text-[1.0625rem]"
	};
</script>

<script lang="ts">
	let { value, size = "default", class: className, ...restProps }: CurrencyDisplayProps = $props();

	const label = $derived(options.find((v) => v.value === value)?.label ?? value);
</script>

<span
	class={cn(
		"inline-flex items-center font-medium text-ink",
		currencyDisplayVariants[size],
		className
	)}
	{...restProps}
>
	{label}
</span>
