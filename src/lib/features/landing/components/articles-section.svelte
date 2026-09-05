<script lang="ts" module>
	import type { ArticleWithAuthor } from "$lib/server/articles/db-articles";

	export type ArticlesSectionProps = {
		articles: ArticleWithAuthor[];
	};
</script>

<script lang="ts">
	let { articles }: ArticlesSectionProps = $props();

	function formatDate(date: Date | null): string {
		if (!date) return "";
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	}
</script>

<section id="articles" class="pt-11">
	<div class="mb-5 flex items-end justify-between">
		<div>
			<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">
				Artikel & Blog Terbaru
			</h2>
			<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
				Insight dan cerita dari komunitas Pekanbaru.
			</p>
		</div>
		<a
			class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
			href="/blog"
		>
			Lihat semua artikel
		</a>
	</div>

	{#if articles.length === 0}
		<p class="text-sm text-[#66747a]">Belum ada artikel yang diterbitkan.</p>
	{:else}
		<div class="grid gap-4 mobile:grid-cols-2 desktop:grid-cols-4">
			{#each articles as article (article.id)}
				<a
					href="/blog/{article.slug}"
					class="group overflow-hidden rounded-2xl border border-slate-200 bg-white flex flex-col"
				>
					<!-- Cover -->
					<div class="h-40 overflow-hidden bg-linear-to-br from-[#2e3230] to-[#315c53] shrink-0">
						{#if article.coverImageUrl}
							<img
								src={article.coverImageUrl}
								alt=""
								loading="eager"
								decoding="async"
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{/if}
					</div>
					<!-- Content -->
					<div class="flex min-h-34.5 flex-col p-4">
						<div class="flex items-center justify-between gap-3">
							{#if article.categoryName}
								<span
									class="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700"
								>
									{article.categoryName}
								</span>
							{:else}
								<span></span>
							{/if}
							<span class="text-xs leading-5 text-[#66747a]">{formatDate(article.publishedAt)}</span
							>
						</div>
						<h3 class="mt-3 text-[15px] font-black leading-5 line-clamp-3">{article.title}</h3>
						<div class="mt-auto flex items-center gap-2 text-xs leading-5 text-[#66747a]">
							{#if article.authorAvatarUrl}
								<img
									src={article.authorAvatarUrl}
									alt=""
									referrerpolicy="no-referrer"
									class="h-6 w-6 rounded-full object-cover"
								/>
							{:else}
								<span
									class="grid h-6 w-6 place-items-center rounded-full bg-violet-700 text-[8px] font-black text-white shrink-0"
									aria-hidden="true"
								>
									{(article.authorDisplayName ?? "P")[0].toUpperCase()}
								</span>
							{/if}
							<span class="truncate">{article.authorDisplayName ?? "PKUBersua"}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
