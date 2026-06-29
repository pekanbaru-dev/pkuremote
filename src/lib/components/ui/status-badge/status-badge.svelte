<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const statusBadgeVariants = tv({
		base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium",
		variants: {
			variant: {
				neutral: "bg-muted text-muted-foreground",
				primary: "bg-primary/10 text-primary",
				success: "bg-primary/10 text-primary",
				warning: "bg-primary/10 text-primary",
				danger: "bg-destructive/10 text-destructive",
				info: "bg-muted text-muted-foreground"
			}
		},
		defaultVariants: { variant: "neutral" }
	});

	export type StatusBadgeVariant = VariantProps<typeof statusBadgeVariants>["variant"];

	export type StatusBadgeProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		variant?: StatusBadgeVariant;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	let {
		variant = "neutral",
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: StatusBadgeProps = $props();
</script>

<span bind:this={ref} class={cn(statusBadgeVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</span>
