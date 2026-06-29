<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn, type WithElementRef, type BitsCompatibleHTMLAttributes } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	export type MenubarRootProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
	export type MenubarTriggerProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLButtonElement>
	> & {
		children?: Snippet;
	};
	export type MenubarContentProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		align?: "start" | "center" | "end";
		sideOffset?: number;
		children?: Snippet;
	};
	export type MenubarItemProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		inset?: boolean;
		children?: Snippet;
	};
	export type MenubarSeparatorProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { class: className, ref = $bindable(null), children }: MenubarRootProps = $props();
</script>

<MenubarPrimitive.Root
	bind:ref
	class={cn(
		"flex h-10 items-center space-x-1 rounded-md border border-hairline bg-canvas p-1",
		className
	)}
>
	{@render children?.()}
</MenubarPrimitive.Root>
