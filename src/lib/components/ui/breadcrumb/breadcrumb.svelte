<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const breadcrumbVariants = tv({
		base: "flex flex-wrap items-center gap-1 text-[0.8125rem] text-muted-foreground",
		variants: {
			size: {
				sm: "text-[0.75rem]",
				default: "text-[0.8125rem]",
				lg: "text-[0.875rem]"
			}
		},
		defaultVariants: { size: "default" }
	});

	export type BreadcrumbItem = {
		title: string;
		href?: string;
	};

	export type BreadcrumbProps = WithElementRef<HTMLAttributes<HTMLOListElement>> & {
		items: BreadcrumbItem[];
		size?: VariantProps<typeof breadcrumbVariants>["size"];
		separator?: Snippet;
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	let {
		items,
		size = "default",
		separator,
		class: className,
		ref = $bindable(null)
	}: BreadcrumbProps = $props();
</script>

<ol bind:this={ref} class={cn(breadcrumbVariants({ size }), "flex-wrap", className)}>
	{#each items as item, index (item.title + index)}
		<li class="flex items-center gap-1">
			{#if index > 0}
				<span class="text-muted-foreground/60" aria-hidden="true">
					{#if separator}{@render separator()}{:else}/{/if}
				</span>
			{/if}
			{#if item.href}
				<a href={item.href} class="transition-colors hover:text-ink">
					{item.title}
				</a>
			{:else}
				<span class="text-ink">{item.title}</span>
			{/if}
		</li>
	{/each}
</ol>
