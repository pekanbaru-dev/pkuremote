<script lang="ts">
	import { ArticleCard, articleListJsonLd } from "$lib/features/articles";
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const jsonLd = $derived(
		articleListJsonLd(
			data.articles.map((a) => ({
				id: a.id,
				title: a.title,
				slug: a.slug,
				excerpt: a.excerpt,
				coverImageUrl: a.coverImageUrl,
				publishedAt: a.publishedAt,
				authorDisplayName: a.authorDisplayName,
				authorAvatarUrl: a.authorAvatarUrl
			})),
			PUBLIC_SITE_URL
		)
	);
</script>

<svelte:head>
	<title>Blog — PKUBersua</title>
	<meta name="description" content="Artikel dan tulisan dari komunitas PKUBersua Pekanbaru." />
	<link rel="canonical" href="{PUBLIC_SITE_URL}/blog" />
	<meta property="og:title" content="Blog — PKUBersua" />
	<meta
		property="og:description"
		content="Artikel dan tulisan dari komunitas PKUBersua Pekanbaru."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{PUBLIC_SITE_URL}/blog" />
	<link
		rel="alternate"
		type="application/rss+xml"
		title="PKUBersua Blog"
		href="{PUBLIC_SITE_URL}/blog/rss.xml"
	/>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd}
</svelte:head>

<div class="container-page py-12">
	<div class="mb-10">
		<h1 class="font-display text-display-sm font-bold text-ink mb-2">Blog</h1>
		<p class="text-body-md text-muted-foreground measure-prose">
			Artikel dan tulisan dari komunitas PKUBersua Pekanbaru.
		</p>
	</div>

	{#if data.articles.length === 0}
		<div class="rounded-xl border border-hairline bg-surface-container-lowest p-12 text-center">
			<p class="text-body-md text-muted-foreground">Belum ada artikel yang dipublikasikan.</p>
		</div>
	{:else}
		<div class="grid gap-6 mobile:grid-cols-2 desktop:grid-cols-3">
			{#each data.articles as article (article.id)}
				<ArticleCard
					article={{
						id: article.id,
						title: article.title,
						slug: article.slug,
						excerpt: article.excerpt,
						coverImageUrl: article.coverImageUrl,
						publishedAt: article.publishedAt,
						authorDisplayName: article.authorDisplayName,
						authorAvatarUrl: article.authorAvatarUrl
					}}
				/>
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="mt-10 flex items-center justify-center gap-2">
				{#if data.page > 1}
					<a
						href="/blog?page={data.page - 1}"
						class="px-4 py-2 rounded-lg border border-hairline text-label-md font-label font-medium text-ink hover:bg-surface-container transition-colors"
					>
						← Sebelumnya
					</a>
				{/if}

				<span class="text-label-md font-label text-muted-foreground px-3">
					{data.page} / {data.totalPages}
				</span>

				{#if data.page < data.totalPages}
					<a
						href="/blog?page={data.page + 1}"
						class="px-4 py-2 rounded-lg border border-hairline text-label-md font-label font-medium text-ink hover:bg-surface-container transition-colors"
					>
						Selanjutnya →
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
