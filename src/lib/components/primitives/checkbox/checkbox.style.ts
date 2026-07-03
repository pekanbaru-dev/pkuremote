import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { HTMLInputAttributes } from "svelte/elements";

export const checkboxVariants = tv({
	base: cn(
		"cursor-pointer",
		"disabled:opacity-50 disabled:cursor-not-allowed",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
	),
	variants: {
		intent: {
			primary: "accent-primary",
			secondary: "accent-secondary",
			danger: "accent-danger",
			success: "accent-success",
			warning: "accent-warning",
			info: "accent-info",
			clean: "accent-muted"
		},
		size: {
			sm: "size-3.5",
			md: "size-4",
			lg: "size-5"
		}
	},
	defaultVariants: {
		intent: "primary",
		size: "md"
	}
});

export const labelVariants = tv({
	base: "text-sm text-ink select-none",
	variants: {
		disabled: {
			false: undefined,
			true: "opacity-50 cursor-not-allowed"
		}
	},
	defaultVariants: {
		disabled: false
	}
});

export type CheckboxIntent = VariantProps<typeof checkboxVariants>["intent"];
export type CheckboxSize = VariantProps<typeof checkboxVariants>["size"];

export type CheckboxProps = Omit<HTMLInputAttributes, "size"> & {
	intent?: CheckboxIntent;
	size?: CheckboxSize;
	label?: string;
	indeterminate?: boolean;
};
