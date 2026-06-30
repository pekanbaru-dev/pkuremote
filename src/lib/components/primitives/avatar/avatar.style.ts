import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { HTMLAttributes } from "svelte/elements";

export const avatarVariants = tv({
	base: cn(
		"relative inline-flex shrink-0 items-center justify-center overflow-hidden",
		"bg-muted select-none [&_img]:aspect-square [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
	),
	variants: {
		size: {
			sm: "size-8 text-xs",
			md: "size-10 text-sm",
			lg: "size-12 text-base"
		},
		shape: {
			full: "rounded-full",
			rounded: "rounded-lg"
		}
	},
	defaultVariants: {
		size: "md",
		shape: "full"
	}
});

export type AvatarSize = VariantProps<typeof avatarVariants>["size"];
export type AvatarShape = VariantProps<typeof avatarVariants>["shape"];

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "shape"> & {
	src?: string;
	name?: string;
	size?: AvatarSize;
	shape?: AvatarShape;
};
