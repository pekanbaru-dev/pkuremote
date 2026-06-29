<script lang="ts" module>
	import { ChevronUp, LogOut } from "@lucide/svelte";
	import { Avatar } from "$lib/components/ui/avatar";
	import { DropdownMenu } from "$lib/components/ui/dropdown";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type UserMenuProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		name?: string;
		email?: string;
		src?: string;
		collapsed?: boolean;
		onLogout?: () => void;
	};
</script>

<script lang="ts">
	let {
		name = "User",
		email,
		src,
		collapsed = false,
		onLogout,
		class: className
	}: UserMenuProps = $props();
</script>

{#if collapsed}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class={cn(
				"flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20",
				className
			)}
		>
			<span class="text-[0.875rem] font-medium">{name.charAt(0).toUpperCase()}</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="center" side="top" class="w-40 p-1">
			<div class="border-b border-hairline px-3 py-2">
				<p class="truncate text-[0.75rem] font-medium text-ink">{name}</p>
				{#if email}
					<p class="truncate text-[0.625rem] text-muted-foreground">{email}</p>
				{/if}
			</div>
			{#if onLogout}
				<DropdownMenu.Item class="text-destructive" onSelect={onLogout}>
					<LogOut class="mr-2 size-3" />
					Logout
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class={cn(
				"flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted",
				className
			)}
		>
			<Avatar.Root size="sm">
				<Avatar.Image {src} alt={name} />
				<Avatar.Fallback {name} />
			</Avatar.Root>
			<div class="min-w-0 flex-1 text-left">
				<p class="truncate text-[0.875rem] font-medium text-ink">{name}</p>
				{#if email}
					<p class="truncate text-[0.75rem] text-muted-foreground">{email}</p>
				{/if}
			</div>
			<ChevronUp class="size-4 text-muted-foreground" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start" side="top" class="w-56 p-1">
			<div class="border-b border-hairline px-3 py-2">
				<p class="text-[0.875rem] font-medium text-ink">{name}</p>
				{#if email}
					<p class="text-[0.75rem] text-muted-foreground">{email}</p>
				{/if}
			</div>
			{#if onLogout}
				<DropdownMenu.Item class="text-destructive" onSelect={onLogout}>
					<LogOut class="mr-2 size-4" />
					Logout
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
