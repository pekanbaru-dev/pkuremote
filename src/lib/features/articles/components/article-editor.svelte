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
	categories?: { id: string; name: string }[];
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
	import { FileUpload } from "$lib/components/primitives";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Button } from "$lib/components/ui/button";
	import TipTapEditor from "./tiptap-editor.svelte";

	let { article, error, categories = [] }: ArticleEditorProps = $props();

	const isEdit = $derived(!!article?.id);
	const isSubmittable = $derived(!article || article.status === "draft");
	/** Named form action: `create` for new articles, `update` for edits. */
	const saveAction = $derived(isEdit ? "?/update" : "?/create");

	// Snapshot initial prop values into local state. These are intentionally
	// one-time captures — the form fields are controlled by the user after mount.
	const _initial = article;
	let title = $state(_initial?.title ?? "");
	let slug = $state(_initial?.slug ?? "");
	let excerpt = $state(_initial?.excerpt ?? "");
	let body = $state(_initial?.body ?? "");
	let coverImageUrl = $state(_initial?.coverImageUrl ?? "");
	let slugManuallyEdited = $state(!!_initial?.id);

	$effect(() => {
		if (!slugManuallyEdited && title) {
			slug = slugifyPreview(title);
		}
	});

	function onSlugInput() {
		slugManuallyEdited = true;
	}

	async function getCoverPresignedUrl(file: { filename: string; contentType: string }) {
		const response = await fetch("/my-articles/presign", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(file)
		});
		if (!response.ok) throw new Error("Gagal menyiapkan upload");
		return response.json() as Promise<{ presignedUrl: string; publicUrl: string }>;
	}
</script>

<div class="flex flex-col gap-7">
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

	<form method="POST" action={saveAction} enctype="multipart/form-data" class="flex flex-col gap-7">
		{#if isEdit}
			<Input type="hidden" name="id" value={article?.id} />
		{/if}

		<!-- Title -->
		<div>
			<label for="title-input" class="sr-only">Judul artikel</label>
			<Input
				id="title-input"
				name="title"
				type="text"
				required
				bind:value={title}
				placeholder="Judul cerita Anda"
				class="h-auto rounded-none border-0 border-b border-hairline bg-transparent px-0 py-3 text-[2.5rem] font-bold leading-[1.12] tracking-tight text-ink shadow-none placeholder:text-outline focus-visible:border-primary focus-visible:ring-0 tablet:text-[3rem]"
			/>
		</div>

		<section class="rounded-xl border border-hairline bg-surface-container-low p-5 tablet:p-6">
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-label-md font-semibold text-ink">Detail artikel</h2>
				<span class="text-label-md text-on-surface-variant">Lengkapi agar mudah ditemukan</span>
			</div>
			<div class="grid gap-5 tablet:grid-cols-2">
				<div class="flex flex-col gap-1.5">
				<label for="slug-input" class="text-label-md font-semibold text-ink">Alamat artikel</label>
				<div class="flex items-center gap-2">
					<span class="text-body-sm text-on-surface-variant">/blog/</span>
				<Input
					id="slug-input"
					name="slug"
					type="text"
					bind:value={slug}
					oninput={onSlugInput}
					placeholder="slug-artikel"
					class="h-9 flex-1 bg-white"
				/>
				</div>
				</div>
				<div class="flex flex-col gap-1.5">
					<span class="text-label-md font-semibold text-ink">Status artikel</span>
					<div class="flex h-10 items-center rounded-md border border-hairline bg-white px-3 text-body-md text-on-surface-variant"><span class="mr-2 size-2 rounded-full bg-primary" aria-hidden="true"></span>Draft</div>
				</div>
				<label class="flex flex-col gap-1.5 text-label-md font-semibold text-ink">Kategori
				<select name="categoryId" class="h-10 rounded-md border border-hairline bg-white px-3 text-body-md font-normal">
					<option value="">Pilih kategori</option>
					{#each categories as category (category.id)}<option value={category.id}>{category.name}</option>{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1.5 text-label-md font-semibold text-ink">Tags
				<Input name="tags" placeholder="Mis. kuliner, komunitas" class="bg-white" />
			</label>
				<div class="flex flex-col gap-1.5 tablet:col-span-2">
					<label for="excerpt-input" class="text-label-md font-semibold text-ink">Ringkasan</label>
					<Textarea id="excerpt-input" name="excerpt" rows={3} required bind:value={excerpt} placeholder="Tulis ringkasan singkat yang membuat pembaca ingin melanjutkan..." class="min-h-28 resize-y bg-white" />
				</div>
			</div>
		</section>

		<!-- Body -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<label class="text-label-md font-semibold text-ink">Mulai menulis</label>
				<span class="text-label-md text-on-surface-variant">Gunakan toolbar untuk format</span>
			</div>
			<TipTapEditor bind:value={body} placeholder="Tulis cerita Anda..." />
			<!-- Serialized HTML body submitted with the form -->
			<Input type="hidden" name="body" value={body} />
		</div>

		<!-- Cover image -->
		<div class="flex flex-col gap-2 border-t border-hairline pt-7">
			<label for="coverImage" class="text-label-md font-semibold text-ink">
				Gambar sampul <span class="font-normal text-on-surface-variant">(opsional, maks. 2 MB)</span>
			</label>
			<FileUpload
				value={coverImageUrl}
				onChange={(url) => (coverImageUrl = url)}
				onRemove={() => (coverImageUrl = "")}
				getPresignedUrl={getCoverPresignedUrl}
				accept="image/png,image/jpeg,image/webp,image/avif"
				label="Tarik gambar sampul ke sini, atau klik untuk memilih"
			/>
			<Input type="hidden" name="coverImageUrl" value={coverImageUrl} />
		</div>

		<!-- Actions -->
		<div class="sticky bottom-4 z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 border border-hairline bg-white/95 px-3 py-3 shadow-sm backdrop-blur">
			<span class="text-label-md text-on-surface-variant">Simpan draf kapan saja.</span>
			<div class="flex flex-wrap gap-2">
				<Button type="submit" variant="outline">Simpan Draft</Button>

				{#if isSubmittable}
					<Button type="submit" formaction="?/submitReview">Kirim untuk Review</Button>
				{/if}
			</div>
		</div>
	</form>
</div>
