<script lang="ts" module>
	import { dropZoneVariants, type FileUploadProps } from "./file-upload.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { FileText, LoaderCircle, Trash2, Upload, ZoomIn } from "@lucide/svelte";
	import * as Dialog from "$lib/components/ui/dialog";

	/** Whether a stored value looks like an image URL (show thumbnail + modal
	 * preview). Non-image files render a file-type icon + name instead. */
	const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "avif"];

	function isImageUrl(url: string): boolean {
		const path = url.split("?")[0].split("#")[0];
		const ext = path.split(".").pop()?.toLowerCase() ?? "";
		return IMAGE_EXT.includes(ext);
	}

	let {
		value = "",
		onChange,
		getPresignedUrl,
		onRemove,
		accept = "image/png,image/jpeg,image/webp,image/gif,application/pdf",
		maxBytes = 2 * 1024 * 1024,
		disabled = false,
		name,
		label = "Drag & drop file di sini, atau klik untuk memilih",
		error,
		class: className,
		...rest
	}: FileUploadProps = $props();

	let isDragging = $state(false);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let previewUrl = $state<string | null>(null);
	let modalOpen = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);

	// The URL shown as the thumbnail. Prefer a freshly-uploaded local preview,
	// otherwise fall back to the controlled `value`.
	const displayUrl = $derived(previewUrl ?? value);

	// Show internal validation/upload errors first, then any external error
	// (e.g. from useForm/zod). The drop zone is styled as errored when either.
	const displayError = $derived(uploadError ?? error);
	const hasError = $derived(Boolean(displayError));

	// Image → interactive thumbnail (opens modal preview); non-image → icon.
	const isImage = $derived(Boolean(displayUrl) && isImageUrl(displayUrl));

	const fileName = $derived(displayUrl ? (displayUrl.split("/").pop() ?? displayUrl) : "");

	function handleFiles(files: FileList | null) {
		const file = files?.[0];
		if (!file) return;
		validateAndUpload(file);
	}

	function validateAndUpload(file: File) {
		uploadError = null;
		const accepted = accept.split(",").map((t) => t.trim().toLowerCase());
		if (!accepted.includes(file.type.toLowerCase())) {
			uploadError = "Format file tidak didukung.";
			return;
		}
		if (file.size > maxBytes) {
			const mb = Math.round(maxBytes / 1024 / 1024);
			uploadError = `Ukuran file melebihi ${mb} MB.`;
			return;
		}
		void upload(file);
	}

	async function upload(file: File) {
		if (!getPresignedUrl) {
			uploadError = "Upload tidak dikonfigurasi.";
			return;
		}
		uploading = true;
		uploadError = null;
		try {
			const { presignedUrl, publicUrl } = await getPresignedUrl({
				filename: file.name,
				contentType: file.type || "application/octet-stream"
			});
			const res = await fetch(presignedUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type || "application/octet-stream" },
				body: file
			});
			if (!res.ok) throw new Error("Upload gagal");
			// Show a local preview immediately, then reflect the committed URL.
			const localPreview = URL.createObjectURL(file);
			previewUrl = localPreview;
			onChange?.(publicUrl);
		} catch {
			uploadError = "Upload gagal. Silakan coba lagi.";
		} finally {
			uploading = false;
		}
	}

	function handleRemove() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		uploadError = null;
		onChange?.("");
		onRemove?.();
		if (inputRef) inputRef.value = "";
	}

	function onDragOver(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		isDragging = true;
	}

	function onDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function onDrop(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		isDragging = false;
		handleFiles(event.dataTransfer?.files ?? null);
	}
</script>

<div class="flex flex-col gap-2">
	{#if displayUrl}
		<!-- Uploaded state: preview card (image thumbnail or file icon) + actions -->
		<div
			class="flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-3"
		>
			{#if isImage}
				<button
					type="button"
					class="group relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-outline-variant transition hover:border-primary disabled:opacity-50"
					onclick={() => (modalOpen = true)}
					{disabled}
					aria-label="Perbesar file"
				>
					<img src={displayUrl} alt={fileName} class="h-full w-full object-cover" />
					<span
						class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100"
					>
						<ZoomIn class="size-5" />
					</span>
				</button>
			{:else}
				<div
					class="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-high text-primary"
				>
					<FileText class="size-8" />
				</div>
			{/if}

			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="truncate text-sm font-medium text-ink" title={fileName}>{fileName}</span>
				<a
					href={displayUrl}
					target="_blank"
					rel="noopener"
					class="link-quiet truncate text-xs"
					title={displayUrl}
				>
					{displayUrl}
				</a>
				{#if uploading}
					<span class="flex items-center gap-1.5 text-xs text-on-surface-variant">
						<LoaderCircle class="size-3.5 animate-spin" />
						Mengupload…
					</span>
				{/if}
			</div>

			<button
				type="button"
				class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-transparent p-2 text-on-surface-variant transition hover:border-danger hover:bg-danger/10 hover:text-danger disabled:opacity-50"
				onclick={handleRemove}
				disabled={disabled || uploading}
				aria-label="Hapus file"
				title="Hapus file"
			>
				<Trash2 class="size-4" />
			</button>
		</div>

		{#if isImage}
			<Dialog.Root open={modalOpen} onOpenChange={(o) => (modalOpen = o)}>
				<Dialog.Content class="max-w-3xl">
					<img src={displayUrl} alt={fileName} class="max-h-[70vh] w-full rounded object-contain" />
				</Dialog.Content>
			</Dialog.Root>
		{/if}
	{:else}
		<!-- Empty state: drag & drop zone -->
		<input
			bind:this={inputRef}
			type="file"
			data-testid="file-upload-input"
			class="sr-only"
			{accept}
			{name}
			{disabled}
			onchange={(e) => handleFiles((e.currentTarget as HTMLInputElement).files)}
			{...rest}
		/>
		<button
			type="button"
			class={cn(dropZoneVariants({ dragging: isDragging, error: hasError }), className)}
			onclick={() => inputRef?.click()}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			ondrop={onDrop}
			{disabled}
		>
			{#if uploading}
				<LoaderCircle class="size-8 animate-spin text-on-surface-variant" />
				<span class="text-sm text-on-surface-variant">Mengupload…</span>
			{:else}
				<Upload class="size-8 text-on-surface-variant transition group-hover:text-primary" />
				<span class="text-sm font-medium text-ink">{label}</span>
				<span class="text-xs text-on-surface-variant">Gambar atau PDF — maks 2 MB</span>
			{/if}
		</button>
	{/if}

	{#if displayError}
		<p class="label-meta text-error" role="alert">{displayError}</p>
	{/if}
</div>
