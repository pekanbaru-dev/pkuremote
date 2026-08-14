<script lang="ts">
	import { ArticleStatusBadge } from "$lib/features/articles";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Artikel Saya</title>
</svelte:head>

<div class="container-page py-12">
	<div class="flex items-center justify-between mb-8">
		<h1 class="font-display text-display-sm font-bold text-ink">Artikel Saya</h1>
		<a
			href="/my-articles/new"
			class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
		>
			Tulis Artikel Baru
		</a>
	</div>

	{#if data.articles.length === 0}
		<div class="rounded-xl border border-hairline bg-surface-container-lowest p-12 text-center">
			<p class="text-body-md text-muted-foreground mb-4">Kamu belum menulis artikel apapun.</p>
			<a
				href="/my-articles/new"
				class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
			>
				Mulai Menulis
			</a>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.articles as article (article.id)}
				<div
					class="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-surface-container-lowest px-5 py-4"
				>
					<div class="flex flex-col gap-1 flex-1 min-w-0">
						<a
							href="/my-articles/{article.id}"
							class="font-display text-title-md font-semibold text-ink hover:text-primary truncate"
						>
							{article.title}
						</a>
						<p class="text-body-sm text-muted-foreground line-clamp-1">{article.excerpt}</p>
						<p class="text-label-sm text-muted-foreground font-label">
							{article.createdAt.toLocaleDateString("id-ID", {
								day: "numeric",
								month: "short",
								year: "numeric"
							})}
						</p>
					</div>

					<div class="flex items-center gap-3 shrink-0">
						<ArticleStatusBadge status={article.status} />
						<a
							href="/my-articles/{article.id}"
							class="text-label-sm font-label font-medium text-primary hover:underline"
						>
							Edit
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
