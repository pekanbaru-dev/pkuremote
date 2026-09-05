<script lang="ts">
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import Image from "@tiptap/extension-image";
	import Link from "@tiptap/extension-link";
	import Placeholder from "@tiptap/extension-placeholder";
	import DragHandle from "@tiptap/extension-drag-handle";
	import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
	import { common, createLowlight } from "lowlight";
	import Color from "@tiptap/extension-color";
	import { TextStyle } from "@tiptap/extension-text-style";

	const lowlight = createLowlight(common);
	import { TableKit } from "@tiptap/extension-table";
	import TextAlign from "@tiptap/extension-text-align";
	import { Mathematics } from "@tiptap/extension-mathematics";
	import "katex/dist/katex.min.css";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { NodeSelection } from "@tiptap/pm/state";
	import { onDestroy } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Dialog from "$lib/components/ui/dialog";
	import ImageProperties from "./image-properties.svelte";
	import type { ArticleImageAlignment, ArticleImageAttributes } from "../types";
	import { cn } from "$lib/utils.js";
	import {
		Bold,
		Italic,
		List,
		ListOrdered,
		Quote,
		Link as LinkIcon,
		Undo2,
		Redo2,
		ImagePlus,
		LoaderCircle,
		Code2,
		Table as TableIcon,
		ChevronDown,
		AlignLeft,
		AlignCenter,
		AlignRight,
		AlignJustify,
		Sigma,
		Baseline
	} from "@lucide/svelte";

	const COLOR_PALETTE = [
		{ label: "Default", value: "" },
		{ label: "Merah", value: "#dc2626" },
		{ label: "Oranye", value: "#ea580c" },
		{ label: "Kuning", value: "#ca8a04" },
		{ label: "Hijau", value: "#16a34a" },
		{ label: "Biru", value: "#2563eb" },
		{ label: "Ungu", value: "#9333ea" },
		{ label: "Pink", value: "#db2777" },
		{ label: "Abu", value: "#6b7280" },
		{ label: "Hitam", value: "#111827" },
	];

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

	type SelectedImage = ArticleImageAttributes & { position: number };

	let editorHost: HTMLDivElement | undefined = $state();
	let editorSurface: HTMLDivElement | undefined = $state();
	let editor: Editor | null = $state(null);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let isInitialized = $state(false);
	let slashMenuOpen = $state(false);
	let selectedImage = $state<SelectedImage | null>(null);
	let imagePropertiesPosition = $state({ top: 16, left: 16 });
	let imageResizeObserver: ResizeObserver | null = null;
	let observedImage: HTMLElement | null = null;

	// Link dialog state
	let linkDialogOpen = $state(false);
	let linkUrl = $state("");

	// Math dialog state
	let mathDialogOpen = $state(false);
	let mathFormula = $state("");
	let mathPreviewEl = $state<HTMLElement | null>(null);

	// Editor mode: "editor" | "preview" | "markdown"
	type EditorMode = "editor" | "preview" | "markdown";
	let editorMode = $state<EditorMode>("editor");
	let markdownContent = $state("");
	let previewHtml = $state("");

	async function switchMode(mode: EditorMode) {
		if (mode === editorMode) return;

		if (editorMode === "editor") {
			// Convert current editor content to HTML then to markdown
			const html = editor?.getHTML() ?? "";
			const { default: TurndownService } = await import("turndown");
			const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
			markdownContent = td.turndown(html);
			previewHtml = html;
		}

		if (mode === "editor" && editorMode === "markdown") {
			// Convert markdown back to HTML and set in editor
			const { marked } = await import("marked");
			const html = await marked(markdownContent);
			editor?.commands.setContent(html);
		}

		if (mode === "preview" && editorMode === "markdown") {
			const { marked } = await import("marked");
			previewHtml = await marked(markdownContent) as string;
		}

		editorMode = mode;
	}

	$effect(() => {
		if (!mathPreviewEl || !mathFormula.trim()) return;
		try {
			const katex = (window as unknown as { katex: typeof import('katex') }).katex;
			if (katex) {
				// eslint-disable-next-line svelte/no-dom-manipulating
				mathPreviewEl.innerHTML = katex.renderToString(mathFormula, { throwOnError: false });
			}
		} catch {
			// Math rendering failed, ignore
		}
	});

	function openMathDialog() {
		mathFormula = "";
		mathDialogOpen = true;
	}

	function submitMath() {
		const formula = mathFormula.trim();
		if (formula) {
			editor?.chain().focus().insertContent(`$${formula}$`).run();
		}
		mathDialogOpen = false;
		mathFormula = "";
	}

	const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

	const ImageWithProperties = Image.extend({
		addAttributes() {
			return {
				...this.parent?.(),
				width: {
					default: null,
					parseHTML: (element: HTMLElement) => {
						const rawWidth = element.getAttribute("data-width") ?? element.getAttribute("width");
						const width = Number.parseFloat(rawWidth ?? "");
						return Number.isFinite(width) ? width : null;
					},
					renderHTML: (attributes: { width?: number | null }) => {
						if (typeof attributes.width !== "number") return {};
						return { "data-width": attributes.width, width: `${attributes.width}%` };
					}
				},
				alignment: {
					default: "left",
					parseHTML: (element: HTMLElement) => {
						const alignment = element.getAttribute("data-align");
						return isImageAlignment(alignment) ? alignment : "left";
					},
					renderHTML: (attributes: { alignment?: ArticleImageAlignment }) => ({
						"data-align": attributes.alignment ?? "left"
					})
				}
			};
		}
	});

	$effect(() => {
		if (!editorHost || isInitialized) return;
		isInitialized = true;

		const content = value.trim().startsWith("{") ? JSON.parse(value) : undefined;
		const instance = new Editor({
			element: editorHost,
			extensions: [
				StarterKit.configure({ link: false, codeBlock: false }),
				ImageWithProperties.configure({ inline: false, allowBase64: false }),
				Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
				Placeholder.configure({ placeholder }),
				CodeBlockLowlight.configure({
				lowlight,
				enableTabIndentation: true,
				tabSize: 2,
			}),
				TableKit.configure({ table: { resizable: true } }),
				TextAlign.configure({ types: ["heading", "paragraph"] }),
				Mathematics,
				TextStyle,
				Color,
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
					if (event.key === "Tab") {
						event.preventDefault();
						// Indent list item if inside a list
						if (editor?.isActive("listItem")) {
							if (event.shiftKey) {
								editor.chain().focus().liftListItem("listItem").run();
							} else {
								editor.chain().focus().sinkListItem("listItem").run();
							}
							return true;
						}
						// Insert 2 spaces in regular text
						editor?.chain().focus().insertContent("  ").run();
						return true;
					}
					return false;
				}
			},
			onSelectionUpdate: ({ editor: ed }) => {
				syncSelectedImage(ed);
			},
			onUpdate: ({ editor: ed }) => {
				value = JSON.stringify(ed.getJSON());
				syncSelectedImage(ed);
			}
		});

		editor = instance;
		value = JSON.stringify(instance.getJSON());
		syncSelectedImage(instance);
	});

	$effect(() => {
		if (editor) editor.setEditable(!disabled);
	});

	onDestroy(() => {
		imageResizeObserver?.disconnect();
		editor?.destroy();
	});

	function isActiveWithAttrs(marker: string, attributes: Record<string, unknown>) {
		return editor?.isActive(marker, attributes) ?? false;
	}

	function isActive(marker: string) {
		return editor?.isActive(marker) ?? false;
	}

	function syncSelectedImage(ed: Editor | null) {
		const selection = ed?.state.selection;
		if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") {
			imageResizeObserver?.disconnect();
			imageResizeObserver = null;
			observedImage = null;
			selectedImage = null;
			return;
		}

		const rawWidth = selection.node.attrs.width;
		const parsedWidth = Number.parseFloat(String(rawWidth ?? ""));
		selectedImage = {
			position: selection.from,
			width: Number.isFinite(parsedWidth)
				? Math.min(100, Math.max(20, Math.round(parsedWidth)))
				: null,
			alt: String(selection.node.attrs.alt ?? ""),
			title: String(selection.node.attrs.title ?? ""),
			alignment: isImageAlignment(selection.node.attrs.alignment)
				? selection.node.attrs.alignment
				: "left"
		};
		queueImagePropertiesPosition();
	}

	function isImageAlignment(value: unknown): value is ArticleImageAlignment {
		return value === "left" || value === "center" || value === "right";
	}

	function queueImagePropertiesPosition() {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (!editorSurface || !selectedImage) return;
				const image = editorSurface.querySelector("img.ProseMirror-selectednode");
				if (!(image instanceof HTMLElement)) return;
				if (observedImage !== image) {
					imageResizeObserver?.disconnect();
					imageResizeObserver = new ResizeObserver(queueImagePropertiesPosition);
					imageResizeObserver.observe(image);
					observedImage = image;
				}

				const surfaceRect = editorSurface.getBoundingClientRect();
				const imageRect = image.getBoundingClientRect();
				const panelWidth = Math.min(320, surfaceRect.width - 16);
				const maxLeft = Math.max(8, surfaceRect.width - panelWidth - 8);
				const left = Math.min(Math.max(8, imageRect.left - surfaceRect.left), maxLeft);
				const panelHeight = 260;
				const belowTop = imageRect.bottom - surfaceRect.top + 10;
				const aboveTop = imageRect.top - surfaceRect.top - panelHeight - 10;
				const fitsBelow = imageRect.bottom + panelHeight + 10 <= window.innerHeight;

				imagePropertiesPosition = {
					top: Math.max(8, fitsBelow || imageRect.top < panelHeight ? belowTop : aboveTop),
					left
				};
			});
		});
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

	function openLinkDialog() {
		// Pre-fill with existing link href if cursor is on a link
		const existing = editor?.getAttributes("link")?.href ?? "";
		linkUrl = existing;
		linkDialogOpen = true;
	}

	function submitLink() {
		const url = linkUrl.trim();
		if (url) {
			editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
		} else {
			editor?.chain().focus().extendMarkRange("link").unsetLink().run();
		}
		linkDialogOpen = false;
		linkUrl = "";
	}

	function removeLinkAndClose() {
		editor?.chain().focus().extendMarkRange("link").unsetLink().run();
		linkDialogOpen = false;
		linkUrl = "";
	}

	function updateSelectedImage(change: Partial<ArticleImageAttributes>) {
		if (!editor || !selectedImage) return;

		const normalizedChange =
			"width" in change && change.width !== null && change.width !== undefined
				? { ...change, width: Math.min(100, Math.max(20, Math.round(change.width))) }
				: change;
		editor
			.chain()
			.focus()
			.setNodeSelection(selectedImage.position)
			.updateAttributes("image", normalizedChange)
			.run();
	}

	$effect(() => {
		if (!selectedImage) return;

		const reposition = () => queueImagePropertiesPosition();
		window.addEventListener("resize", reposition);
		window.addEventListener("scroll", reposition, true);
		queueImagePropertiesPosition();

		return () => {
			window.removeEventListener("resize", reposition);
			window.removeEventListener("scroll", reposition, true);
		};
	});

	async function uploadAndInsert(file: File) {
		uploading = true;
		uploadError = null;
		try {
			const res = await fetch("/auth/my-articles/presign", {
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

<div class="relative flex flex-col">
	<!-- Toolbar -->
	<div
		class="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-hairline bg-surface-container-low px-2 py-1.5 backdrop-blur"
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
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={[
					"inline-flex items-center gap-0.5 h-8 px-2 rounded text-xs font-semibold transition",
					isActive("heading")
						? "bg-primary/10 text-primary hover:bg-primary/15"
						: "text-on-surface-variant hover:bg-surface-container-high hover:text-ink"
				].join(" ")}
				title="Heading"
				aria-label="Heading"
				type="button"
			>
				{#if isActiveWithAttrs("heading", { level: 2 })}H2
				{:else if isActiveWithAttrs("heading", { level: 3 })}H3
				{:else if isActiveWithAttrs("heading", { level: 4 })}H4
				{:else if isActiveWithAttrs("heading", { level: 5 })}H5
				{:else}H<ChevronDown class="size-3" />
				{/if}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-36 shadow-none border border-hairline bg-white rounded-lg">
				<DropdownMenu.Item
					class="cursor-pointer px-3 py-1.5"
					onclick={() => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
				>
					<span class="text-[22px] font-bold text-ink">H2</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="cursor-pointer px-3 py-1.5"
					onclick={() => run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
				>
					<span class="text-[20px] font-bold text-ink">H3</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="cursor-pointer px-3 py-1.5"
					onclick={() => run(() => editor?.chain().focus().toggleHeading({ level: 4 }).run())}
				>
					<span class="text-[18px] font-bold text-ink">H4</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="cursor-pointer px-3 py-1.5"
					onclick={() => run(() => editor?.chain().focus().toggleHeading({ level: 5 }).run())}
				>
					<span class="text-[16px] font-bold text-ink">H5</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<span class="mx-1 h-5 w-px bg-hairline" aria-hidden="true"></span>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={[
					"inline-flex items-center gap-0.5 h-8 px-2 rounded transition",
					isActive("bulletList") || isActive("orderedList")
						? "bg-primary/10 text-primary hover:bg-primary/15"
						: "text-on-surface-variant hover:bg-surface-container-high hover:text-ink"
				].join(" ")}
				title="Daftar"
				aria-label="Daftar"
				type="button"
			>
				{#if isActive("orderedList")}
					<ListOrdered class="size-4" />
				{:else}
					<List class="size-4" />
				{/if}
				<ChevronDown class="size-3" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-44 shadow-none border border-hairline bg-white rounded-lg">
				<DropdownMenu.Item
					class="cursor-pointer px-3 py-1.5 gap-2 text-sm flex items-center"
					onclick={() => run(() => editor?.chain().focus().toggleBulletList().run())}
				>
					<List class="size-4 shrink-0" /> Daftar
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="cursor-pointer px-3 py-1.5 gap-2 text-sm flex items-center"
					onclick={() => run(() => editor?.chain().focus().toggleOrderedList().run())}
				>
					<ListOrdered class="size-4 shrink-0" /> Daftar bernomor
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
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
			onclick={openLinkDialog}
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
			onclick={() => run(() => editor?.chain().focus().toggleCodeBlock().run())}
			class={btnClass(isActive("codeBlock"))}
			aria-label="Blok kode"
			title="Blok kode"
		>
			<Code2 class="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={() => run(() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
			class={btnClass(isActive("table"))}
			aria-label="Sisipkan tabel"
			title="Sisipkan tabel"
		>
			<TableIcon class="size-4" />
		</Button>
		{#if isActive("table")}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="inline-flex items-center gap-0.5 h-8 px-2 rounded text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-ink transition"
					title="Aksi tabel"
					aria-label="Aksi tabel"
					type="button"
				>
					Tabel <ChevronDown class="size-3" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-48 shadow-none border border-hairline bg-white rounded-lg">
					<DropdownMenu.Label class="px-3 py-1.5 text-[10px] text-on-surface-variant uppercase tracking-wide">Kolom</DropdownMenu.Label>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm" onclick={() => run(() => editor?.chain().focus().addColumnBefore().run())}>
						Tambah kolom sebelum
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm" onclick={() => run(() => editor?.chain().focus().addColumnAfter().run())}>
						Tambah kolom sesudah
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm text-destructive" onclick={() => run(() => editor?.chain().focus().deleteColumn().run())}>
						Hapus kolom
					</DropdownMenu.Item>
					<DropdownMenu.Separator class="bg-hairline" />
					<DropdownMenu.Label class="px-3 py-1.5 text-[10px] text-on-surface-variant uppercase tracking-wide">Baris</DropdownMenu.Label>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm" onclick={() => run(() => editor?.chain().focus().addRowBefore().run())}>
						Tambah baris sebelum
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm" onclick={() => run(() => editor?.chain().focus().addRowAfter().run())}>
						Tambah baris sesudah
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm text-destructive" onclick={() => run(() => editor?.chain().focus().deleteRow().run())}>
						Hapus baris
					</DropdownMenu.Item>
					<DropdownMenu.Separator class="bg-hairline" />
					<DropdownMenu.Label class="px-3 py-1.5 text-[10px] text-on-surface-variant uppercase tracking-wide">Sel</DropdownMenu.Label>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm" onclick={() => run(() => editor?.chain().focus().mergeCells().run())}>
						Gabung sel
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm" onclick={() => run(() => editor?.chain().focus().splitCell().run())}>
						Pisah sel
					</DropdownMenu.Item>
					<DropdownMenu.Separator class="bg-hairline" />
					<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 text-sm text-destructive" onclick={() => run(() => editor?.chain().focus().deleteTable().run())}>
						Hapus tabel
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
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
		<span class="mx-1 h-5 w-px bg-hairline" aria-hidden="true"></span>
		<!-- Alignment dropdown -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={[
					"inline-flex items-center gap-0.5 h-8 px-2 rounded text-xs font-semibold transition",
					isActiveWithAttrs("textAlign", { textAlign: "center" }) || isActiveWithAttrs("textAlign", { textAlign: "right" }) || isActiveWithAttrs("textAlign", { textAlign: "justify" })
						? "bg-primary/10 text-primary hover:bg-primary/15"
						: "text-on-surface-variant hover:bg-surface-container-high hover:text-ink"
				].join(" ")}
				title="Rata teks"
				aria-label="Rata teks"
				type="button"
			>
				{#if isActiveWithAttrs("textAlign", { textAlign: "center" })}
					<AlignCenter class="size-4" />
				{:else if isActiveWithAttrs("textAlign", { textAlign: "right" })}
					<AlignRight class="size-4" />
				{:else if isActiveWithAttrs("textAlign", { textAlign: "justify" })}
					<AlignJustify class="size-4" />
				{:else}
					<AlignLeft class="size-4" />
				{/if}
				<ChevronDown class="size-3" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-40 shadow-none border border-hairline bg-white rounded-lg">
				<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 gap-2 text-sm" onclick={() => run(() => editor?.chain().focus().setTextAlign("left").run())}>
					<AlignLeft class="size-4 shrink-0" /> Rata kiri
				</DropdownMenu.Item>
				<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 gap-2 text-sm" onclick={() => run(() => editor?.chain().focus().setTextAlign("center").run())}>
					<AlignCenter class="size-4 shrink-0" /> Rata tengah
				</DropdownMenu.Item>
				<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 gap-2 text-sm" onclick={() => run(() => editor?.chain().focus().setTextAlign("right").run())}>
					<AlignRight class="size-4 shrink-0" /> Rata kanan
				</DropdownMenu.Item>
				<DropdownMenu.Item class="cursor-pointer px-3 py-1.5 gap-2 text-sm" onclick={() => run(() => editor?.chain().focus().setTextAlign("justify").run())}>
					<AlignJustify class="size-4 shrink-0" /> Rata penuh
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<!-- Color picker -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex items-center gap-0.5 h-8 px-2 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-ink transition"
				title="Warna teks"
				aria-label="Warna teks"
				type="button"
			>
				<span class="flex flex-col items-center gap-0.5">
					<Baseline class="size-4" />
					<span
						class="h-1 w-4 rounded-full"
						style="background: {editor?.getAttributes('textStyle').color || '#111827'}"
					></span>
				</span>
				<ChevronDown class="size-3" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-44 shadow-none border border-hairline bg-white rounded-lg p-2">
				<div class="grid grid-cols-5 gap-1.5">
					{#each COLOR_PALETTE as color (color.value)}
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							title={color.label}
							onclick={() => {
								if (color.value) {
									run(() => editor?.chain().focus().setColor(color.value).run());
								} else {
									run(() => editor?.chain().focus().unsetColor().run());
								}
							}}
							class={[
								"h-6 w-6 rounded-full border-2 transition hover:scale-110",
								color.value === (editor?.getAttributes('textStyle').color || "")
									? "border-primary"
									: "border-transparent hover:border-hairline"
							].join(" ")}
							style={color.value ? `background: ${color.value}` : "background: linear-gradient(135deg, #fff 45%, #f00 45%)"}
						/>
					{/each}
				</div>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Button
			variant="ghost"
			size="icon-sm"
			type="button"
			onclick={openMathDialog}
			class={btnClass(false)}
			aria-label="Rumus matematika"
			title="Rumus matematika (KaTeX)"
		>
			<Sigma class="size-4" />
		</Button>
		{#if uploading}
			<span class="ml-2 inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
				<LoaderCircle class="size-3.5 animate-spin" />
				Mengunggah gambar…
			</span>
		{/if}
	<!-- Mode toggle — ujung kanan -->
	<div class="ml-auto flex items-center gap-0.5 border-l border-hairline pl-2">
		<Button
			type="button"
			variant={editorMode === "editor" ? "default" : "ghost"}
			size="sm"
			onclick={() => switchMode("editor")}
			class="text-xs"
		>
			Editor
		</Button>
		<Button
			type="button"
			variant={editorMode === "markdown" ? "default" : "ghost"}
			size="sm"
			onclick={() => switchMode("markdown")}
			class="text-xs"
		>
			Markdown
		</Button>
	</div>
	</div>

	<!-- Editor host -->
	<div
		bind:this={editorSurface}
		class="relative overflow-visible rounded-b-xl border border-hairline bg-white"
		class:hidden={editorMode !== "editor"}
	>
		<div
			bind:this={editorHost}
			class="overflow-hidden rounded-b-xl"
			class:opacity-60={disabled}
		></div>
		{#if selectedImage}
			<ImageProperties
				class="absolute z-30 w-[min(20rem,calc(100%-1rem))]"
				style={`top: ${imagePropertiesPosition.top}px; left: ${imagePropertiesPosition.left}px`}
				width={selectedImage.width}
				alt={selectedImage.alt}
				title={selectedImage.title}
				alignment={selectedImage.alignment}
				onChange={updateSelectedImage}
			/>
		{/if}
	</div>

	<!-- Preview mode -->
	{#if editorMode === "preview"}
		<div class="prose prose-stone max-w-none rounded-b-xl border border-hairline bg-white px-4 py-4 min-h-[24rem]">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html previewHtml}
		</div>
	{/if}

	<!-- Markdown mode -->
	{#if editorMode === "markdown"}
		<Textarea
			bind:value={markdownContent}
			class="w-full rounded-b-xl border border-hairline bg-[#1e1e2e] text-[#cdd6f4] font-mono text-sm px-4 py-4 min-h-[24rem] focus:outline-none focus:ring-1 focus:ring-primary resize-y"
			spellcheck="false"
		/>
	{/if}

	{#if slashMenuOpen}
		<div
			class="absolute left-4 top-14 z-20 w-56 rounded-xl border border-hairline bg-white p-1.5 shadow-lg"
			role="menu"
		>
			<p class="px-2 py-1 text-label-md text-on-surface-variant">Tambah blok</p>
			{#each [["heading", "Subjudul"], ["quote", "Kutipan"], ["bullet", "Daftar"], ["ordered", "Daftar bernomor"], ["image", "Gambar"]] as [type, label] (type)}
				<Button
					variant="ghost"
					type="button"
					class="w-full rounded-md px-2 py-2 text-left text-body-sm text-ink hover:bg-surface-container-high"
					onclick={() => insertBlock(type as "heading" | "quote" | "bullet" | "ordered" | "image")}
					>{label}</Button
				>
			{/each}
		</div>
	{/if}

	{#if uploadError}
		<p class="label-meta text-error" role="alert">{uploadError}</p>
	{/if}
</div>

<!-- Link dialog -->
<Dialog.Root bind:open={linkDialogOpen}>
	<Dialog.Content class="max-w-sm shadow-none border border-hairline">
		<Dialog.Header>
			<Dialog.Title>Tambah Tautan</Dialog.Title>
			<Dialog.Description>Masukkan URL tautan yang ingin ditambahkan.</Dialog.Description>
		</Dialog.Header>
			<div class="py-2">
			<Input
				type="url"
				bind:value={linkUrl}
				placeholder="https://example.com"
				class="w-full"
				onkeydown={(e) => e.key === "Enter" && submitLink()}
			/>
		</div>
		<Dialog.Footer class="gap-2 flex-row">
			{#if isActive("link")}
				<Button variant="outline" type="button" onclick={removeLinkAndClose} class="text-destructive border-destructive/30 hover:bg-destructive/5">
					Hapus tautan
				</Button>
			{/if}
			<Button variant="outline" type="button" onclick={() => (linkDialogOpen = false)}>
				Batal
			</Button>
			<Button type="button" onclick={submitLink}>
				Simpan
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Math dialog -->
<Dialog.Root bind:open={mathDialogOpen}>
	<Dialog.Content class="max-w-md shadow-none border border-hairline">
		<Dialog.Header>
			<Dialog.Title>Rumus Matematika</Dialog.Title>
			<Dialog.Description>Masukkan rumus dalam format LaTeX/KaTeX.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-3 py-2">
			<Input
				type="text"
				bind:value={mathFormula}
				placeholder="Contoh: E = mc^2"
				class="w-full font-mono"
				onkeydown={(e) => e.key === "Enter" && submitMath()}
			/>
			{#if mathFormula.trim()}
				<div class="rounded-lg border border-hairline bg-surface-container-low px-4 py-3 text-center">
					<p class="text-[10px] text-on-surface-variant mb-2 uppercase tracking-wide">Preview</p>
					<div bind:this={mathPreviewEl} class="text-ink"></div>
				</div>
			{/if}
		</div>
		<Dialog.Footer class="gap-2 flex-row">
			<Button variant="outline" type="button" onclick={() => (mathDialogOpen = false)}>
				Batal
			</Button>
			<Button type="button" onclick={submitMath} disabled={!mathFormula.trim()}>
				Sisipkan
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

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

	:global(.ProseMirror img) {
		display: block;
		max-width: 100%;
		height: auto;
		cursor: pointer;
	}

	:global(.ProseMirror img.ProseMirror-selectednode) {
		outline: 2px solid var(--color-primary);
		outline-offset: 3px;
		border-radius: 0.5rem;
	}

	:global(.ProseMirror img[data-align="center"]),
	:global(.ProseMirror img[data-align="right"]) {
		margin-left: auto;
	}

	:global(.ProseMirror img[data-align="center"]),
	:global(.ProseMirror img[data-align="left"]) {
		margin-right: auto;
	}

	:global(.ProseMirror img[data-align="left"]) {
		margin-left: 0;
	}

	:global(.ProseMirror img[data-align="right"]) {
		margin-right: 0;
	}
</style>
