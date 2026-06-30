<script lang="ts" module>
	import { avatarVariants, type AvatarProps } from "./avatar.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		src = undefined,
		name = "User",
		size,
		shape,
		class: className,
		...rest
	}: AvatarProps = $props();

	let imgError = $state(false);

	const initials = $derived.by(() => {
		const words = name.split(" ").filter(Boolean);
		if (words.length === 0) return "US";
		if (words.length === 1) return (words[0] ?? "US").slice(0, 2).toUpperCase();
		if (words.length === 2) return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
		return words
			.slice(0, 3)
			.map((w) => w[0] ?? "")
			.join("")
			.toUpperCase();
	});

	const showFallback = $derived(!src || imgError);
</script>

<span class={cn(avatarVariants({ size, shape }), className)} role="img" aria-label={name} {...rest}>
	{#if showFallback}
		<span class="flex h-full w-full items-center justify-center font-semibold" aria-hidden="true">
			{initials}
		</span>
	{:else}
		<img {src} alt="" onerror={() => (imgError = true)} />
	{/if}
</span>
