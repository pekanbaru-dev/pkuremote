<script lang="ts">
	import { ArticleStatusBadge, ArticleReviewForm } from "$lib/features/articles";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let slugEditMode = $state(false);
	// Snapshot initial slug into local state — intentional one-time capture for the edit form.
	const _initialSlug = data.article.slug;
	let slugValue = $state(_initialSlug);
</script>

<svelte:head>
	<title>Review: {data.article.title} — Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="flex flex-col gap-1">
			<a
				href="/admin/articles"
				class="text-label-md font-label text-muted-foreground hover:text-ink mb-1 inline-block"
			>
				← Daftar Artikel
			</a>
			<h1 class="font-display text-display-sm font-bold text-ink">{data.article.title}</h1>
			<div class="flex items-center gap-3 mt-1">
				<ArticleStatusBadge status={data.article.status} />
				<span class="text-label-sm text-muted-foreground font-label">
					oleh {data.article.authorDisplayName ?? "—"}
				</span>
				{#if data.article.publishedAt}
					<span class="text-label-sm text-muted-foreground font-label">
						{data.article.publishedAt.toLocaleDateString("id-ID", {
							day: "numeric",
							month: "long",
							year: "numeric"
						})}
					</span>
				{/if}
			</div>
		</div>
	</div>

	{#if form?.success}
		<div
			class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-body-md text-green-700"
			role="status"
		>
			{#if form.action === "approved"}Artikel berhasil disetujui dan dipublish.
			{:else if form.action === "rejected"}Artikel dikembalikan ke penulis.
			{:else if form.action === "archived"}Artikel berhasil diarsipkan.
			{:else if form.action === "slugUpdated"}Slug berhasil diperbarui.
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div
			class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-md text-red-700"
			role="alert"
		>
			{form.error}
		</div>
	{/if}

	<div class="grid desktop:grid-cols-3 gap-6">
		<!-- Article preview -->
		<div class="desktop:col-span-2 flex flex-col gap-4">
			{#if data.article.coverImageUrl}
				<img
					src={data.article.coverImageUrl}
					alt=""
					width="1200"
					height="630"
					class="rounded-xl w-full object-cover max-h-72 border border-hairline"
				/>
			{/if}

			<div class="rounded-xl border border-hairline bg-surface-container-lowest p-6">
				<p class="text-body-md text-muted-foreground italic mb-4">{data.article.excerpt}</p>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="prose prose-stone max-w-none text-body-md text-ink">{@html data.bodyHtml}</div>
			</div>
		</div>

		<!-- Sidebar: metadata + review actions -->
		<div class="flex flex-col gap-4">
			<!-- Metadata -->
			<div
				class="rounded-xl border border-hairline bg-surface-container-lowest p-4 flex flex-col gap-3"
			>
				<h2 class="font-display text-title-sm font-semibold text-ink">Metadata</h2>
				<div class="flex flex-col gap-1.5">
					<span class="text-label-sm font-label font-medium text-muted-foreground">Slug</span>
					{#if slugEditMode}
						<form method="POST" action="?/updateSlug" class="flex gap-2 items-center">
							<Input name="slug" type="text" bind:value={slugValue} class="flex-1 text-body-sm" />
							<Button type="submit" size="sm" variant="outline">Simpan</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onclick={() => {
									slugEditMode = false;
									slugValue = data.article.slug;
								}}
							>
								Batal
							</Button>
						</form>
					{:else}
						<div class="flex items-center gap-2">
							<code
								class="text-body-sm text-ink bg-surface-container px-2 py-0.5 rounded font-mono flex-1 truncate"
								>{data.article.slug}</code
							>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onclick={() => (slugEditMode = true)}
							>
								Edit
							</Button>
						</div>
					{/if}
				</div>
				{#if data.article.reviewNote}
					<div class="flex flex-col gap-1">
						<span class="text-label-sm font-label font-medium text-muted-foreground">
							Catatan Sebelumnya
						</span>
						<p class="text-body-sm text-ink">{data.article.reviewNote}</p>
					</div>
				{/if}
			</div>

			<!-- Review actions -->
			{#if data.article.status === "in_review"}
				<ArticleReviewForm articleId={data.article.id} isAdmin={data.isAdmin} />
			{:else if data.article.status === "published" && data.isAdmin}
				<div class="rounded-xl border border-hairline bg-surface-container-lowest p-4">
					<h2 class="font-display text-title-sm font-semibold text-ink mb-3">Aksi Admin</h2>
					<form method="POST" action="?/archive">
						<Input type="hidden" name="id" value={data.article.id} />
						<Button type="submit" variant="outline" size="sm">Arsipkan</Button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
