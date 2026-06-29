<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { type WithElementRef, type BitsCompatibleHTMLAttributes } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	export type DropdownMenuRootProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	> & {
		open?: boolean;
		children?: Snippet;
	};
	export type DropdownMenuContentProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	> & {
		sideOffset?: number;
		align?: "start" | "center" | "end";
		side?: "top" | "right" | "bottom" | "left";
		children?: Snippet;
	};
	export type DropdownMenuItemProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	> & {
		inset?: boolean;
		onSelect?: (event: Event) => void;
		disabled?: boolean;
		children?: Snippet;
	};
	export type DropdownMenuCheckboxItemProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	> & {
		checked?: boolean | "indeterminate";
		children?: Snippet;
	};
	export type DropdownMenuRadioItemProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	> & {
		value: string;
		children?: Snippet;
	};
	export type DropdownMenuLabelProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	> & {
		inset?: boolean;
		children?: Snippet;
	};
	export type DropdownMenuSeparatorProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLDivElement>
	>;
	export type DropdownMenuShortcutProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLSpanElement>
	> & {
		children?: Snippet;
	};
	export type DropdownMenuTriggerProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLButtonElement>
	> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children }: DropdownMenuRootProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open>
	{@render children?.()}
</DropdownMenuPrimitive.Root>
