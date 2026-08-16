<script lang="ts">
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import Image from "@tiptap/extension-image";
	import Link from "@tiptap/extension-link";
	import Placeholder from "@tiptap/extension-placeholder";
	import DragHandle from "@tiptap/extension-drag-handle";
	import { onDestroy } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils.js";
	import {
		Bold,
		Italic,
		Heading2,
		List,
		ListOrdered,
		Quote,
		Link as LinkIcon,
		Undo2,
		Redo2,
		ImagePlus,
		LoaderCircle
	} from "@lucide/svelte";

	type TipTapEditorProps = {
		/** Initial HTML content (two-way bound). */
		value?: string;
		/** Placeholder text shown when empty. */
		placeholder?: string;
		disabled?: boolean;
	};

	let {
		value = $bindable(""),
		placeholder = "Tulis cerita Anda...",
		disabled = false
	}: TipTapEditorProps = $props();

	let editorHost: HTMLDivElement | undefined = $state();
	let editor: Editor | null = $state(null);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let isInitialized = $state(false);
	let slashMenuOpen = $state(false);

	const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

	$effect(() => {
		if (!editorHost || isInitialized) return;
		isInitialized = true;

		const content = value.trim().startsWith("{") ? JSON.parse(value) : undefined;
		const instance = new Editor({
			element: editorHost,
			extensions: [
				StarterKit.configure({ link: false }),
				Image.configure({ inline: false, allowBase64: false }),
				Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
				Placeholder.configure({ placeholder }),
				DragHandle.configure({
					nested: true,
					render: () => {
						const handle = document.createElement("button");
						handle.type = "button";
						handle.className = "article-block-handle";
						handle.setAttribute("aria-label", "Pindahkan blok");
						handle.title = "Seret untuk memindahkan blok";
						handle.textContent = "⠿";
						return handle;
					}
				})
			],
			content,
			editable: !disabled,
			editorProps: {
				attributes: {
					class:
						"prose prose-stone max-w-none focus:outline-none min-h-[24rem] px-4 py-4 text-body-md text-ink"
				},
				handleDrop: (_view, event) => {
					const files = event.dataTransfer?.files;
					const image = files && Array.from(files).find((f) => f.type.startsWith("image/"));
					if (image) {
						event.preventDefault();
						void uploadAndInsert(image);
						return true;
					}
					return false;
				},
				handlePaste: (_view, event) => {
					const files = event.clipboardData?.files;
					const image = files && Array.from(files).find((f) => f.type.startsWith("image/"));
					if (image) {
						event.preventDefault();
						void uploadAndInsert(image);
						return true;
					}
					return false;
				},
				handleKeyDown: (_view, event) => {
					if (event.key === "Escape") {
						slashMenuOpen = false;
						return false;
					}
					if (event.key === "/" && editor?.state.selection.$from.parent.textContent.length === 0) {
						event.preventDefault();
						slashMenuOpen = true;
						return true;
					}
					return false;
				}
			},
			onUpdate: ({ editor: ed }) => {
				value = JSON.stringify(ed.getJSON());
			}
		});

		editor = instance;
		value = JSON.stringify(instance.getJSON());
	});

	$effect(() => {
		if (editor) editor.setEditable(!disabled);
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function isActiveWithAttrs(marker: string, attributes: Record<string, unknown>) {
		return editor?.isActive(marker, attributes) ?? false;
	}

	function isActive(marker: string) {
		return editor?.isActive(marker) ?? false;
	}

	/** Toolbar button classes; highlights when the command is active. */
	function btnClass(active: boolean) {
		return cn(
			"inline-flex size-8 items-center justify-center rounded text-on-surface-variant transition hover:bg-surface-container-high hover:text-ink",
			active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
		);
	}

	function run(fn: () => void) {
		fn();
		editor?.view.focus();
	}

	async function uploadAndInsert(file: File) {
		uploading = true;
		uploadError = null;
		try {
			const res = await fetch("/my-articles/presign", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ filename: file.name, contentType: file.type })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? "Gagal membuat presigned URL.");
			}
			const { presignedUrl, publicUrl } = await res.json();
			const putRes = await fetch(presignedUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file
			});
			if (!putRes.ok) throw new Error("Upload gagal");
			editor?.chain().focus().setImage({ src: publicUrl }).run();
		} catch (err) {
			uploadError = err instanceof Error ? err.message : "Upload gambar gagal.";
		} finally {
			uploading = false;
		}
	}

	function pickImage() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = IMAGE_ACCEPT;
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) void uploadAndInsert(file);
		};
		input.click();
	}

	function insertBlock(type: "heading" | "quote" | "bullet" | "ordered" | "image") {
		slashMenuOpen = false;
		if (type === "heading") editor?.chain().focus().toggleHeading({ level: 2 }).run();
		if (type === "quote") editor?.chain().focus().toggleBlockquote().run();
		if (type === "bullet") editor?.chain().focus().toggleBulletList().run();
		if (type === "ordered") editor?.chain().focus().toggleOrderedList().run();
		if (type === "image") pickImage();
	}
</script>

<div class="relative flex flex-col gap-2">
	<!-- Toolbar -->
	<div
		class="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-hairline bg-surface-container-low px-2 py-1.5"
		aria-label="Format teks"
	>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => editor?.chain().focus().toggleBold().run()}
			class={btnClass(isActive("bold"))}
			aria-label="Tebal"
			title="Tebal"
		>
			<Bold class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			class={btnClass(isActive("italic"))}
			aria-label="Miring"
			title="Miring"
		>
			<Italic class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			class={btnClass(isActiveWithAttrs("heading", { level: 2 }))}
			aria-label="Subjudul"
			title="Subjudul"
		>
			<Heading2 class="size-4" />
		</Button>
		<span class="mx-1 h-5 w-px bg-hairline" aria-hidden="true"></span>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
			class={btnClass(isActive("bulletList"))}
			aria-label="Daftar"
			title="Daftar"
		>
			<List class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			class={btnClass(isActive("orderedList"))}
			aria-label="Daftar bernomor"
			title="Daftar bernomor"
		>
			<ListOrdered class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			class={btnClass(isActive("blockquote"))}
			aria-label="Kutipan"
			title="Kutipan"
		>
			<Quote class="size-4" />
		</Button>
		<span class="mx-1 h-5 w-px bg-hairline" aria-hidden="true"></span>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => {
				const url = window.prompt("Masukkan URL tautan");
				if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
			}}
			class={btnClass(isActive("link"))}
			aria-label="Tautan"
			title="Tautan"
		>
			<LinkIcon class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={pickImage}
			class={btnClass(false)}
			aria-label="Sisipkan gambar"
			title="Sisipkan gambar"
		>
			<ImagePlus class="size-4" />
		</Button>
		<span class="mx-1 h-5 w-px bg-hairline" aria-hidden="true"></span>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => run(() => editor?.chain().focus().undo().run())}
			class={btnClass(false)}
			aria-label="Urungkan"
			title="Urungkan"
		>
			<Undo2 class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => run(() => editor?.chain().focus().redo().run())}
			class={btnClass(false)}
			aria-label="Ulangi"
			title="Ulangi"
		>
			<Redo2 class="size-4" />
		</Button>
		{#if uploading}
			<span class="ml-2 inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
				<LoaderCircle class="size-3.5 animate-spin" />
				Mengunggah gambar…
			</span>
		{/if}
	</div>

	<!-- Editor host -->
	<div
		bind:this={editorHost}
		class="overflow-hidden rounded-b-xl border border-hairline bg-white"
		class:opacity-60={disabled}
	></div>

	{#if slashMenuOpen}
		<div class="absolute left-4 top-14 z-20 w-56 rounded-xl border border-hairline bg-white p-1.5 shadow-lg" role="menu">
			<p class="px-2 py-1 text-label-md text-on-surface-variant">Tambah blok</p>
			{#each [["heading", "Subjudul"], ["quote", "Kutipan"], ["bullet", "Daftar"], ["ordered", "Daftar bernomor"], ["image", "Gambar"]] as [type, label]}
				<button type="button" class="w-full rounded-md px-2 py-2 text-left text-body-sm text-ink hover:bg-surface-container-high" onclick={() => insertBlock(type as "heading" | "quote" | "bullet" | "ordered" | "image")}>{label}</button>
			{/each}
		</div>
	{/if}

	{#if uploadError}
		<p class="label-meta text-error" role="alert">{uploadError}</p>
	{/if}
</div>

<style>
	:global(.article-block-handle) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: 0;
		border-radius: 0.375rem;
		background: white;
		color: var(--color-on-surface-variant);
		cursor: grab;
		font-size: 1.1rem;
		line-height: 1;
	}

	:global(.article-block-handle:hover) {
		background: var(--color-surface-container-high);
		color: var(--color-ink);
	}
</style>
