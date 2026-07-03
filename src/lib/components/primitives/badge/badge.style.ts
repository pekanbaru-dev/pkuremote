import { cn } from "$lib/utils.js";
import { tv, type VariantProps } from "tailwind-variants";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export const badgeVariants = tv({
	base: cn(
		"inline-flex items-center gap-1 whitespace-nowrap font-medium rounded-full",
		"transition [&_svg:not([class*=size-])]:size-3.5 [&_svg]:shrink-0"
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
			soft: "bg-transparent border-0"
		},
		size: {
			sm: "text-xs px-2 py-0.5",
			md: "text-xs px-2.5 py-1",
			lg: "text-sm px-3 py-1.5"
		}
	},
	compoundVariants: [
		// outline × intent — intent-colored border + text
		{ variant: "outline", intent: "primary", class: "border-primary text-primary" },
		{ variant: "outline", intent: "secondary", class: "border-secondary text-secondary" },
		{ variant: "outline", intent: "danger", class: "border-danger text-danger" },
		{ variant: "outline", intent: "success", class: "border-success text-success" },
		{ variant: "outline", intent: "warning", class: "border-warning text-warning" },
		{ variant: "outline", intent: "info", class: "border-info text-info" },
		{ variant: "outline", intent: "clean", class: "border-outline-variant text-ink" },
		// soft × intent — container fill + on-container text
		{ variant: "soft", intent: "primary", class: "bg-primary-container text-on-primary-container" },
		{
			variant: "soft",
			intent: "secondary",
			class: "bg-secondary-container text-on-secondary-container"
		},
		{ variant: "soft", intent: "danger", class: "bg-danger-container text-on-danger-container" },
		{ variant: "soft", intent: "success", class: "bg-success-container text-on-success-container" },
		{ variant: "soft", intent: "warning", class: "bg-warning-container text-on-warning-container" },
		{ variant: "soft", intent: "info", class: "bg-info-container text-on-info-container" },
		{ variant: "soft", intent: "clean", class: "bg-muted text-ink" }
	],
	defaultVariants: {
		intent: "primary",
		variant: "solid",
		size: "md"
	}
});

export type BadgeIntent = VariantProps<typeof badgeVariants>["intent"];
export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
export type BadgeSize = VariantProps<typeof badgeVariants>["size"];

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
	VariantProps<typeof badgeVariants> & {
		icon?: Snippet;
	};
