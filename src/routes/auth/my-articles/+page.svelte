<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { ArticleStatusBadge } from "$lib/features/articles";
	import type { ArticleStatus } from "$lib/features/articles/types";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import EllipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
	import Pencil from "@lucide/svelte/icons/pencil";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import CalendarPlus from "@lucide/svelte/icons/calendar-plus";
	import CalendarClock from "@lucide/svelte/icons/calendar-clock";
	import Search from "@lucide/svelte/icons/search";
	import X from "@lucide/svelte/icons/x";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	type Filter = ArticleStatus | "all";

	const filters: { value: Filter; label: string }[] = [
		{ value: "all", label: "All" },
		{ value: "draft", label: "Draft" },
		{ value: "in_review", label: "On Review" },
		{ value: "published", label: "Published" },
		{ value: "rejected", label: "Rejected" },
		{ value: "archived", label: "Trash" }
	];

	// Read active state from URL (synced by server)
	const activeFilter = $derived<Filter>((data.activeStatus as Filter) ?? "all");

	// Local input value for debounce — initialized from URL, mutated on input
	let inputValue = $state(data.activeQ ?? "");

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function updateURL(params: { status?: Filter; q?: string }) {
		const url = new URL(page.url);
		const status = params.status !== undefined ? params.status : activeFilter;
		const q = params.q !== undefined ? params.q : inputValue;

		if (status === "all") {
			url.searchParams.delete("status");
		} else {
			url.searchParams.set("status", status);
		}

		if (!q.trim()) {
			url.searchParams.delete("q");
		} else {
			url.searchParams.set("q", q.trim());
		}

		goto(url.toString(), { replaceState: false, keepFocus: true, noScroll: true });
	}

	function setFilter(status: Filter) {
		updateURL({ status });
	}

	function onSearchInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		inputValue = val;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			updateURL({ q: val });
		}, 350);
	}

	function clearSearch() {
		inputValue = "";
		if (debounceTimer) clearTimeout(debounceTimer);
		updateURL({ q: "" });
	}

	function formatDate(date: Date | null): string {
		if (!date) return "";
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	}
</script>

<svelte:head>
	<title>Artikel Saya — PKUBersua</title>
</svelte:head>

<div class="w-full container-page pt-[clamp(1.25rem,3vw,2rem)] pb-[clamp(3rem,7vw,5rem)]">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex flex-col gap-1">
			<h1
				class="font-title-lg tablet:font-headline-md text-title-lg tablet:text-headline-md text-primary"
			>
				Artikel Saya
			</h1>
			<p class="text-sm text-on-surface-variant">Kelola dan tulis artikel kamu di sini.</p>
		</div>
		<a
			href="/auth/my-articles/new"
			class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
		>
			Tulis Artikel Baru
		</a>
	</div>

	<!-- Search -->
	{#if data.articles.length > 0}
		<div class="relative mb-4">
			<Search
				class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none"
			/>
			<Input
				type="search"
				value={inputValue}
				oninput={onSearchInput}
				placeholder="Cari artikel..."
				class="w-full py-2 pl-9 pr-9"
			/>
			{#if inputValue}
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onclick={clearSearch}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-ink"
					aria-label="Hapus pencarian"
				>
					<X class="size-4" />
				</Button>
			{/if}
		</div>
	{/if}

	<!-- Filter tabs -->
	{#if data.counts.all > 0}
		<div class="flex flex-wrap gap-1 mb-6 border-b border-hairline pb-0">
			{#each filters as f (f.value)}
				<!-- eslint-disable-next-line svelte/no-restricted-html-elements -->
				<button
					type="button"
					onclick={() => setFilter(f.value)}
					class={[
						"inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
						activeFilter === f.value
							? "border-primary text-primary"
							: "border-transparent text-on-surface-variant hover:text-ink hover:border-hairline"
					].join(" ")}
				>
					{f.label}
					{#if data.counts[f.value as keyof typeof data.counts] > 0}
						<span
							class={[
								"inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none",
								activeFilter === f.value
									? "bg-primary/10 text-primary"
									: "bg-surface-container text-on-surface-variant"
							].join(" ")}
						>
							{data.counts[f.value as keyof typeof data.counts]}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if data.counts.all === 0}
		<div class="rounded-xl border border-hairline bg-surface-container-lowest p-12 text-center">
			<p class="text-body-md text-muted-foreground mb-4">Kamu belum menulis artikel apapun.</p>
			<a
				href="/auth/my-articles/new"
				class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
			>
				Mulai Menulis
			</a>
		</div>
	{:else if data.articles.length === 0}
		<div class="rounded-xl border border-hairline bg-surface-container-lowest p-12 text-center">
			<p class="text-body-md text-muted-foreground mb-4">Tidak ada artikel dengan status ini.</p>
			<div class="flex flex-wrap justify-center gap-3">
				<Button type="button" variant="outline" onclick={() => setFilter("all")}>
					Lihat semua artikel
				</Button>
				<a
					href="/auth/my-articles/new"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
				>
					Tulis Artikel Baru
				</a>
			</div>
		</div>
	{:else}
		<div class="grid gap-5 mobile:grid-cols-2 desktop:grid-cols-3">
			{#each data.articles as article (article.id)}
				<div
					class="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest transition-all hover:-translate-y-1 hover:shadow-sm"
				>
					<!-- Cover image with overlays -->
					<div class="relative overflow-hidden bg-surface-container" style="height: 176px;">
						<a
							href="/auth/my-articles/{article.id}"
							aria-label={article.title}
							class="absolute inset-0"
						>
							{#if article.coverImageUrl}
								<img
									src={article.coverImageUrl}
									alt=""
									loading="eager"
									decoding="async"
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							{:else}
								<div class="w-full h-full bg-surface-container flex items-center justify-center">
									<span
										class="font-label text-[0.75rem] uppercase tracking-wide text-muted-foreground"
										>Artikel</span
									>
								</div>
							{/if}
						</a>

						<!-- Status badge — kiri atas -->
						<div class="absolute top-2 left-2 pointer-events-none">
							<ArticleStatusBadge status={article.status} />
						</div>

						<!-- 3-dots — kanan atas -->
						<div class="absolute top-2 right-2">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger
									class="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
									aria-label="Opsi artikel"
								>
									<EllipsisVertical class="size-4" />
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									align="end"
									class="w-44 shadow-none border border-hairline bg-white rounded-lg"
								>
									<DropdownMenu.Item class="gap-2 px-3 py-2 cursor-pointer">
										<a href="/auth/my-articles/{article.id}" class="flex w-full items-center gap-2">
											<Pencil class="size-4 text-on-surface-variant shrink-0" />
											<span class="text-sm text-ink">Edit</span>
										</a>
									</DropdownMenu.Item>
									{#if article.status !== "archived"}
										<DropdownMenu.Separator class="bg-hairline" />
										<DropdownMenu.Item class="p-0 focus:bg-transparent">
											<form method="POST" action="?/archive" use:enhance class="w-full">
												<!-- eslint-disable-next-line svelte/no-restricted-html-elements -->
												<input type="hidden" name="id" value={article.id} />
												<Button
													type="submit"
													variant="ghost"
													class="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-md"
												>
													<Trash2 class="size-4 shrink-0" />
													Pindah ke Trash
												</Button>
											</form>
										</DropdownMenu.Item>
									{/if}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>

						<!-- Kategori — kiri bawah -->
						{#if article.categoryName}
							<div class="absolute bottom-2 left-2 pointer-events-none">
								<span
									class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-black/40 text-white backdrop-blur-sm"
								>
									{article.categoryName}
								</span>
							</div>
						{/if}
					</div>

					<!-- Content -->
					<div class="flex flex-1 flex-col gap-2 p-4">
						<a
							href="/auth/my-articles/{article.id}"
							class="font-display text-headline-sm font-semibold leading-tight text-ink line-clamp-3 hover:text-primary"
						>
							{article.title}
						</a>
						<p class="text-on-surface-variant text-[14px] line-clamp-4 flex-1">{article.excerpt}</p>
					</div>

					<!-- Footer -->
					<div
						class="flex items-center justify-between px-4 pb-4 pt-2 border-t border-hairline mt-auto gap-2"
					>
						<span
							class="flex items-center gap-1 text-[0.7rem] text-muted-foreground"
							title="Created at"
						>
							<CalendarPlus class="size-3 shrink-0" />
							Created: {formatDate(article.createdAt)}
						</span>
						{#if article.updatedAt}
							<span
								class="flex items-center gap-1 text-[0.7rem] text-muted-foreground"
								title="Last updated"
							>
								<CalendarClock class="size-3 shrink-0" />
								Last updated: {formatDate(article.updatedAt)}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
