<script lang="ts" module>
	import { Breadcrumb, type BreadcrumbItem } from "$lib/components/ui/breadcrumb";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type ContentTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title: string;
		icon?: Snippet;
		breadcrumb?: BreadcrumbItem[];
	};
</script>

<script lang="ts">
	let { title, icon, breadcrumb, class: className, ...restProps }: ContentTitleProps = $props();
</script>

<div class={cn("flex items-start justify-between gap-4", className)} {...restProps}>
	<span class="flex items-start gap-3">
		{#if icon}
			{@render icon()}
		{/if}
		<h2 class="font-display text-[1.875rem] font-medium text-ink">
			{title}
		</h2>
	</span>
	{#if breadcrumb && breadcrumb.length > 0}
		<div class="flex items-center">
			<Breadcrumb items={breadcrumb} />
		</div>
	{/if}
</div>
