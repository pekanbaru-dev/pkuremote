<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Button } from "$lib/components/ui/button";
	import User from "@lucide/svelte/icons/user";
	import FileText from "@lucide/svelte/icons/file-text";
	import CalendarCheck from "@lucide/svelte/icons/calendar-check";
	import LogOut from "@lucide/svelte/icons/log-out";
	import House from "@lucide/svelte/icons/house";

	let { data, children } = $props();

	const user = $derived(data.user);
	const displayName = $derived(user.displayName ?? user.email);
	const avatarUrl = $derived(user.avatarUrl ?? null);
	const monogram = $derived(displayName.charAt(0).toUpperCase());

	const currentPath = $derived(page.url.pathname);

	// Editor routes — hide nav and footer for clean writing experience
	const isEditorRoute = $derived(
		currentPath === "/auth/my-articles/new" ||
			(currentPath.startsWith("/auth/my-articles/") && currentPath !== "/auth/my-articles")
	);

	function navClass(href: string) {
		const active = currentPath === href || currentPath.startsWith(href + "/");
		return active
			? "text-primary font-semibold text-sm"
			: "text-on-surface-variant hover:text-ink transition-colors text-sm";
	}
</script>

<div class="flex min-h-screen flex-col">
	{#if !isEditorRoute}
		<header class="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur">
			<nav class="container-page flex h-16 items-center gap-14" aria-label="Navigasi area akun">
				<!-- Left: logo -->
				<a
					href="/"
					class="font-display text-base font-bold tracking-tight text-ink shrink-0"
					aria-label="PKUBersua — beranda"
				>
					PKUBersua
				</a>

				<!-- Nav links -->
				<ul class="flex items-center gap-10 flex-1" role="list">
					<li>
						<a href="/" class={"flex items-center gap-1.5 " + navClass("/")}>
							<House class="size-4 shrink-0" />
							Dashboard
						</a>
					</li>
					<li>
						<a
							href="/auth/myregistrations"
							class={"flex items-center gap-1.5 " + navClass("/auth/myregistrations")}
						>
							<CalendarCheck class="size-4 shrink-0" />
							My Registration
						</a>
					</li>
					<li>
						<a
							href="/auth/my-articles"
							class={"flex items-center gap-1.5 " + navClass("/auth/my-articles")}
						>
							<FileText class="size-4 shrink-0" />
							My Articles
						</a>
					</li>
				</ul>

				<!-- Right: avatar dropdown -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
						aria-label="Menu akun"
					>
						{#if avatarUrl}
							<img
								src={avatarUrl}
								alt=""
								referrerpolicy="no-referrer"
								class="h-9 w-9 rounded-full border border-hairline object-cover"
							/>
						{:else}
							<div
								aria-hidden="true"
								class="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface-container text-sm font-semibold text-on-surface-variant"
							>
								{monogram}
							</div>
						{/if}
					</DropdownMenu.Trigger>

					<DropdownMenu.Content
						align="end"
						class="w-52 shadow-none border border-hairline bg-white rounded-lg"
					>
						<DropdownMenu.Label class="font-normal px-3 py-2">
							<p class="text-sm font-semibold text-ink truncate">{displayName}</p>
							<p class="text-xs text-on-surface-variant truncate">{user.email}</p>
						</DropdownMenu.Label>
						<DropdownMenu.Separator class="bg-hairline" />
						<DropdownMenu.Item class="gap-2 px-3 py-2 cursor-pointer">
							<a href="/auth/myprofile" class="flex w-full items-center gap-2">
								<User class="size-4 text-on-surface-variant shrink-0" />
								<span class="text-sm text-ink">My Profile</span>
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator class="bg-hairline" />
						<DropdownMenu.Item class="p-0 focus:bg-transparent">
							<form method="POST" action="/auth/myprofile?/signOut" use:enhance class="w-full">
								<Button
									type="submit"
									variant="ghost"
									class="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-md"
								>
									<LogOut class="size-4 shrink-0" />
									Logout
								</Button>
							</form>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</nav>
		</header>
	{/if}

	<div class="flex flex-1 flex-col">
		{@render children()}
	</div>

	{#if !isEditorRoute}
		<footer class="border-t border-hairline bg-surface-container-low">
			<div class="container-page py-6 text-center">
				<p class="label-meta text-on-surface-variant">© 2026 PKUBersua | All Rights Reserved</p>
			</div>
		</footer>
	{/if}
</div>
