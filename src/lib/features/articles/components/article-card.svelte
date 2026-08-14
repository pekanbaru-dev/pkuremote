<script lang="ts" module>
	import type { ArticleCardData } from "../types.ts";

	export type ArticleCardProps = {
		article: ArticleCardData;
		class?: string;
	};

	function formatDate(date: Date | null): string {
		if (!date) return "";
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	}
</script>

<script lang="ts">
	let { article, class: className }: ArticleCardProps = $props();

	const dateLabel = $derived(formatDate(article.publishedAt));
</script>

<div
	class="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest shadow-md transition-all hover:-translate-y-1 hover:shadow-xl {className ??
		''}"
>
	<a href="/blog/{article.slug}" aria-label={article.title} class="flex flex-col flex-1">
		<!-- Cover image -->
		<div class="h-48 overflow-hidden bg-surface-container">
			{#if article.coverImageUrl}
				<img
					src={article.coverImageUrl}
					alt=""
					loading="lazy"
					decoding="async"
					width="1200"
					height="630"
					class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			{:else}
				<div class="w-full h-full bg-surface-container flex items-center justify-center">
					<span class="font-label text-[0.75rem] uppercase tracking-wide text-muted-foreground"
						>Artikel</span
					>
				</div>
			{/if}
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col gap-3 p-4">
			<h3 class="font-display text-headline-sm font-semibold leading-tight text-ink line-clamp-2">
				{article.title}
			</h3>
			<p class="text-on-surface-variant text-body-md line-clamp-3 flex-1">{article.excerpt}</p>
		</div>
	</a>

	<!-- Footer: author + date -->
	<div class="flex items-center justify-between px-4 pb-4 pt-2 border-t border-hairline mt-auto">
		<div class="flex items-center gap-2">
			{#if article.authorAvatarUrl}
				<img
					src={article.authorAvatarUrl}
					alt=""
					width="24"
					height="24"
					class="w-6 h-6 rounded-full object-cover"
				/>
			{:else}
				<div
					class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[0.625rem] font-bold"
				>
					{(article.authorDisplayName ?? "A")[0].toUpperCase()}
				</div>
			{/if}
			<span class="text-label-sm text-muted-foreground font-label truncate max-w-[120px]">
				{article.authorDisplayName ?? "Penulis"}
			</span>
		</div>
		{#if dateLabel}
			<span class="text-label-sm text-muted-foreground font-label">{dateLabel}</span>
		{/if}
	</div>
</div>
