<script lang="ts">
	import { Button } from "$lib/components/primitives";
	import * as Dialog from "$lib/components/ui/dialog";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import Heart from "@lucide/svelte/icons/heart";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import { getWfcCategory } from "../category.js";
	import type { Cafe } from "../types.js";

	let { cafes }: { cafes: readonly Cafe[] } = $props();
	let savedSlug = $state<string | null>(null);
	let scoreOpen = $state(false);
	const featured = $derived(cafes[0]);
	const visibleCafes = $derived(cafes.slice(1, 4));
</script>

<section id="wfc" class="mx-auto mt-16 w-full max-w-[1180px] px-3 md:px-4">
	<div
		class="flex flex-col justify-between gap-4 border-b border-hairline pb-5 md:flex-row md:items-end"
	>
		<div>
			<p class="label-meta text-primary">Work From Cafe</p>
			<h2 class="mt-2 font-display text-headline-lg font-extrabold tracking-tight text-ink">
				Mau kerja di mana hari ini?
			</h2>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
				Kurasi tempat di Pekanbaru yang nyaman untuk laptop, fokus, meeting, dan kerja sampai malam.
			</p>
		</div>
		<a class="link-quiet inline-flex items-center gap-1 text-sm font-semibold" href="/wfc">
			Lihat semua tempat <ArrowRight size={15} />
		</a>
	</div>

	{#if featured}
		<div
			class="mt-8 grid overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest shadow-md desktop:grid-cols-[1.1fr_.9fr]"
		>
			<a
				href={`/wfc/cafe/${featured.slug}`}
				class="relative min-h-72 bg-cover bg-center p-5 text-white desktop:min-h-[390px]"
				style={`background-image:linear-gradient(0deg,rgba(0,0,0,.58),rgba(0,0,0,.05) 65%),url('${featured.imageUrl ?? ""}')`}
			>
				<span class="rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-primary"
					>PILIHAN #1</span
				>
				<span
					class="absolute right-5 top-5 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-success"
				>
					{featured.occupancy}
				</span>
				<div class="absolute bottom-5 left-5 right-5">
					<p class="text-xs font-bold uppercase tracking-widest text-white/80">
						{getWfcCategory(featured.wfcCategory).label} · {featured.tagline}
					</p>
					<h3 class="mt-2 font-display text-display-sm font-extrabold tracking-tight">
						{featured.name}
					</h3>
					<p class="mt-1 text-sm text-white/85">
						{featured.distance} · {featured.price} · {featured.closing}
					</p>
				</div>
			</a>
			<div class="flex flex-col p-5 md:p-7">
				<div class="flex items-start justify-between gap-3">
					<div>
						<div class="font-display text-display-sm font-extrabold leading-none text-ink">
							{featured.score}
						</div>
						<p class="label-meta mt-2 text-muted">Skor WFC · sangat nyaman</p>
					</div>
					<Button
						type="button"
						intent="clean"
						variant="outline"
						size="sm"
						rounded="full"
						onclick={() => (scoreOpen = true)}
					>
						Cara menghitung skor
					</Button>
				</div>
				<div class="mt-5 rounded-xl bg-primary-container/30 p-4 text-sm text-on-primary-container">
					<strong>{featured.liveStatus}</strong>
					<small class="mt-1 block text-on-primary-container/80">{featured.liveNote}</small>
				</div>
				<div class="mt-4 grid grid-cols-2 gap-2 text-sm">
					<div class="rounded-xl bg-surface-container-low p-3">
						<span class="label-meta block text-muted">Wi-Fi</span><strong
							class="mt-1 block text-ink">{featured.wifi}</strong
						>
					</div>
					<div class="rounded-xl bg-surface-container-low p-3">
						<span class="label-meta block text-muted">Colokan</span><strong
							class="mt-1 block text-ink">{featured.outlets}</strong
						>
					</div>
					<div class="rounded-xl bg-surface-container-low p-3">
						<span class="label-meta block text-muted">Suasana</span><strong
							class="mt-1 block text-ink">{featured.atmosphere}</strong
						>
					</div>
					<div class="rounded-xl bg-surface-container-low p-3">
						<span class="label-meta block text-muted">Durasi</span><strong
							class="mt-1 block text-ink">{featured.duration}</strong
						>
					</div>
				</div>
				<div class="mt-auto flex gap-2 pt-5">
					<Button href={`/wfc/cafe/${featured.slug}`} intent="primary" fullWidth rounded="medium"
						>Lihat tempat <ArrowRight size={16} /></Button
					>
					<Button
						type="button"
						intent="clean"
						variant="outline"
						size="md"
						rounded="medium"
						aria-label="Simpan tempat"
						onclick={() => (savedSlug = savedSlug === featured.slug ? null : featured.slug)}
					>
						<Heart size={17} fill={savedSlug === featured.slug ? "currentColor" : "none"} />
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-8 flex items-end justify-between gap-3">
		<div>
			<h3 class="font-display text-headline-sm font-extrabold text-ink">Pilihan lain yang bagus</h3>
			<p class="mt-1 text-sm text-muted">Tempat nyaman dengan suasana yang berbeda.</p>
		</div>
		<span class="text-xs text-muted">{visibleCafes.length} tempat</span>
	</div>
	<div class="mt-4 grid gap-4 md:grid-cols-2 desktop:grid-cols-3">
		{#each visibleCafes as cafe (cafe.id)}
			<article
				class="overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
			>
				<a
					href={`/wfc/cafe/${cafe.slug}`}
					class="block h-44 bg-cover bg-center"
					style={`background-image:linear-gradient(0deg,rgba(0,0,0,.3),transparent 65%),url('${cafe.imageUrl ?? ""}')`}
					aria-label={cafe.name}
				>
					<div class="flex justify-between p-3 text-xs font-bold">
						<span class="rounded-full bg-white/95 px-2 py-1 text-primary">{cafe.score} WFC</span>
						<span class="rounded-full bg-white/95 px-2 py-1 text-success">{cafe.occupancy}</span>
					</div>
				</a>
				<div class="p-4">
					<div class="flex items-start justify-between gap-2">
						<a href={`/wfc/cafe/${cafe.slug}`}
							><h4 class="font-display text-lg font-bold text-ink">{cafe.name}</h4></a
						>
						<Button
							type="button"
							intent="clean"
							variant="text"
							size="xs"
							rounded="full"
							aria-label="Simpan tempat"
							onclick={() => (savedSlug = savedSlug === cafe.slug ? null : cafe.slug)}
						>
							<Heart size={16} fill={savedSlug === cafe.slug ? "currentColor" : "none"} />
						</Button>
					</div>
					<p class="mt-1 text-xs text-muted">
						<MapPin size={12} class="mr-1 inline" />{cafe.distance} · {cafe.price} · {cafe.closing}
					</p>
					<p class="mt-3 text-xs font-semibold text-ink">Cocok untuk: {cafe.fit}</p>
					<span
						class="mt-2 inline-flex rounded-full bg-primary-container/40 px-2.5 py-1 text-[11px] font-bold text-on-primary-container"
					>
						{getWfcCategory(cafe.wfcCategory).label}
					</span>
					<a
						class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary"
						href={`/wfc/cafe/${cafe.slug}`}
					>
						Lihat detail <ArrowRight size={13} />
					</a>
				</div>
			</article>
		{/each}
	</div>
</section>

<Dialog.Root open={scoreOpen} onOpenChange={(open) => (scoreOpen = open)}>
	<Dialog.Content class="max-w-[32rem] p-6 shadow-xl mobile:max-w-[32rem]">
		<Dialog.Header>
			<Dialog.Title>Bagaimana skor WFC dihitung?</Dialog.Title>
			<Dialog.Description>
				Skor membantu membandingkan kenyamanan tempat kerja dari data fasilitas dan kondisi terbaru.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-3 pt-2">
			{#each [["Wi-Fi & koneksi", "30%", "Kecepatan dan stabilitas internet"], ["Colokan", "25%", "Kemudahan mengisi daya"], ["Suasana", "25%", "Tingkat bising dan kenyamanan"], ["Durasi & kondisi", "20%", "Kenyamanan duduk lama dan update terbaru"]] as [label, weight, note] (label)}
				<div class="rounded-xl bg-surface-container-low p-3">
					<div class="flex items-center justify-between gap-3">
						<strong class="text-sm text-ink">{label}</strong>
						<span class="text-sm font-bold text-primary">{weight}</span>
					</div>
					<p class="mt-1 text-xs text-muted">{note}</p>
				</div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
