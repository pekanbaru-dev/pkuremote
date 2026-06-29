<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
	import NavigationMenuViewport from "./navigation-menu-viewport.svelte";

	let {
		ref = $bindable(null),
		class: className,
		viewport = true,
		children
	}: NavigationMenuPrimitive.RootProps & {
		viewport?: boolean;
	} = $props();
</script>

<NavigationMenuPrimitive.Root
	bind:ref
	data-slot="navigation-menu"
	data-viewport={viewport}
	class={cn(
		"max-w-max group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
		className
	)}
>
	{@render children?.()}
	{#if viewport}
		<NavigationMenuViewport />
	{/if}
</NavigationMenuPrimitive.Root>
