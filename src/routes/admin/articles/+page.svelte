<script lang="ts">
	import { ArticleStatusBadge } from "$lib/features/articles";
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from "$lib/components/ui/table/index.js";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const STATUS_TABS = [
		{ value: "in_review", label: "Menunggu Review" },
		{ value: "draft", label: "Draft" },
		{ value: "published", label: "Published" },
		{ value: "rejected", label: "Ditolak" },
		{ value: "archived", label: "Arsip" }
	] as const;
</script>

<svelte:head>
	<title>Manajemen Artikel — Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<h1 class="font-display text-display-sm font-bold text-ink">Artikel</h1>
	</div>

	<!-- Status filter tabs -->
	<div class="flex gap-2 flex-wrap border-b border-hairline pb-2">
		{#each STATUS_TABS as tab (tab.value)}
			<a
				href="/admin/articles?status={tab.value}"
				class="px-4 py-2 rounded-t-lg text-label-md font-label font-medium transition-colors {data.status ===
				tab.value
					? 'bg-primary text-on-primary'
					: 'text-muted-foreground hover:text-ink hover:bg-surface-container'}"
			>
				{tab.label}
			</a>
		{/each}
	</div>

	<!-- Articles table -->
	{#if data.articles.length === 0}
		<div class="rounded-xl border border-hairline bg-surface-container-lowest p-12 text-center">
			<p class="text-body-md text-muted-foreground">Tidak ada artikel dengan status ini.</p>
		</div>
	{:else}
		<div class="rounded-xl border border-hairline overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Judul</TableHead>
						<TableHead class="hidden tablet:table-cell">Penulis</TableHead>
						<TableHead class="hidden tablet:table-cell">Tanggal</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Aksi</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each data.articles as article (article.id)}
						<TableRow>
							<TableCell>
								<span class="font-display text-body-md font-medium text-ink line-clamp-1">
									{article.title}
								</span>
								<p class="text-label-sm text-muted-foreground font-label line-clamp-1 mt-0.5">
									{article.excerpt}
								</p>
							</TableCell>
							<TableCell class="hidden tablet:table-cell">
								<span class="text-body-sm text-muted-foreground">
									{article.authorDisplayName ?? "—"}
								</span>
							</TableCell>
							<TableCell class="hidden tablet:table-cell">
								<span class="text-body-sm text-muted-foreground font-label">
									{article.createdAt.toLocaleDateString("id-ID", {
										day: "numeric",
										month: "short",
										year: "numeric"
									})}
								</span>
							</TableCell>
							<TableCell>
								<ArticleStatusBadge status={article.status} />
							</TableCell>
							<TableCell>
								<a
									href="/admin/articles/{article.id}"
									class="text-label-sm font-label font-medium text-primary hover:underline"
								>
									Review
								</a>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>
