<script lang="ts">
	import { PUBLIC_SITE_URL } from "$env/static/public";
	import SiteHeader from "$lib/components/site-header.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const canonicalUrl = $derived(`${PUBLIC_SITE_URL}/blog/${data.article.slug}`);
	const ogImage = $derived(data.article.coverImageUrl ?? `${PUBLIC_SITE_URL}/og-default.png`);
	const publishedIso = $derived(data.article.publishedAt?.toISOString() ?? "");
</script>

<svelte:head>
	<title>{data.article.title} — PKUBersua</title>
	<meta name="description" content={data.article.excerpt} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={data.article.title} />
	<meta property="og:description" content={data.article.excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImage} />
	{#if publishedIso}
		<meta property="article:published_time" content={publishedIso} />
	{/if}
	<meta property="article:author" content={data.article.authorDisplayName ?? "PKUBersua"} />

	<!-- JSON-LD — server-generated trusted strings, safe to inject -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.jsonLdArticle}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.jsonLdBreadcrumb}
</svelte:head>

<SiteHeader variant="light" />

<article class="container-page pt-6 pb-12">
	<!-- Breadcrumb -->
	<nav aria-label="Breadcrumb" class="mb-8 max-w-3xl mx-auto">
		<ol class="flex items-center gap-2 text-[14px] font-label text-muted-foreground">
			<li><a href="/" class="hover:text-ink transition-colors">Beranda</a></li>
			<li aria-hidden="true">/</li>
			<li><a href="/blog" class="hover:text-ink transition-colors">Blog</a></li>
			<li aria-hidden="true">/</li>
			<li class="text-ink truncate max-w-[200px]" aria-current="page">{data.article.title}</li>
		</ol>
	</nav>

	<div class="max-w-3xl mx-auto">
		<!-- Header -->
		<header class="mb-8">
			<h1 class="font-display text-[2.125rem] tablet:text-[2.625rem] font-black text-ink leading-[1.18] tracking-[-0.016em] mb-3">
				{data.article.title}
			</h1>

			<!-- Kategori -->
			{#if data.article.categoryName}
				<a
					href="/blog?category={data.article.categoryName}"
					class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary mb-4 hover:bg-primary/20 transition-colors"
				>
					{data.article.categoryName}
				</a>
			{/if}

			<!-- Cover image / Thumbnail -->
			{#if data.article.coverImageUrl}
				<div class="mb-6 rounded-2xl overflow-hidden border border-hairline">
					<img
						src={data.article.coverImageUrl}
						alt=""
						width="1200"
						height="630"
						class="w-full object-cover max-h-[28rem]"
					/>
				</div>
			{/if}

			<div class="flex items-center gap-3">
				{#if data.article.authorAvatarUrl}
					<img
						src={data.article.authorAvatarUrl}
						alt=""
						width="36"
						height="36"
						referrerpolicy="no-referrer"
						class="w-9 h-9 rounded-full object-cover"
					/>
				{:else}
					<div
						class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0"
					>
						{(data.article.authorDisplayName ?? "A")[0].toUpperCase()}
					</div>
				{/if}
				<div class="flex flex-col">
					<span class="text-label-md font-label font-medium text-ink">
						{data.article.authorDisplayName ?? "PKUBersua"}
					</span>
					{#if data.article.publishedAt}
						<time datetime={publishedIso} class="text-label-sm font-label text-muted-foreground">
							{data.article.publishedAt.toLocaleString("id-ID", {
								day: "numeric",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								timeZone: "Asia/Jakarta"
							})}
						</time>
					{/if}
				</div>
			</div>
		</header>

		<!-- Body -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="prose prose-stone max-w-none article-body">{@html data.bodyHtml}</div>

		<!-- Tags -->
		{#if data.article.tags && data.article.tags.length > 0}
			<footer class="mt-12 border-t border-hairline pt-6">
				<div class="flex flex-wrap gap-2">
					{#each data.article.tags as tag (tag)}
						<span class="inline-flex items-center px-3 py-1.5 rounded-full border border-hairline bg-surface-container text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
							#{tag}
						</span>
					{/each}
				</div>
			</footer>
		{/if}
	</div>
</article>
