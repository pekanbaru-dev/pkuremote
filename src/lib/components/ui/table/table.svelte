<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import { type VariantProps, tv } from "tailwind-variants";

	export const tableVariants = tv({
		base: "w-full caption-bottom text-[0.875rem]",
		variants: {
			density: {
				comfortable: "[&_td]:py-3 [&_th]:py-3",
				compact: "[&_td]:py-2 [&_th]:py-2"
			}
		},
		defaultVariants: { density: "comfortable" }
	});

	export type TableDensity = VariantProps<typeof tableVariants>["density"];

	export type TableRootProps = WithElementRef<HTMLAttributes<HTMLTableElement>> & {
		density?: TableDensity;
		children?: Snippet;
	};
	export type TableHeaderProps = WithElementRef<HTMLAttributes<HTMLTableSectionElement>> & {
		children?: Snippet;
	};
	export type TableBodyProps = WithElementRef<HTMLAttributes<HTMLTableSectionElement>> & {
		children?: Snippet;
	};
	export type TableFooterProps = WithElementRef<HTMLAttributes<HTMLTableSectionElement>> & {
		children?: Snippet;
	};
	export type TableRowProps = WithElementRef<HTMLAttributes<HTMLTableRowElement>> & {
		children?: Snippet;
	};
	export type TableHeadProps = WithElementRef<HTMLAttributes<HTMLTableCellElement>> & {
		children?: Snippet;
	};
	export type TableCellProps = WithElementRef<HTMLAttributes<HTMLTableCellElement>> & {
		children?: Snippet;
	};
	export type TableCaptionProps = WithElementRef<HTMLAttributes<HTMLTableCaptionElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		density = "comfortable",
		class: className,
		ref = $bindable(null),
		children
	}: TableRootProps = $props();
</script>

<div class="relative w-full overflow-x-auto">
	<table bind:this={ref} class={cn(tableVariants({ density }), className)}>
		{@render children?.()}
	</table>
</div>
