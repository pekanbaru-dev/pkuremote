<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { DropdownMenuSeparatorProps } from "./dropdown.svelte";

	let { class: className, ref = $bindable(null) }: DropdownMenuSeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator bind:ref class={cn("-mx-1 my-1 h-px bg-hairline", className)} />
