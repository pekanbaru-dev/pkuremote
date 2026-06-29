<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import { type VariantProps, tv } from "tailwind-variants";

	export const dialogContentVariants = tv({
		base: "fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-hairline bg-canvas p-6 shadow-lg rounded-lg",
		variants: {
			size: {
				sm: "max-w-sm",
				default: "max-w-lg",
				lg: "max-w-2xl"
			}
		},
		defaultVariants: { size: "default" }
	});

	export type DialogSize = VariantProps<typeof dialogContentVariants>["size"];

	export type DialogRootProps = HTMLAttributes<HTMLDivElement> & {
		open?: boolean;
		children?: Snippet;
	};
	export type DialogContentProps = HTMLAttributes<HTMLDivElement> & {
		size?: DialogSize;
		ref?: HTMLElement | null;
		children?: Snippet;
	};
	export type DialogHeaderProps = HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		children?: Snippet;
	};
	export type DialogFooterProps = HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		children?: Snippet;
	};
	export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement> & {
		ref?: HTMLHeadingElement | null;
		children?: Snippet;
	};
	export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
		ref?: HTMLParagraphElement | null;
		children?: Snippet;
	};
	export type DialogTriggerProps = HTMLAttributes<HTMLButtonElement> & {
		ref?: HTMLButtonElement | null;
		children?: Snippet;
	};
	export type DialogCloseProps = HTMLAttributes<HTMLButtonElement> & {
		ref?: HTMLButtonElement | null;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children }: DialogRootProps = $props();
</script>

<DialogPrimitive.Root bind:open>
	{@render children?.()}
</DialogPrimitive.Root>
