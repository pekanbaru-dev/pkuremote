<script lang="ts" module>
	import { Loader2, MoreHorizontal } from "@lucide/svelte";
	import { DropdownMenu } from "$lib/components/ui";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ActionsDropdownAction = {
		label: string;
		onClick: () => void;
		className?: string;
		destructive?: boolean;
		loading?: boolean;
	};

	export type ActionsDropdownProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		actions: ActionsDropdownAction[];
		buttonClassName?: string;
	};
</script>

<script lang="ts">
	let { actions, buttonClassName, class: className }: ActionsDropdownProps = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			"inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted",
			buttonClassName
		)}
	>
		<MoreHorizontal class="size-4 text-muted-foreground" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class={cn("min-w-32", className)} align="end">
		{#each actions as action (action.label)}
			<DropdownMenu.Item
				class={cn(
					action.destructive && "text-destructive",
					action.loading && "cursor-not-allowed opacity-50"
				)}
				onSelect={() => !action.loading && action.onClick()}
			>
				{#if action.loading}
					<Loader2 class="mr-2 size-4 animate-spin" />
					{action.label}...
				{:else}
					{action.label}
				{/if}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
