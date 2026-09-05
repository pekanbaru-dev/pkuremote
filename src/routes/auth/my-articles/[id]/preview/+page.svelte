<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const { article, bodyHtml } = data;
</script>

<svelte:head>
	<title>Preview: {article.title} — PKUBersua</title>
</svelte:head>

<!-- Preview banner -->
<div class="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-hairline bg-primary/10 px-4 py-2.5 text-label-sm text-primary">
	<span class="font-semibold">Mode Preview</span>
	<a href="/auth/my-articles/{article.id}" class="hover:underline">← Kembali ke editor</a>
</div>

<div class="relative mx-auto w-full max-w-7xl px-2 pt-2 pb-4 tablet:px-[0.8rem] tablet:pt-2 tablet:pb-[1.4rem] min-h-screen">
	<div class="mx-auto max-w-3xl pt-10">
		<article>
			<!-- Header -->
			<header class="mb-8">
				<h1 class="font-display text-[2.125rem] tablet:text-[2.625rem] font-black text-ink leading-[1.18] tracking-[-0.016em] mb-3">
					{article.title}
				</h1>

				<!-- Cover image / Thumbnail -->
				{#if article.coverImageUrl}
					<div class="mb-4 rounded-2xl overflow-hidden border border-hairline">
						<img
							src={article.coverImageUrl}
							alt=""
							class="w-full object-cover max-h-80"
						/>
					</div>
				{/if}

				{#if article.categoryName}
					<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary mb-4">
						{article.categoryName}
					</span>
				{/if}

				<div class="flex items-center gap-3">
					{#if article.authorAvatarUrl}
						<img
							src={article.authorAvatarUrl}
							alt=""
							referrerpolicy="no-referrer"
							class="w-9 h-9 rounded-full object-cover border border-hairline shrink-0"
						/>
					{:else}
						<div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
							{(article.authorDisplayName ?? "A")[0]?.toUpperCase()}
						</div>
					{/if}
					<div class="flex flex-col">
						<span class="text-label-md font-label font-medium text-ink">
							{article.authorDisplayName ?? "PKUBersua"}
						</span>
						<span class="text-label-sm font-label text-muted-foreground">
							{article.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
						</span>
					</div>
				</div>
			</header>

			<!-- Body -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="prose prose-stone max-w-none article-body">{@html bodyHtml}</div>

			<!-- Tags -->
			{#if article.tags && article.tags.length > 0}
				<footer class="mt-12 border-t border-hairline pt-6">
					<div class="flex flex-wrap gap-2">
						{#each article.tags as tag (tag)}
							<span class="inline-flex items-center px-3 py-1.5 rounded-full border border-hairline bg-surface-container text-sm text-on-surface-variant">
								#{tag}
							</span>
						{/each}
					</div>
				</footer>
			{/if}
		</article>
	</div>
</div>
