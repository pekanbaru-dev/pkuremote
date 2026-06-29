<script lang="ts" module>
	import { LoadingSpinner } from "$lib/components/ui/loading-spinner";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type LoadingOverlayProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		visible?: boolean;
		label?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		visible = true,
		label = "Loading",
		children,
		class: className,
		...restProps
	}: LoadingOverlayProps = $props();
</script>

{#if visible}
	<div
		role="status"
		aria-label={label}
		class={cn(
			"fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm",
			className
		)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			<LoadingSpinner size="lg" {label} />
		{/if}
	</div>
{/if}
