<script lang="ts">
	import { ArticleEditor } from "$lib/features/articles";
	import { ArticleStatusBadge } from "$lib/features/articles";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import Clock from "@lucide/svelte/icons/clock";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const submitted = $derived(form?.submitted === true);
</script>

<svelte:head>
	<title>Edit: {data.article.title}</title>
</svelte:head>

<div
	class="relative mx-auto w-full max-w-7xl px-2 pt-2 pb-4 tablet:px-[0.8rem] tablet:pt-2 tablet:pb-[1.4rem]"
>
	<!-- Back button — floating left -->
	<a
		href="/auth/my-articles"
		class="fixed left-4 top-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-canvas/90 text-on-surface-variant shadow-sm backdrop-blur hover:bg-surface-container hover:text-ink transition-colors"
		aria-label="Kembali ke Artikel Saya"
	>
		<ChevronLeft class="size-4" />
	</a>

	{#if data.article.status === "draft" || data.article.status === "published" || data.article.status === "rejected"}
		{#if data.article.status === "rejected"}
			<!-- Rejection banner — shown above editor -->
			<div
				class="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
			>
				<CircleX class="size-5 text-rose-600 shrink-0 mt-0.5" />
				<div class="flex-1">
					<p class="text-sm font-semibold text-rose-800">Artikel ditolak</p>
					{#if data.article.reviewNote}
						<p class="text-sm text-rose-700 mt-0.5">
							Catatan editor: <span class="font-medium">{data.article.reviewNote}</span>
						</p>
					{:else}
						<p class="text-sm text-rose-700 mt-0.5">
							Silakan perbaiki artikelmu dan kirim ulang untuk review.
						</p>
					{/if}
				</div>
			</div>
		{/if}
		{#if submitted}
			<div
				class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-body-md text-green-700"
				role="status"
			>
				Artikel berhasil dikirim untuk review. Tim editor akan segera meninjau artikelmu.
			</div>
		{/if}
		<ArticleEditor article={data.article} error={form?.error} categories={data.categories} />
	{:else if data.article.status === "in_review"}
		<div class="mx-auto max-w-3xl pt-10">
			<!-- Status banner -->
			<div
				class="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
			>
				<Clock class="size-5 text-amber-600 shrink-0 mt-0.5" />
				<div>
					<p class="text-sm font-semibold text-amber-800">Sedang dalam review</p>
					<p class="text-sm text-amber-700 mt-0.5">
						Kamu tidak bisa mengedit sampai editor memberikan feedback.
					</p>
				</div>
			</div>

			<!-- Article preview — ikuti style blog -->
			<article>
				<!-- Header -->
				<header class="mb-8">
					<div class="flex items-center gap-2 mb-3">
						<ArticleStatusBadge status={data.article.status} />
					</div>
					<h1
						class="font-display text-[2.125rem] tablet:text-[2.625rem] font-black text-ink leading-[1.18] tracking-[-0.016em] mb-3"
					>
						{data.article.title}
					</h1>

					<!-- Cover image -->
					{#if data.article.coverImageUrl}
						<div class="mb-4 rounded-2xl overflow-hidden border border-hairline">
							<img src={data.article.coverImageUrl} alt="" class="w-full object-cover max-h-80" />
						</div>
					{/if}

					{#if data.article.categoryName}
						<span
							class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary mb-4"
						>
							{data.article.categoryName}
						</span>
					{/if}

					<div class="flex items-center gap-3">
						<div
							class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0"
						>
							{(data.article.authorDisplayName ?? "A")[0]?.toUpperCase()}
						</div>
						<div class="flex flex-col">
							<span class="text-label-md font-label font-medium text-ink">
								{data.article.authorDisplayName ?? "PKUBersua"}
							</span>
							<span class="text-label-sm font-label text-muted-foreground">
								{data.article.createdAt.toLocaleDateString("id-ID", {
									day: "numeric",
									month: "long",
									year: "numeric"
								})}
							</span>
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
								<span
									class="inline-flex items-center px-3 py-1.5 rounded-full border border-hairline bg-surface-container text-sm text-on-surface-variant"
								>
									#{tag}
								</span>
							{/each}
						</div>
					</footer>
				{/if}
			</article>
		</div>
	{:else if data.article.status === "archived"}
		<div class="mx-auto max-w-3xl pt-10 text-center">
			<p class="text-body-md text-muted-foreground">Artikel ini sudah diarsipkan.</p>
			<a
				href="/auth/my-articles"
				class="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm"
			>
				← Kembali ke daftar artikel
			</a>
		</div>
	{/if}
</div>
