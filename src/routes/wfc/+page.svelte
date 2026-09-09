<script lang="ts">
	import { Button } from "$lib/components/primitives";
	import * as Select from "$lib/components/ui/select";
	import { Input } from "$lib/components/ui/input";
	import SiteFooter from "$lib/components/site-footer.svelte";
	import SiteHeader from "$lib/components/site-header.svelte";
	import { WFC_CATEGORY_OPTIONS, getWfcCategory, type WfcCategory } from "$lib/features/wfc";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import Search from "@lucide/svelte/icons/search";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();
	const totalPages = $derived(Math.ceil(data.total / data.pageSize));
	const categoryLabel = $derived(
		data.category ? getWfcCategory(data.category as WfcCategory).label : "Semua kategori"
	);
	const pageHref = (page: number) =>
		`/wfc?${new URLSearchParams({
			...(data.query ? { q: data.query } : {}),
			...(data.category ? { category: data.category } : {}),
			page: String(page)
		})}`;
</script>

<svelte:head>
	<title>Cari Tempat WFC — PKU Bersua</title>
	<meta
		name="description"
		content="Cari tempat WFC di Pekanbaru berdasarkan tag Nongkrong dan kata kunci."
	/>
</svelte:head>

<SiteHeader variant="light" />
<main id="top" class="mx-auto w-full max-w-[1180px] px-3 pb-16 pt-10 tablet:px-4">
	<a
		href="/#wfc"
		class="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary"
	>
		<ArrowLeft size={16} /> Kembali ke beranda
	</a>
	<header class="max-w-2xl">
		<p class="label-meta text-primary">Work From Cafe</p>
		<h1 class="mt-2 font-display text-display-sm font-extrabold tracking-tight text-ink">
			Cari tempat nongkrong yang cocok
		</h1>
		<p class="mt-3 text-sm leading-6 text-muted">
			Semua hasil di halaman ini berasal dari kafe bertag Nongkrong. Gunakan kata kunci untuk
			menyaring nama, suasana, alamat, atau fasilitas.
		</p>
	</header>

	<form
		method="GET"
		class="mt-8 flex flex-col gap-3 rounded-2xl border border-hairline bg-surface-container-lowest p-3 tablet:flex-row"
	>
		<div class="relative flex-1">
			<Search
				class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
				size={17}
			/>
			<Input
				class="pl-10"
				name="q"
				value={data.query}
				placeholder="Contoh: tenang, meeting, colokan"
				aria-label="Kata kunci WFC"
			/>
		</div>
		<div class="tablet:w-64">
			<Select.Root type="single" name="category" value={data.category}>
				<Select.Trigger class="w-full">{categoryLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="" label="Semua kategori" />
					{#each WFC_CATEGORY_OPTIONS as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<Button type="submit" intent="primary"><Search size={16} />Cari tempat</Button>
	</form>

	<div class="mt-10 flex items-end justify-between gap-3 border-b border-hairline pb-4">
		<div>
			<h2 class="font-display text-headline-sm font-extrabold text-ink">
				{data.total} tempat ditemukan
			</h2>
			<p class="mt-1 text-sm text-muted">Halaman {data.page} dari {Math.max(totalPages, 1)}</p>
		</div>
	</div>

	{#if data.items.length === 0}
		<div class="mt-8 rounded-2xl border border-dashed border-hairline px-6 py-12 text-center">
			<h2 class="font-display text-xl font-bold text-ink">Belum ada hasil</h2>
			<p class="mt-2 text-sm text-muted">
				Coba kata kunci lain seperti tenang, meeting, atau malam.
			</p>
		</div>
	{:else}
		<div class="mt-6 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
			{#each data.items as cafe (cafe.id)}
				<article
					class="overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest shadow-sm"
				>
					<a
						href={`/wfc/cafe/${cafe.slug}`}
						class="block h-48 bg-cover bg-center"
						style={`background-image:linear-gradient(0deg,rgba(0,0,0,.35),transparent 65%),url('${cafe.imageUrl ?? ""}')`}
						aria-label={cafe.name}
					>
						<div class="flex justify-between p-3 text-xs font-bold">
							<span class="rounded-full bg-white/95 px-2 py-1 text-primary">{cafe.score} WFC</span>
							<span class="rounded-full bg-white/95 px-2 py-1 text-success">{cafe.occupancy}</span>
						</div>
					</a>
					<div class="p-4">
						<h3 class="font-display text-xl font-bold text-ink">{cafe.name}</h3>
						<p class="mt-1 text-xs text-muted">{cafe.distance} · {cafe.price} · {cafe.closing}</p>
						<p class="mt-3 text-sm text-ink">{cafe.fit}</p>
						<span
							class="mt-3 inline-flex rounded-full bg-primary-container/40 px-2.5 py-1 text-xs font-bold text-on-primary-container"
						>
							{getWfcCategory(cafe.wfcCategory).label}
						</span>
						<div class="mt-3 flex flex-wrap gap-1.5">
							{#each cafe.tags as tag (tag)}<span
									class="rounded-md bg-surface-container-low px-2 py-1 text-[11px] text-muted"
									>{tag}</span
								>{/each}
						</div>
						<Button class="mt-5" href={`/wfc/cafe/${cafe.slug}`} variant="outline" size="sm"
							>Lihat detail <ArrowRight size={14} /></Button
						>
					</div>
				</article>
			{/each}
		</div>
	{/if}

	{#if totalPages > 1}
		<nav
			class="mt-8 flex items-center justify-between border-t border-hairline pt-5"
			aria-label="Pagination WFC"
		>
			{#if data.page > 1}<a
					class="link-quiet inline-flex items-center gap-1 text-sm font-semibold"
					href={pageHref(data.page - 1)}><ArrowLeft size={15} /> Sebelumnya</a
				>{:else}<span></span>{/if}
			<span class="text-sm text-muted">{data.page} / {totalPages}</span>
			{#if data.page < totalPages}<a
					class="link-quiet inline-flex items-center gap-1 text-sm font-semibold"
					href={pageHref(data.page + 1)}>Berikutnya <ArrowRight size={15} /></a
				>{:else}<span></span>{/if}
		</nav>
	{/if}
</main>
<SiteFooter />
