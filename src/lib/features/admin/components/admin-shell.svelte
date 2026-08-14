<script lang="ts">
	import type { Snippet } from "svelte";
	import Menu from "@lucide/svelte/icons/menu";
	import LogOut from "@lucide/svelte/icons/log-out";
	import Shield from "@lucide/svelte/icons/shield-check";
	import { Avatar, Button } from "$lib/components/primitives";
	import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
	import AdminSidebar from "./admin-sidebar.svelte";

	let { user, children }: { user: App.User | null; children: Snippet } = $props();

	let sheetOpen = $state(false);

	const displayName = $derived(user?.displayName ?? user?.email ?? "Admin");
	const avatarUrl = $derived(user?.avatarUrl ?? undefined);
</script>

<div class="min-h-screen bg-surface font-body text-ink">
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
			<span class="font-display text-headline-md font-bold tracking-tight text-ink">PKUBersua</span>
		</div>

		<div class="flex items-center gap-3">
			<div class="hidden items-center gap-2.5 mobile:flex">
				<Avatar src={avatarUrl} name={displayName} size="sm" />
				<div class="leading-tight">
					<p class="text-label-md font-semibold text-ink">{displayName}</p>
				</div>
			</div>
			<span class="hidden h-6 w-px bg-hairline tablet:block" aria-hidden="true"></span>
			<form method="POST" action="/myprofile?/signOut">
				<Button
					type="submit"
					variant="text"
					size="sm"
					class="text-on-surface-variant hover:text-ink"
				>
					<LogOut class="size-4" aria-hidden="true" />
					<span class="hidden mobile:inline">Keluar</span>
				</Button>
			</form>
		</div>
	</header>

	<div class="flex">
		<aside
			class="hidden w-64 shrink-0 border-r border-hairline bg-surface-container-lowest p-4 desktop:block"
		>
			<AdminSidebar />
		</aside>
		<main class="min-w-0 flex-1 p-4 tablet:p-6 desktop:p-8">
			<div class="mx-auto w-full max-w-[80rem]">
				{@render children()}
			</div>
		</main>
	</div>
</div>
