<script lang="ts">
	import { PUBLIC_SITE_URL } from "$env/static/public";
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

<article class="container-page py-12">
	<!-- Breadcrumb -->
	<nav aria-label="Breadcrumb" class="mb-8">
		<ol class="flex items-center gap-2 text-label-sm font-label text-muted-foreground">
			<li><a href="/" class="hover:text-ink transition-colors">Beranda</a></li>
			<li aria-hidden="true">/</li>
			<li><a href="/blog" class="hover:text-ink transition-colors">Blog</a></li>
			<li aria-hidden="true">/</li>
			<li class="text-ink truncate max-w-[200px]" aria-current="page">{data.article.title}</li>
		</ol>
	</nav>

	<!-- Cover image -->
	{#if data.article.coverImageUrl}
		<div class="mb-8 rounded-2xl overflow-hidden border border-hairline">
			<img
				src={data.article.coverImageUrl}
				alt=""
				width="1200"
				height="630"
				class="w-full object-cover max-h-80"
			/>
		</div>
	{/if}

	<!-- Header -->
	<header class="mb-8 max-w-3xl">
		<h1 class="font-display text-display-sm font-bold text-ink leading-tight mb-4">
			{data.article.title}
		</h1>
		<p class="text-body-lg text-muted-foreground measure-prose mb-6">{data.article.excerpt}</p>

		<div class="flex items-center gap-3">
			{#if data.article.authorAvatarUrl}
				<img
					src={data.article.authorAvatarUrl}
					alt=""
					width="36"
					height="36"
					class="w-9 h-9 rounded-full object-cover"
				/>
			{:else}
				<div
					class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold"
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
						{data.article.publishedAt.toLocaleDateString("id-ID", {
							day: "numeric",
							month: "long",
							year: "numeric"
						})}
					</time>
				{/if}
			</div>
		</div>
	</header>

	<!-- Body — DOMPurify-sanitized markdown output, safe to inject -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="prose prose-stone max-w-3xl text-body-md text-ink">{@html data.bodyHtml}</div>
</article>
