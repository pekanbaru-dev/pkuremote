<script lang="ts">
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import Menu from "@lucide/svelte/icons/menu";
	import LogOut from "@lucide/svelte/icons/log-out";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import PanelLeftClose from "@lucide/svelte/icons/panel-left-close";
	import PanelLeftOpen from "@lucide/svelte/icons/panel-left-open";
	import Shield from "@lucide/svelte/icons/shield-check";
	import { Avatar, Button } from "$lib/components/primitives";
	import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
	import AdminSidebar from "./admin-sidebar.svelte";

	let { user, children }: { user: App.User | null; children: Snippet } = $props();

	let sheetOpen = $state(false);
	let collapsed = $state(false);

	const COLLAPSE_KEY = "admin-sidebar-collapsed";

	onMount(() => {
		// Read the persisted collapse preference on the client only (avoid SSR mismatch).
		try {
			const stored = window.localStorage.getItem(COLLAPSE_KEY);
			if (stored !== null) collapsed = stored === "1";
		} catch {
			// ignore storage errors (e.g. private mode)
		}
	});

	$effect(() => {
		// Persist the collapse state so it survives navigations & reloads.
		try {
			window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
		} catch {
			// ignore storage errors
		}
	});

	const displayName = $derived(user?.displayName ?? user?.email ?? "Admin");
	const avatarUrl = $derived(user?.avatarUrl ?? undefined);

	function closeProfilePopoverOnOutsidePointerDown(event: PointerEvent) {
		const target = event.target;
		const menu = document.getElementById("admin-profile-menu");

		if (
			target instanceof Element &&
			menu?.matches(":popover-open") &&
			!menu.contains(target) &&
			!target.closest('[popovertarget="admin-profile-menu"]')
		) {
			menu.hidePopover();
		}
	}
</script>

<svelte:window onpointerdown={closeProfilePopoverOnOutsidePointerDown} />

<div class="flex min-h-screen flex-col bg-surface font-body text-ink">
	<header
		class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-hairline bg-white px-4 desktop:px-6"
	>
		<div class="flex items-center gap-3">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger
					class="inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-ink desktop:hidden"
				>
					<Menu class="size-5" aria-hidden="true" />
					<span class="sr-only">Buka menu navigasi</span>
				</SheetTrigger>
				<SheetContent side="left" class="w-72 bg-white p-4">
					<div class="mb-4 flex items-center gap-2 px-1">
						<span
							class="flex size-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container"
						>
							<Shield class="size-4.5" aria-hidden="true" />
						</span>
						<p class="font-display text-headline-md text-ink">Admin</p>
					</div>
					<AdminSidebar onNavigate={() => (sheetOpen = false)} />
				</SheetContent>
			</Sheet>
			<Button
				type="button"
				variant="text"
				size="sm"
				onclick={() => (collapsed = !collapsed)}
				class="hidden size-9 shrink-0 items-center justify-center rounded-lg px-0 text-on-surface-variant hover:bg-surface-container-high hover:text-ink desktop:inline-flex"
				aria-label={collapsed ? "Perluas menu" : "Ciutkan menu"}
				title={collapsed ? "Perluas menu" : "Ciutkan menu"}
			>
				{#if collapsed}
					<PanelLeftOpen class="size-5" aria-hidden="true" />
				{:else}
					<PanelLeftClose class="size-5" aria-hidden="true" />
				{/if}
			</Button>
			<span class="font-display text-headline-md font-bold tracking-tight text-ink">PKUBersua</span>
		</div>

		<div>
			<Button
				type="button"
				variant="text"
				size="sm"
				class="hidden h-10 items-center gap-2 rounded-lg px-2 mobile:inline-flex"
				aria-haspopup="menu"
				popovertarget="admin-profile-menu"
			>
				<Avatar src={avatarUrl} name={displayName} size="sm" />
				<span class="max-w-32 truncate text-label-md font-medium text-ink">{displayName}</span>
				<ChevronDown class="size-4 text-on-surface-variant" aria-hidden="true" />
			</Button>
			<div
				id="admin-profile-menu"
				popover="auto"
				class="z-40 w-48 rounded-lg border border-hairline bg-white p-1 shadow-lg"
				style="position: fixed; inset: 4.5rem 1.5rem auto auto; margin: 0;"
				role="menu"
			>
				<p class="truncate px-3 py-2 text-label-md text-on-surface-variant">{displayName}</p>
				<form method="POST" action="/myprofile?/signOut">
					<Button
						type="submit"
						variant="text"
						size="sm"
						class="w-full justify-start text-on-surface-variant hover:text-ink"
						role="menuitem"
					>
						<LogOut class="size-4" aria-hidden="true" />
						Keluar
					</Button>
				</form>
			</div>
		</div>
	</header>

	<div class="flex min-h-0 flex-1">
		<aside
			class="hidden shrink-0 border-r border-hairline bg-surface-container-lowest transition-[width] duration-200 ease-out desktop:block {collapsed
				? 'w-16'
				: 'w-64'}"
		>
			<div class="p-4">
				<AdminSidebar {collapsed} />
			</div>
		</aside>
		<main class="min-w-0 flex-1 p-4 tablet:p-6 desktop:p-8">
			<div class="mx-auto w-full max-w-[80rem]">
				{@render children()}
				<footer class="mt-8 border-t border-hairline pt-4 text-label-md text-on-surface-variant">
					© 2026 PKUBersua
				</footer>
			</div>
		</main>
	</div>
</div>
