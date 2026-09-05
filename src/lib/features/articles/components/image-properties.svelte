<script lang="ts">
	import { ImagePlus } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import type { ArticleImageAlignment, ArticleImageAttributes } from "../types";
	import { cn } from "$lib/utils.js";

	type ImagePropertiesProps = {
		class?: string;
		style?: string;
	} & ArticleImageAttributes & {
			onChange: (change: Partial<ArticleImageAttributes>) => void;
		};

	let {
		class: className,
		style = "",
		width,
		alt,
		title,
		alignment,
		onChange
	}: ImagePropertiesProps = $props();

	const WIDTH_PRESETS = [50, 75, 100] as const;
	const ALIGNMENTS: Array<{ value: ArticleImageAlignment; label: string }> = [
		{ value: "left", label: "Kiri" },
		{ value: "center", label: "Tengah" },
		{ value: "right", label: "Kanan" }
	];

	function update(change: Partial<ArticleImageAttributes>) {
		onChange(change);
	}
</script>

<div
	class={cn(
		"flex flex-col gap-2 rounded-lg border border-hairline bg-white p-2.5 shadow-md",
		className
	)}
	{style}
	aria-label="Properti gambar"
>
	<div class="flex items-center justify-between gap-2">
		<div class="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-ink">
			<ImagePlus class="size-3.5 shrink-0 text-primary" />
			<span class="whitespace-nowrap">Properti gambar</span>
		</div>
		<span class="shrink-0 text-[10px] leading-4 text-on-surface-variant"
			>Klik gambar untuk memilih</span
		>
	</div>
	<div class="grid gap-1.5">
		<label class="grid gap-0.5 text-[11px] font-medium leading-4 text-on-surface-variant">
			<span>Alt text</span>
			<Input
				class="h-8 px-2 text-xs"
				value={alt}
				oninput={(event) => update({ alt: event.currentTarget.value })}
				placeholder="Deskripsi gambar untuk aksesibilitas"
				aria-label="Alt text gambar"
			/>
		</label>
		<label class="grid gap-0.5 text-[11px] font-medium leading-4 text-on-surface-variant">
			<span>Title</span>
			<Input
				class="h-8 px-2 text-xs"
				value={title}
				oninput={(event) => update({ title: event.currentTarget.value })}
				placeholder="Judul saat gambar diarahkan"
				aria-label="Title gambar"
			/>
		</label>
	</div>
	<label class="flex items-center gap-2 text-xs text-on-surface-variant">
		<span class="shrink-0">Lebar</span>
		<Input
			class="h-1.5 min-w-20 flex-1 cursor-pointer accent-primary"
			type="range"
			min="20"
			max="100"
			step="5"
			value={width ?? 100}
			oninput={(event) => update({ width: Number(event.currentTarget.value) })}
			aria-label="Lebar gambar dalam persen"
		/>
		<span class="w-9 text-right font-semibold text-ink">{width ?? "Auto"}{width ? "%" : ""}</span>
	</label>
	<div class="flex flex-wrap items-center justify-between gap-1.5">
		<span class="text-xs text-on-surface-variant">Posisi</span>
		<div class="flex items-center gap-0.5" role="group" aria-label="Posisi gambar">
			{#each ALIGNMENTS as item (item.value)}
				<Button
					variant="ghost"
					size="xs"
					type="button"
					class={cn(
						"text-on-surface-variant",
						alignment === item.value && "bg-primary/10 text-primary"
					)}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => update({ alignment: item.value })}
					aria-label={`Posisikan gambar di ${item.label.toLowerCase()}`}
				>
					{item.label}
				</Button>
			{/each}
		</div>
	</div>
	<div class="flex flex-wrap items-center gap-0.5" role="group" aria-label="Pilihan ukuran gambar">
		<span class="mr-auto text-xs text-on-surface-variant">Skala cepat</span>
		{#each WIDTH_PRESETS as preset (preset)}
			<Button
				variant="ghost"
				size="xs"
				type="button"
				class={cn("text-on-surface-variant", width === preset && "bg-primary/10 text-primary")}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => update({ width: preset })}
				aria-label={`Atur lebar gambar ${preset}%`}
			>
				{preset}%
			</Button>
		{/each}
		<Button
			variant="ghost"
			size="xs"
			type="button"
			class={cn("text-on-surface-variant", width === null && "bg-primary/10 text-primary")}
			onmousedown={(event) => event.preventDefault()}
			onclick={() => update({ width: null })}
			aria-label="Kembalikan ukuran gambar otomatis"
		>
			Auto
		</Button>
	</div>
</div>
