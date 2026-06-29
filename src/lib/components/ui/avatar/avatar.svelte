<script lang="ts" module>
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn, type WithElementRef, type BitsCompatibleHTMLAttributes } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import { type VariantProps, tv } from "tailwind-variants";

	export const avatarVariants = tv({
		base: "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
		variants: {
			size: {
				sm: "h-8 w-8",
				default: "h-10 w-10",
				lg: "h-12 w-12"
			}
		},
		defaultVariants: { size: "default" }
	});

	export type AvatarSize = VariantProps<typeof avatarVariants>["size"];

	export type AvatarRootProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLSpanElement>> & {
		size?: AvatarSize;
		children?: Snippet;
	};

	export type AvatarImageProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLImageElement>> & {
		src: string;
		alt?: string;
		children?: Snippet;
	};

	export type AvatarFallbackProps = WithElementRef<
		BitsCompatibleHTMLAttributes<HTMLSpanElement>
	> & {
		name?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		size = "default",
		class: className,
		ref = $bindable(null),
		children
	}: AvatarRootProps = $props();
</script>

<AvatarPrimitive.Root bind:ref class={cn(avatarVariants({ size }), className)}>
	{@render children?.()}
</AvatarPrimitive.Root>
