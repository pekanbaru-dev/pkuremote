<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { User } from "@lucide/svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		class: className,
		name = "User",
		ref = $bindable(null)
	}: HTMLAttributes<HTMLSpanElement> & { name?: string; ref?: HTMLElement | null } = $props();

	function getInitials(name: string): string {
		const words = name.split(" ").filter(Boolean);
		if (words.length === 0) return "US";
		if (words.length === 1) return (words[0] ?? "US").slice(0, 2).toUpperCase();
		if (words.length === 2) {
			return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
		}
		return words
			.slice(0, 3)
			.map((w) => w[0] ?? "")
			.join("")
			.toUpperCase();
	}
</script>

<AvatarPrimitive.Fallback
	bind:ref
	class={cn(
		"flex h-full w-full items-center justify-center rounded-full bg-muted text-[0.875rem] font-medium text-ink",
		className
	)}
>
	{#if name}
		{getInitials(name)}
	{:else}
		<User class="size-4" />
	{/if}
</AvatarPrimitive.Fallback>
