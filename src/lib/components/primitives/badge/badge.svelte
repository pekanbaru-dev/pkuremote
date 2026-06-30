<script lang="ts" module>
	import { badgeVariants, type BadgeProps } from "./badge.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let { intent, variant, size, icon, children, class: className, ...rest }: BadgeProps = $props();
</script>

<span class={cn(badgeVariants({ intent, variant, size }), className)} {...rest}>
	{@render icon?.()}
	{@render children?.()}
</span>
