<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const emptyStateVariants = tv({
		base: "flex flex-col items-center justify-center text-center",
		variants: {
			padding: {
				default: "py-12",
				sm: "py-8",
				lg: "py-16"
			},
			iconSize: {
				default: "mb-4",
				sm: "mb-3",
				lg: "mb-6"
			}
		},
		defaultVariants: {
			padding: "default",
			iconSize: "default"
		}
	});

	export type EmptyStatePadding = VariantProps<typeof emptyStateVariants>["padding"];
	export type EmptyStateIconSize = VariantProps<typeof emptyStateVariants>["iconSize"];

	export type EmptyStateProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title: string;
		description?: string;
		padding?: EmptyStatePadding;
		iconSize?: EmptyStateIconSize;
		icon?: import("svelte").Snippet;
		action?: import("svelte").Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		class: className,
		title,
		description,
		padding = "default",
		iconSize = "default",
		icon,
		action,
		children
	}: EmptyStateProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-state"
	class={cn(emptyStateVariants({ padding, iconSize }), className)}
>
	{#if icon}
		<div class="text-muted-foreground [&_svg]:mx-auto [&_svg]:size-12">
			{@render icon()}
		</div>
	{:else}
		<div class="text-muted-foreground [&_svg]:mx-auto [&_svg]:size-12" aria-hidden="true">
			{@render children?.()}
		</div>
	{/if}
	<h3 class="text-[1.125rem] font-medium text-ink">{title}</h3>
	{#if description}
		<p class="mt-1 text-[0.875rem] text-muted-foreground">{description}</p>
	{/if}
	{#if action}
		<div class="mt-4 inline-flex">
			{@render action()}
		</div>
	{/if}
</div>
