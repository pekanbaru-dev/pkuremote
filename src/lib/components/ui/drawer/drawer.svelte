<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { type WithElementRef, type BitsCompatibleHTMLAttributes } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import { type VariantProps, tv } from "tailwind-variants";

	export const drawerContentVariants = tv({
		base: "fixed z-50 gap-4 bg-canvas shadow-lg transition-transform",
		variants: {
			side: {
				right: "inset-y-0 right-0 w-3/4 max-w-sm border-l border-hairline sm:max-w-sm",
				left: "inset-y-0 left-0 w-3/4 max-w-sm border-r border-hairline sm:max-w-sm",
				top: "inset-x-0 top-0 h-1/3 border-b border-hairline",
				bottom: "inset-x-0 bottom-0 h-1/3 border-t border-hairline"
			}
		},
		defaultVariants: { side: "right" }
	});

	export type DrawerSide = VariantProps<typeof drawerContentVariants>["side"];

	export type DrawerRootProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		children?: Snippet;
	};
	export type DrawerContentProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		side?: DrawerSide;
		children?: Snippet;
	};
	export type DrawerHeaderProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
	export type DrawerFooterProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
	export type DrawerTitleProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLHeadingElement>
	> & {
		children?: Snippet;
	};
	export type DrawerDescriptionProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLParagraphElement>
	> & {
		children?: Snippet;
	};
	export type DrawerTriggerProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLButtonElement>
	> & {
		children?: Snippet;
	};
	export type DrawerCloseProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLButtonElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children }: DrawerRootProps = $props();
</script>

<DialogPrimitive.Root bind:open>
	{@render children?.()}
</DialogPrimitive.Root>
