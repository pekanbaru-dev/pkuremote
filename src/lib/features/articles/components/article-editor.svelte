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
			categoryId: string | null;
			tags: string[];
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
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { FileUpload } from "$lib/components/primitives";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Button } from "$lib/components/ui/button";
	import * as Select from "$lib/components/ui/select";
	import TipTapEditor from "./tiptap-editor.svelte";
	import { validateArticleForm } from "../article-form-schema.ts";

	let { article, error, categories = [] }: ArticleEditorProps = $props();

	const isEdit = $derived(!!article?.id);
	const isSubmittable = $derived(!article || article.status === "draft");
	const saveAction = $derived(isEdit ? "?/update" : "?/create");
	const statusLabel = $derived(article?.status === "published" ? "Terbit" : "Draft");

	// svelte-ignore state_referenced_locally
	const initialArticle = article;
	let categoryId = $state(initialArticle?.categoryId ?? "");
	const categoryLabel = $derived(
		categories.find((category) => category.id === categoryId)?.name ?? "Pilih kategori"
	);

	let title = $state(initialArticle?.title ?? "");
	let slug = $state(initialArticle?.slug ?? "");
	let excerpt = $state(initialArticle?.excerpt ?? "");
	let body = $state(initialArticle?.body ?? "");
	let coverImageUrl = $state(initialArticle?.coverImageUrl ?? "");
	let tags = $state(initialArticle?.tags.join(", ") ?? "");
	let slugManuallyEdited = $state(!!initialArticle?.id);
	let initializedArticleId = $state(initialArticle?.id ?? null);
	let previewing = $state(false);
	const reviewErrors = $derived(
		validateArticleForm({ title, slug, excerpt, body, categoryId, coverImageUrl, tags })
	);
	const canSubmitReview = $derived(isSubmittable && Object.keys(reviewErrors).length === 0);

	$effect(() => {
		const incomingArticle = article;
		const incomingArticleId = incomingArticle?.id ?? null;
		if (incomingArticleId === initializedArticleId) return;

		initializedArticleId = incomingArticleId;
		if (!incomingArticle) {
			title = "";
			slug = "";
			excerpt = "";
			body = "";
			coverImageUrl = "";
			categoryId = "";
			tags = "";
			slugManuallyEdited = false;
			return;
		}

		title = incomingArticle.title;
		slug = incomingArticle.slug;
		excerpt = incomingArticle.excerpt;
		body = incomingArticle.body;
		coverImageUrl = incomingArticle.coverImageUrl ?? "";
		categoryId = incomingArticle.categoryId ?? "";
		tags = incomingArticle.tags.join(", ");
		slugManuallyEdited = true;
	});

	$effect(() => {
		if (!slugManuallyEdited && title) {
			slug = slugifyPreview(title);
		}
	});

	function onSlugInput() {
		slugManuallyEdited = true;
	}

	async function getCoverPresignedUrl(file: { filename: string; contentType: string }) {
		const response = await fetch("/auth/my-articles/presign", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(file)
		});
		if (!response.ok) throw new Error("Gagal menyiapkan upload");
		return response.json() as Promise<{ presignedUrl: string; publicUrl: string }>;
	}

	async function handlePreview(e: Event) {
		if (!article?.id) return;
		previewing = true;
		try {
			const form = (e.target as HTMLElement).closest("form") as HTMLFormElement;
			const formData = new FormData(form);
			await fetch("?/update", {
				method: "POST",
				body: formData,
				headers: { "x-sveltekit-action": "true" }
			});
			window.open(`/auth/my-articles/${article.id}/preview`, "_blank");
		} finally {
			previewing = false;
		}
	}

	async function handleSubmitReview(e: Event) {
		e.preventDefault();

		const { default: Swal } = await import("sweetalert2");

		const result = await Swal.fire({
			title: "Kirim untuk Review?",
			text: "Artikel akan dikirim ke editor untuk direview. Kamu tidak bisa mengedit sebelum ada feedback.",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Ya, kirim!",
			cancelButtonText: "Batal",
			confirmButtonColor: "oklch(0.29 0.07 190)",
			reverseButtons: true
		});

		if (!result.isConfirmed) return;

		const form = (e.target as HTMLElement).closest("form") as HTMLFormElement;
		const formData = new FormData(form);

		try {
			const response = await fetch("?/submitReview", {
				method: "POST",
				body: formData,
				headers: { "x-sveltekit-action": "true" }
			});

			const { default: Toastify } = await import("toastify-js");
			await import("toastify-js/src/toastify.css");

		const data = await response.json().catch(() => null);
		const isSuccess = response.ok && data?.type === "success";

		if (isSuccess) {
				Toastify({
					text: "Artikel berhasil dikirim untuk review!",
					duration: 3000,
					gravity: "top",
					position: "right",
					style: { background: "oklch(0.29 0.07 190)", borderRadius: "8px" }
				}).showToast();
				await goto("/auth/my-articles?status=in_review");
			} else {
				const errMsg = data?.data?.error ?? "Gagal mengirim artikel. Coba lagi.";
				Toastify({
					text: errMsg,
					duration: 3000,
					gravity: "top",
					position: "right",
					style: { background: "#dc2626", borderRadius: "8px" }
				}).showToast();
			}
		} catch {
			const { default: Toastify } = await import("toastify-js");
			Toastify({
				text: "Terjadi kesalahan. Coba lagi.",
				duration: 3000,
				gravity: "top",
				position: "right",
				style: { background: "#dc2626", borderRadius: "8px" }
			}).showToast();
		}
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

	<form method="POST" action={saveAction} enctype="multipart/form-data" class="flex flex-col gap-7"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update({ reset: false });

				const { default: Toastify } = await import("toastify-js");
				await import("toastify-js/src/toastify.css");

				if (result.type === "success") {
					Toastify({
						text: "Draft berhasil disimpan.",
						duration: 2500,
						gravity: "top",
						position: "right",
						style: { background: "oklch(0.29 0.07 190)", borderRadius: "8px" }
					}).showToast();
				} else if (result.type === "failure") {
					Toastify({
						text: (result.data as { error?: string })?.error ?? "Gagal menyimpan draft.",
						duration: 3000,
						gravity: "top",
						position: "right",
						style: { background: "#dc2626", borderRadius: "8px" }
					}).showToast();
				}
			};
		}}
	>
		{#if isEdit}
			<Input type="hidden" name="id" value={article?.id} />
		{/if}

		<!-- Title + slug -->
		<div class="flex flex-col gap-2">
			<label for="title-input" class="sr-only">Judul artikel</label>
			<Input
				id="title-input"
				name="title"
				type="text"
				bind:value={title}
				placeholder="Judul cerita Anda"
				class="h-auto rounded-none border-0 border-b border-hairline bg-transparent px-0 pt-1 pb-3 text-[2.5rem] font-bold leading-[1.12] tracking-tight text-ink shadow-none placeholder:text-outline focus-visible:border-b focus-visible:border-hairline focus-visible:outline-none focus-visible:ring-0 tablet:text-[3rem]"
			/>
		</div>

		<div
			class="grid gap-7 desktop:grid-cols-[minmax(0,1fr)_23rem] desktop:items-start desktop:gap-8"
		>
			<div class="flex min-w-0 flex-col gap-7">
				<!-- Body -->
				<div class="flex flex-col gap-2">
					<div class="flex justify-end">
						<span class="text-label-md text-on-surface-variant">Gunakan toolbar untuk format</span>
					</div>
					<TipTapEditor bind:value={body} placeholder="Tulis cerita Anda..." />
					<!-- Serialized HTML body submitted with the form -->
					<Input type="hidden" name="body" value={body} />
				</div>

				<!-- Cover image -->
				<div class="flex flex-col gap-2 border-t border-hairline pt-7">
					<label for="coverImage" class="text-label-md font-semibold text-ink">
						Gambar sampul <span class="text-danger" aria-hidden="true">*</span>
						<span class="font-normal text-on-surface-variant">(maks. 2 MB)</span>
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

				<!-- Summary follows the editor and its thumbnail/content. -->
				<div class="flex flex-col gap-1.5">
					<label for="excerpt-input" class="text-label-md font-semibold text-ink"
						>Ringkasan <span class="text-danger" aria-hidden="true">*</span></label
					>
					<Textarea
						id="excerpt-input"
						name="excerpt"
						rows={3}
						bind:value={excerpt}
						placeholder="Tulis ringkasan singkat yang membuat pembaca ingin melanjutkan..."
						class="min-h-28 resize-y"
					/>
				</div>
			</div>

			<!-- Floating metadata controls -->
			<aside class="flex flex-col gap-5 desktop:sticky desktop:top-6" aria-label="Detail artikel">
				<label class="flex flex-col gap-1.5 text-label-md font-semibold text-ink">
					<span class="inline-flex items-center">
						Alamat artikel <span class="text-danger" aria-hidden="true">*</span>
					</span>
					<div class="flex items-center gap-2">
						<span class="shrink-0 text-sm font-normal text-on-surface-variant">/blog/</span>
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
				</label>

				<div class="flex flex-col gap-1.5 text-label-md font-semibold text-ink">
					<span>Status artikel</span>
					<div
						class="flex h-11 items-center rounded-md border border-outline bg-canvas px-3 text-sm font-normal text-ink"
					>
						<span class="mr-2 size-2 rounded-full bg-primary" aria-hidden="true"
						></span>{statusLabel}
					</div>
				</div>

				<label class="flex flex-col gap-1.5 text-label-md font-semibold text-ink">
					<span class="inline-flex items-center">
						Kategori <span class="text-danger" aria-hidden="true">*</span>
					</span>
					<Select.Root type="single" name="categoryId" bind:value={categoryId}>
						<Select.Trigger
							class="h-11 w-full rounded-md border-outline bg-canvas px-3 font-normal text-ink data-[size=default]:h-11"
						>
							{categoryLabel}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="" label="Pilih kategori" />
							{#each categories as category (category.id)}
								<Select.Item value={category.id} label={category.name} />
							{/each}
						</Select.Content>
					</Select.Root>
				</label>

				<label class="flex flex-col gap-1.5 text-label-md font-semibold text-ink">
					Tags
					<Input name="tags" bind:value={tags} placeholder="Mis. kuliner, komunitas" />
				</label>

			{#if isEdit}
				<Button
					type="button"
					onclick={handlePreview}
					disabled={previewing}
					variant="link"
					class="self-start"
				>
					{previewing ? "Menyimpan…" : "Preview artikel"}
				</Button>
			{/if}
			</aside>
		</div>

		<!-- Actions -->
		<div
			class="sticky bottom-4 z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 border border-hairline bg-canvas/95 px-3 py-3 shadow-sm backdrop-blur"
		>
			<span class="text-label-md text-on-surface-variant">Simpan draf kapan saja.</span>
			<div class="flex flex-wrap gap-2">
				<Button type="submit" variant="outline">Simpan Draft</Button>

				{#if isSubmittable}
					<Button
						type="button"
						disabled={!canSubmitReview}
						onclick={handleSubmitReview}
					>
						Kirim untuk Review
					</Button>
				{/if}
			</div>
		</div>
	</form>
</div>
