<script lang="ts">
	import type { Snippet } from "svelte";
	import Menu from "@lucide/svelte/icons/menu";
	import LogOut from "@lucide/svelte/icons/log-out";
	import { Avatar, Button } from "$lib/components/primitives";
	import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
	import AdminSidebar from "./admin-sidebar.svelte";

	let { user, children }: { user: App.User | null; children: Snippet } = $props();

	let sheetOpen = $state(false);

	const displayName = $derived(user?.displayName ?? user?.email ?? "Admin");
	const avatarUrl = $derived(user?.avatarUrl ?? undefined);
</script>

<div class="min-h-screen bg-[#f7fafa] font-body text-ink">
	<header
		class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e8ecec] bg-[#073d3d] px-4 text-white shadow-md"
	>
		<div class="flex items-center gap-2">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger
					class="inline-flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 desktop:hidden"
				>
					<Menu class="size-5" aria-hidden="true" />
					<span class="sr-only">Buka menu navigasi</span>
				</SheetTrigger>
				<SheetContent side="left" class="w-72 bg-white p-4">
					<p class="font-display text-headline-md mb-4">Admin</p>
					<AdminSidebar onNavigate={() => (sheetOpen = false)} />
				</SheetContent>
			</Sheet>
			<span class="font-display text-headline-md font-bold">PKUBersua Admin</span>
		</div>

		<div class="flex items-center gap-3">
			<div class="hidden items-center gap-2 mobile:flex">
				<Avatar src={avatarUrl} name={displayName} size="sm" />
				<span class="text-label-md text-white/80">{displayName}</span>
			</div>
			<form method="POST" action="/myprofile?/signOut">
				<Button type="submit" variant="text" size="sm">
					<LogOut class="size-4" aria-hidden="true" />
					<span class="hidden mobile:inline">Keluar</span>
				</Button>
			</form>
		</div>
	</header>

	<div class="flex">
		<aside class="hidden w-64 shrink-0 border-r border-[#e8ecec] bg-white p-4 desktop:block">
			<AdminSidebar />
		</aside>
		<main class="min-w-0 flex-1 p-4 tablet:p-6 desktop:p-8">
			<div class="mx-auto w-full max-w-[80rem]">
				{@render children()}
			</div>
		</main>
	</div>
</div>
