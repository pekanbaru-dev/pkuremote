import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { Snippet } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";

export const inputVariants = tv({
	base: cn(
		"flex w-full items-center gap-1.5 outline-none ring-1 ring-inset",
		"bg-background text-ink placeholder:text-muted-foreground",
		"transition-colors",
		"disabled:opacity-50 disabled:cursor-not-allowed",
		"focus-visible:ring-2 focus-visible:ring-offset-0",
		"[&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0"
	),
	variants: {
		intent: {
			primary: "ring-primary focus-visible:ring-primary",
			secondary: "ring-secondary focus-visible:ring-secondary",
			danger: "ring-danger focus-visible:ring-danger",
			success: "ring-success focus-visible:ring-success",
			warning: "ring-warning focus-visible:ring-warning",
			info: "ring-info focus-visible:ring-info",
			clean: "ring-outline-variant focus-visible:ring-primary"
		},
		size: {
			xs: "text-xs py-1 px-2",
			sm: "text-sm py-1.5 px-3",
			md: "text-base py-2 px-3.5",
			lg: "text-lg py-2.5 px-4",
			xl: "text-xl py-3 px-5"
		},
		rounded: {
			none: undefined,
			tiny: "rounded",
			small: "rounded-sm",
			medium: "rounded-md",
			large: "rounded-lg",
			full: "rounded-full"
		},
		hasError: {
			false: undefined,
			true: "ring-danger focus-visible:ring-danger"
		},
		hasLeftIcon: {
			false: undefined,
			true: "pl-10"
		},
		hasRightIcon: {
			false: undefined,
			true: "pr-10"
		}
	},
	defaultVariants: {
		intent: "clean",
		size: "md",
		rounded: "tiny",
		hasError: false,
		hasLeftIcon: false,
		hasRightIcon: false
	}
});

export type InputIntent = VariantProps<typeof inputVariants>["intent"];
export type InputSize = VariantProps<typeof inputVariants>["size"];

export type InputProps = Omit<HTMLInputAttributes, "size"> &
	VariantProps<typeof inputVariants> & {
		label?: string;
		error?: string;
		hint?: string;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
	};
