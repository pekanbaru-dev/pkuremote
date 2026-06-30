import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

export const buttonVariants = tv({
	base: cn(
		"inline-flex shrink-0 items-center justify-center gap-1.5 flex-nowrap h-fit",
		"whitespace-nowrap font-medium select-none transition",
		"hover:cursor-pointer active:scale-95",
		"disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none disabled:hover:opacity-100 disabled:active:scale-100",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
		"[&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none"
	),
	variants: {
		intent: {
			primary: "bg-primary text-primary-foreground",
			secondary: "bg-secondary text-secondary-foreground",
			danger: "bg-danger text-on-danger",
			success: "bg-success text-on-success",
			warning: "bg-warning text-on-warning",
			info: "bg-info text-on-info",
			clean: "bg-muted text-muted-foreground"
		},
		variant: {
			solid: undefined,
			outline: "border border-transparent bg-transparent",
			text: "border-0 bg-transparent"
		},
		size: {
			xs: "text-xs py-1 px-2 font-normal",
			sm: "text-sm py-1.5 px-3 font-normal",
			md: "text-sm py-2.5 px-4 font-normal",
			lg: "text-lg py-3 px-6 font-semibold",
			xl: "text-xl py-4 px-8 font-bold"
		},
		uppercase: {
			false: undefined,
			true: "uppercase"
		},
		rounded: {
			none: undefined,
			tiny: "rounded",
			small: "rounded-sm",
			medium: "rounded-md",
			large: "rounded-lg",
			full: "rounded-full"
		},
		fullWidth: {
			false: "w-fit",
			true: "w-full"
		}
	},
	compoundVariants: [
		// solid × intent — darken fill on hover
		{ variant: "solid", intent: "primary", class: "hover:bg-primary-hover" },
		{ variant: "solid", intent: "secondary", class: "hover:opacity-90" },
		{ variant: "solid", intent: "danger", class: "hover:opacity-90" },
		{ variant: "solid", intent: "success", class: "hover:opacity-90" },
		{ variant: "solid", intent: "warning", class: "hover:opacity-90" },
		{ variant: "solid", intent: "info", class: "hover:opacity-90" },
		{ variant: "solid", intent: "clean", class: "hover:opacity-90" },
		// outline × intent — intent-colored border + text, subtle fill on hover
		{
			variant: "outline",
			intent: "primary",
			class: "border-primary text-primary hover:bg-primary/10"
		},
		{
			variant: "outline",
			intent: "secondary",
			class: "border-secondary text-secondary hover:bg-secondary/10"
		},
		{ variant: "outline", intent: "danger", class: "border-danger text-danger hover:bg-danger/10" },
		{
			variant: "outline",
			intent: "success",
			class: "border-success text-success hover:bg-success/10"
		},
		{
			variant: "outline",
			intent: "warning",
			class: "border-warning text-warning hover:bg-warning/10"
		},
		{ variant: "outline", intent: "info", class: "border-info text-info hover:bg-info/10" },
		{
			variant: "outline",
			intent: "clean",
			class: "border-outline-variant text-ink hover:bg-muted/10"
		},
		// text × intent — text-only, subtle fill on hover
		{ variant: "text", intent: "primary", class: "text-primary hover:bg-primary/10" },
		{ variant: "text", intent: "secondary", class: "text-secondary hover:bg-secondary/10" },
		{ variant: "text", intent: "danger", class: "text-danger hover:bg-danger/10" },
		{ variant: "text", intent: "success", class: "text-success hover:bg-success/10" },
		{ variant: "text", intent: "warning", class: "text-warning hover:bg-warning/10" },
		{ variant: "text", intent: "info", class: "text-info hover:bg-info/10" },
		{ variant: "text", intent: "clean", class: "text-ink hover:bg-muted/10" }
	],
	defaultVariants: {
		intent: "primary",
		variant: "solid",
		size: "md",
		uppercase: false,
		rounded: "tiny",
		fullWidth: false
	}
});

export type ButtonIntent = VariantProps<typeof buttonVariants>["intent"];
export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export type ButtonProps = Omit<HTMLButtonAttributes, "disabled"> &
	Partial<HTMLAnchorAttributes> &
	VariantProps<typeof buttonVariants> & {
		disabled?: boolean;
		loading?: boolean;
		href?: string;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
	};
