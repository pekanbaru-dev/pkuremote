<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { ChevronLeft, ChevronRight } from "@lucide/svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import { tv } from "tailwind-variants";

	export const paginationItemVariants = tv({
		base: "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-hairline bg-canvas px-2 text-[0.8125rem] text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
		variants: {
			active: {
				true: "border-primary bg-primary text-primary-foreground"
			}
		}
	});

	export type PaginationProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		page: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		siblingCount?: number;
		previousLabel?: string;
		nextLabel?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		page,
		totalPages,
		onPageChange,
		siblingCount = 1,
		previousLabel = "Previous",
		nextLabel = "Next",
		class: className
	}: PaginationProps = $props();

	const pageNumbers = $derived.by(() => {
		const totalNumbers = siblingCount * 2 + 5;
		if (totalPages <= totalNumbers) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		const leftSibling = Math.max(page - siblingCount, 1);
		const rightSibling = Math.min(page + siblingCount, totalPages);
		const showLeftDots = leftSibling > 2;
		const showRightDots = rightSibling < totalPages - 1;
		if (!showLeftDots && showRightDots) {
			const range = 3 + 2 * siblingCount;
			return [...Array.from({ length: range }, (_, i) => i + 1), "…", totalPages];
		}
		if (showLeftDots && !showRightDots) {
			const range = 3 + 2 * siblingCount;
			return [1, "…", ...Array.from({ length: range }, (_, i) => totalPages - range + 1 + i)];
		}
		return [
			1,
			"…",
			...Array.from({ length: siblingCount * 2 + 1 }, (_, i) => leftSibling + i),
			"…",
			totalPages
		];
	});
</script>

<nav class={cn("flex items-center gap-1", className)} aria-label="Pagination">
	<button
		type="button"
		class={cn(paginationItemVariants(), "gap-1")}
		disabled={page <= 1}
		onclick={() => page > 1 && onPageChange(page - 1)}
	>
		<ChevronLeft class="size-4" />
		<span>{previousLabel}</span>
	</button>
	{#each pageNumbers as item, i (i + "-" + item)}
		{#if item === "…"}
			<span class="px-1 text-muted-foreground">…</span>
		{:else}
			<button
				type="button"
				class={cn(paginationItemVariants({ active: item === page }))}
				aria-current={item === page ? "page" : undefined}
				onclick={() => onPageChange(Number(item))}
			>
				{item}
			</button>
		{/if}
	{/each}
	<button
		type="button"
		class={cn(paginationItemVariants(), "gap-1")}
		disabled={page >= totalPages}
		onclick={() => page < totalPages && onPageChange(page + 1)}
	>
		<span>{nextLabel}</span>
		<ChevronRight class="size-4" />
	</button>
</nav>
