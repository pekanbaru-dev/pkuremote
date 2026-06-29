<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type PanelCardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title?: string;
		description?: string;
		action?: Snippet;
		noPadding?: boolean;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		title,
		description,
		action,
		noPadding = false,
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: PanelCardProps = $props();
</script>

<div
	bind:this={ref}
	class={cn("rounded-xl border border-hairline bg-canvas shadow-sm", className)}
	{...restProps}
>
	{#if title || action}
		<div class="flex items-center justify-between border-b border-hairline px-6 py-4">
			<div>
				{#if title}
					<h2 class="text-[1.125rem] font-semibold text-ink">{title}</h2>
				{/if}
				{#if description}
					<p class="mt-0.5 text-[0.875rem] text-muted-foreground">{description}</p>
				{/if}
			</div>
			{#if action}
				<div>{@render action()}</div>
			{/if}
		</div>
	{/if}
	<div class={cn(!noPadding && "p-6")}>
		{@render children?.()}
	</div>
</div>
