<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

	let { ref = $bindable(null), class: className }: NavigationMenuPrimitive.ListProps = $props();
</script>

<NavigationMenuPrimitive.List
	bind:ref
	data-slot="navigation-menu-list"
	class={cn("gap-0 group flex flex-1 list-none items-center justify-center", className)}
/>
