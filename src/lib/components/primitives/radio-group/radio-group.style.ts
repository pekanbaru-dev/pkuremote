import { tv, type VariantProps } from "tailwind-variants";
import type { HTMLAttributes } from "svelte/elements";
import type { RadioIntent } from "../radio/radio.style.js";

export const positionVariants = tv({
	base: "flex",
	variants: {
		position: {
			horizontal: "flex-row flex-wrap gap-x-8 gap-y-2",
			vertical: "flex-col gap-y-2",
			"col-2": "grid grid-cols-2 gap-y-2",
			"col-3": "grid grid-cols-3 gap-y-2",
			"col-4": "grid grid-cols-4 gap-y-2",
			"col-5": "grid grid-cols-5 gap-y-2"
		}
	},
	defaultVariants: {
		position: "horizontal"
	}
});

export const legendVariants = tv({
	base: "text-sm font-medium",
	variants: {
		labelColor: {
			main: "text-ink",
			primary: "text-primary",
			secondary: "text-secondary",
			danger: "text-danger",
			success: "text-success",
			warning: "text-warning",
			info: "text-info"
		}
	},
	defaultVariants: {
		labelColor: "main"
	}
});

export type RadioPosition = VariantProps<typeof positionVariants>["position"];
export type RadioLabelColor = VariantProps<typeof legendVariants>["labelColor"];

export type RadioItem = { label: string; value: string; disabled?: boolean };

export type RadioGroupProps = Omit<HTMLAttributes<HTMLFieldSetElement>, "value"> & {
	data: RadioItem[];
	value?: string;
	position?: RadioPosition;
	labelColor?: RadioLabelColor;
	intent?: RadioIntent;
	label?: string;
	hint?: string;
	error?: string;
	required?: boolean;
	name?: string;
	disabled?: boolean;
	onchange?: (value: string) => void;
};
