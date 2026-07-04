<script lang="ts">
	import type { Snippet } from "svelte";
	import type { User } from "@supabase/supabase-js";
	import Menu from "@lucide/svelte/icons/menu";
	import LogOut from "@lucide/svelte/icons/log-out";
	import { Avatar, Button } from "$lib/components/primitives";
	import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
	import AdminSidebar from "./admin-sidebar.svelte";

	let { user, children }: { user: User | null; children: Snippet } = $props();

	let sheetOpen = $state(false);

	const displayName = $derived(
		(user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Admin"
	);
	const avatarUrl = $derived(user?.user_metadata?.avatar_url as string | undefined);
</script>

<div class="bg-canvas text-ink min-h-screen">
	<header
		class="border-hairline bg-canvas sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4"
	>
		<div class="flex items-center gap-2">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger
					class="hover:bg-muted inline-flex size-9 items-center justify-center rounded-lg desktop:hidden"
				>
					<Menu class="size-5" aria-hidden="true" />
					<span class="sr-only">Buka menu navigasi</span>
				</SheetTrigger>
				<SheetContent side="left" class="bg-canvas w-72 p-4">
					<p class="font-display text-headline-md mb-4">Admin</p>
					<AdminSidebar onNavigate={() => (sheetOpen = false)} />
				</SheetContent>
			</Sheet>
			<span class="font-display text-headline-md">Admin</span>
		</div>

		<div class="flex items-center gap-3">
			<div class="hidden items-center gap-2 mobile:flex">
				<Avatar src={avatarUrl} name={displayName} size="sm" />
				<span class="text-label-md text-on-surface-variant">{displayName}</span>
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
		<aside class="border-hairline hidden w-64 shrink-0 border-r p-4 desktop:block">
			<AdminSidebar />
		</aside>
		<main class="min-w-0 flex-1">
			{@render children()}
		</main>
	</div>
</div>
