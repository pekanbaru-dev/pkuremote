<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type LoadingSpinnerProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		size?: "sm" | "default" | "lg";
		label?: string;
	};

	export const loadingSpinnerVariants = {
		sm: "size-4 border-2",
		default: "size-8 border-2",
		lg: "size-12 border-[3px]"
	};
</script>

<script lang="ts">
	let { size = "default", label, class: className, ...restProps }: LoadingSpinnerProps = $props();
</script>

<div
	role="status"
	aria-label={label ?? "Loading"}
	class={cn("flex items-center justify-center", className)}
	{...restProps}
>
	<div
		class={cn(
			"animate-spin rounded-full border-current border-t-transparent text-muted-foreground",
			loadingSpinnerVariants[size]
		)}
	></div>
	{#if label}
		<span class="sr-only">{label}</span>
	{/if}
</div>
