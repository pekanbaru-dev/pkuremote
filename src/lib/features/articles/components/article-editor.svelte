<script lang="ts" module>
	import type { ArticleStatus } from "../types.ts";

	export type ArticleEditorProps = {
		/** Existing article data for edit mode; undefined for new article. */
		article?: {
			id: string;
			title: string;
			slug: string;
			excerpt: string;
			body: string;
			coverImageUrl: string | null;
			status: ArticleStatus;
			reviewNote: string | null;
		};
		/** Form action error message, if any. */
		error?: string;
	};

	/** Client-side slug preview from title (pure, no DB). */
	function slugifyPreview(title: string): string {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_]+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
</script>

<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Button } from "$lib/components/ui/button";

	let { article, error }: ArticleEditorProps = $props();

	const isEdit = $derived(!!article?.id);
	const isSubmittable = $derived(!article || article.status === "draft");
	/** Named form action: `create` for new articles, `update` for edits. */
	const saveAction = $derived(isEdit ? "?/update" : "?/create");

	let title = $state(article?.title ?? "");
	let slug = $state(article?.slug ?? "");
	let excerpt = $state(article?.excerpt ?? "");
	let body = $state(article?.body ?? "");
	let slugManuallyEdited = $state(!!article?.id);

	$effect(() => {
		if (!slugManuallyEdited && title) {
			slug = slugifyPreview(title);
		}
	});

	function onSlugInput() {
		slugManuallyEdited = true;
	}
</script>

<div class="flex flex-col gap-6">
	{#if error}
		<div
			class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-md text-red-700"
			role="alert"
		>
			{error}
		</div>
	{/if}

	{#if article?.reviewNote}
		<div class="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-body-md text-ink">
			<span class="font-semibold">Catatan editor:</span>
			{article.reviewNote}
		</div>
	{/if}

	<form method="POST" action={saveAction} enctype="multipart/form-data" class="flex flex-col gap-5">
		{#if isEdit}
			<Input type="hidden" name="id" value={article?.id} />
		{/if}

		<!-- Title -->
		<div class="flex flex-col gap-1.5">
			<label for="title-input" class="mb-1 block text-sm font-medium text-ink">Judul</label>
			<Input
				id="title-input"
				name="title"
				type="text"
				required
				bind:value={title}
				placeholder="Judul artikel..."
			/>
		</div>

		<!-- Slug -->
		<div class="flex flex-col gap-1.5">
			<label for="slug-input" class="mb-1 block text-sm font-medium text-ink">
				Slug URL <span class="text-muted-foreground font-normal">(bisa diubah manual)</span>
			</label>
			<div class="flex items-center gap-2">
				<span class="text-body-sm text-muted-foreground font-label">/blog/</span>
				<Input
					id="slug-input"
					name="slug"
					type="text"
					bind:value={slug}
					oninput={onSlugInput}
					placeholder="slug-artikel"
					class="flex-1"
				/>
			</div>
		</div>

		<!-- Excerpt -->
		<div class="flex flex-col gap-1.5">
			<label for="excerpt-input" class="mb-1 block text-sm font-medium text-ink">Ringkasan</label>
			<Textarea
				id="excerpt-input"
				name="excerpt"
				rows={2}
				required
				bind:value={excerpt}
				placeholder="Ringkasan singkat artikel (tampil di listing dan meta description)..."
			/>
		</div>

		<!-- Body -->
		<div class="flex flex-col gap-1.5">
			<label for="body-input" class="mb-1 block text-sm font-medium text-ink">
				Isi Artikel <span class="text-muted-foreground font-normal">(Markdown)</span>
			</label>
			<Textarea
				id="body-input"
				name="body"
				rows={20}
				required
				bind:value={body}
				placeholder="Tulis artikel di sini menggunakan Markdown..."
				class="font-mono"
			/>
		</div>

		<!-- Cover image -->
		<div class="flex flex-col gap-1.5">
			<label for="coverImage" class="mb-1 block text-sm font-medium text-ink">
				Cover Image <span class="text-muted-foreground font-normal">(opsional, maks 2MB)</span>
			</label>
			{#if article?.coverImageUrl}
				<img
					src={article.coverImageUrl}
					alt="Cover saat ini"
					width="400"
					height="210"
					class="rounded-lg object-cover w-full max-w-sm h-40 border border-hairline"
				/>
			{/if}
			<Input
				id="coverImage"
				name="coverImage"
				type="file"
				accept="image/png,image/jpeg,image/webp"
				class="text-body-md text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-label-sm file:font-label file:font-medium file:text-primary hover:file:bg-primary/20"
			/>
		</div>

		<!-- Actions -->
		<div class="flex gap-3 flex-wrap pt-2">
			<Button type="submit" variant="outline">Simpan Draft</Button>

			{#if isSubmittable}
				<Button type="submit" formaction="?/submitReview">Kirim untuk Review</Button>
			{/if}
		</div>
	</form>
</div>
