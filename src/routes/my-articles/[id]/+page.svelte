<script lang="ts">
	import { ArticleEditor, ArticleStatusBadge } from "$lib/features/articles";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const submitted = $derived(form?.submitted === true);
</script>

<svelte:head>
	<title>Edit: {data.article.title}</title>
</svelte:head>

<div class="container-page py-12">
	<div class="mb-6 flex items-center gap-4 flex-wrap">
		<a href="/my-articles" class="text-label-md font-label text-muted-foreground hover:text-ink">
			← Artikel Saya
		</a>
		<h1 class="font-display text-display-sm font-bold text-ink flex-1 min-w-0 truncate">
			{data.article.title}
		</h1>
		<ArticleStatusBadge status={data.article.status} />
	</div>

	{#if submitted}
		<div
			class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-body-md text-green-700"
			role="status"
		>
			Artikel berhasil dikirim untuk review.
		</div>
	{/if}

	{#if data.article.status === "in_review"}
		<div
			class="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-body-md text-ink"
		>
			Artikel ini sedang dalam review. Kamu tidak bisa mengedit sampai editor memberikan feedback.
		</div>
	{/if}

	{#if data.article.status === "published"}
		<div class="mb-6 flex items-center gap-3">
			<span class="text-body-md text-muted-foreground">Artikel ini sudah tayang di</span>
			<a
				href="/blog/{data.article.slug}"
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary hover:underline text-body-md"
			>
				/blog/{data.article.slug}
			</a>
		</div>
	{/if}

	<div class="max-w-3xl">
		{#if data.article.status === "draft" || data.article.status === "published"}
			<ArticleEditor article={data.article} error={form?.error} />
		{:else if data.article.status === "in_review"}
			<!-- Read-only view while in review -->
			<div
				class="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-container-lowest p-6"
			>
				<h2 class="font-display text-title-md font-semibold text-ink">{data.article.title}</h2>
				<p class="text-body-md text-muted-foreground">{data.article.excerpt}</p>
				<pre class="whitespace-pre-wrap text-body-md text-ink font-body">{data.article.body}</pre>
			</div>
		{/if}
	</div>
</div>
