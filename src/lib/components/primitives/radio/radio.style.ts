import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { HTMLInputAttributes } from "svelte/elements";

export const radioVariants = tv({
	base: cn(
		"appearance-none size-4 rounded-full border-2 border-outline-variant bg-background",
		"transition-colors cursor-pointer",
		"disabled:opacity-50 disabled:cursor-not-allowed",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
	),
	variants: {
		intent: {
			primary: "checked:border-primary checked:bg-primary",
			secondary: "checked:border-secondary checked:bg-secondary",
			danger: "checked:border-danger checked:bg-danger",
			success: "checked:border-success checked:bg-success",
			warning: "checked:border-warning checked:bg-warning",
			info: "checked:border-info checked:bg-info",
			clean: "checked:border-muted checked:bg-muted"
		}
	},
	defaultVariants: {
		intent: "primary"
	}
});

export const labelVariants = tv({
	base: "text-sm text-ink select-none",
	variants: {
		uppercase: {
			false: undefined,
			true: "uppercase"
		},
		disabled: {
			false: undefined,
			true: "opacity-50 cursor-not-allowed"
		}
	},
	defaultVariants: {
		uppercase: false,
		disabled: false
	}
});

export type RadioIntent = VariantProps<typeof radioVariants>["intent"];

export type RadioProps = Omit<HTMLInputAttributes, "size"> & {
	intent?: RadioIntent;
	label?: string;
	uppercase?: boolean;
};
