<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { DropdownMenuShortcutProps } from "./dropdown.svelte";

	let { class: className, children }: DropdownMenuShortcutProps = $props();
</script>

<span
	class={cn("ml-auto text-[0.75rem] tracking-widest text-muted-foreground opacity-60", className)}
>
	{@render children?.()}
</span>
