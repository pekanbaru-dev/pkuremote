<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import type { MenubarSeparatorProps } from "./menubar.svelte";

	let { class: className, ref = $bindable(null) }: MenubarSeparatorProps = $props();
</script>

<MenubarPrimitive.Separator bind:ref class={cn("-mx-1 my-1 h-px bg-hairline", className)} />
