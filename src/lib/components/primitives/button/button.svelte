<script lang="ts" module>
	import { buttonVariants, type ButtonProps } from "./button.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { LoaderCircle } from "@lucide/svelte";

	let {
		intent,
		variant,
		size,
		uppercase,
		rounded,
		fullWidth,
		disabled = false,
		loading = false,
		href = undefined,
		leftIcon,
		rightIcon,
		children,
		class: className,
		type = "button",
		...rest
	}: ButtonProps = $props();

	const isDisabled = $derived(disabled || loading);
	// For link-buttons, drop the `href` while disabled or loading so that
	// pointer/touch activation cannot follow the URL. ARIA + tabindex alone
	// don't prevent activation on anchor elements.
	const linkHref = $derived(isDisabled ? undefined : href);
</script>

{#if linkHref}
	<a
		class={cn(buttonVariants({ intent, variant, size, uppercase, rounded, fullWidth }), className)}
		href={linkHref}
		aria-disabled={isDisabled || undefined}
		role={isDisabled ? "link" : undefined}
		tabindex={isDisabled ? -1 : undefined}
		aria-busy={loading || undefined}
		{...rest}
	>
		{#if loading}
			<LoaderCircle class="animate-spin" />
		{:else}
			{@render leftIcon?.()}
			{@render children?.()}
			{@render rightIcon?.()}
		{/if}
	</a>
{:else if href && isDisabled}
	<a
		class={cn(buttonVariants({ intent, variant, size, uppercase, rounded, fullWidth }), className)}
		aria-disabled="true"
		role="link"
		tabindex={-1}
		aria-busy={loading || undefined}
		{...rest}
	>
		{#if loading}
			<LoaderCircle class="animate-spin" />
		{:else}
			{@render leftIcon?.()}
			{@render children?.()}
			{@render rightIcon?.()}
		{/if}
	</a>
{:else}
	<button
		class={cn(buttonVariants({ intent, variant, size, uppercase, rounded, fullWidth }), className)}
		{type}
		disabled={isDisabled}
		aria-busy={loading || undefined}
		{...rest}
	>
		{#if loading}
			<LoaderCircle class="animate-spin" />
		{:else}
			{@render leftIcon?.()}
			{@render children?.()}
			{@render rightIcon?.()}
		{/if}
	</button>
{/if}
