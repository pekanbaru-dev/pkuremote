<script lang="ts">
	import { Button } from "$lib/components/primitives";
	import SiteFooter from "$lib/components/site-footer.svelte";
	import SiteHeader from "$lib/components/site-header.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ExternalLink from "@lucide/svelte/icons/external-link";
	import Heart from "@lucide/svelte/icons/heart";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import Navigation from "@lucide/svelte/icons/navigation";
	import type { Cafe } from "../types.js";

	let { cafe: cafeProp }: { cafe: Cafe } = $props();
	let cafe = $derived(cafeProp);
	let saved = $state(false);
	const mapsUrl = $derived(
		`https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`
	);
	const mapUrl = $derived(
		`https://www.openstreetmap.org/export/embed.html?bbox=${cafe.longitude - 0.009},${cafe.latitude - 0.006},${cafe.longitude + 0.009},${cafe.latitude + 0.006}&layer=mapnik&marker=${cafe.latitude},${cafe.longitude}`
	);
	const mapLink = $derived(
		`https://www.openstreetmap.org/?mlat=${cafe.latitude}&mlon=${cafe.longitude}#map=16/${cafe.latitude}/${cafe.longitude}`
	);
</script>

<SiteHeader variant="light" />
<main id="top" class="mx-auto w-full max-w-[1180px] px-3 pb-16 pt-6 md:px-4">
	<a
		href="/wfc#top"
		class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary"
		><ArrowLeft size={16} /> Kembali ke WFC</a
	>
	<section
		class="relative min-h-[26rem] overflow-hidden rounded-2xl bg-cover bg-center shadow-lg"
		style={`background-image:linear-gradient(0deg,rgba(0,0,0,.66),rgba(0,0,0,.08) 65%),url('${cafe.imageUrl ?? ""}')`}
	>
		<div class="absolute left-5 right-5 top-5 flex justify-between gap-3">
			<span class="rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-primary"
				>{cafe.tagline}</span
			><span class="rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-success"
				>{cafe.occupancy}</span
			>
		</div>
		<div
			class="absolute bottom-5 left-5 right-5 flex flex-col justify-between gap-4 text-white desktop:flex-row desktop:items-end"
		>
			<div>
				<h1 class="font-display text-display-sm font-extrabold tracking-tight">{cafe.name}</h1>
				<p class="mt-2 text-sm text-white/85">
					Pekanbaru · {cafe.distance} · {cafe.price} · {cafe.closing}
				</p>
			</div>
			<div class="flex gap-2">
				<Button href={mapsUrl} intent="secondary" rounded="medium"
					><Navigation size={16} /> Arahkan ke sini</Button
				><Button
					type="button"
					intent="clean"
					variant="outline"
					rounded="medium"
					class="border-white/30 bg-white/15 text-white hover:bg-white/25"
					onclick={() => (saved = !saved)}
					><Heart size={16} fill={saved ? "currentColor" : "none"} />
					{saved ? "Tersimpan" : "Simpan"}</Button
				>
			</div>
		</div>
	</section>

	<div class="mt-5 grid gap-5 desktop:grid-cols-[1.15fr_.85fr]">
		<div class="grid gap-5">
			<section
				class="rounded-2xl border border-hairline bg-surface-container-lowest p-5 shadow-sm md:p-6"
			>
				<div class="flex items-start justify-between gap-3">
					<div>
						<div class="font-display text-display-sm font-extrabold leading-none text-ink">
							{cafe.score}
						</div>
						<p class="label-meta mt-2 text-muted">Skor WFC · sangat nyaman</p>
					</div>
					<span
						class="rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-muted"
						>Dari data WFC</span
					>
				</div>
				<div class="mt-5 grid gap-3">
					{#each [["WiFi", 96], ["Suasana", 91], ["Colokan", 94], ["Kenyamanan", 89], ["Ruang", 84], ["Ramah WFC", 95]] as [label, value] (label)}<div
							class="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-xs text-muted"
						>
							<span>{label}</span>
							<div class="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
								<span class="block h-full rounded-full bg-primary" style={`width:${value}%`}></span>
							</div>
							<strong class="text-right text-ink">{value}</strong>
						</div>{/each}
				</div>
				<div class="mt-5 rounded-xl bg-primary-container/30 p-4 text-sm text-on-primary-container">
					<strong>{cafe.liveStatus}</strong><small class="mt-1 block text-on-primary-container/80"
						>{cafe.liveNote}</small
					>
				</div>
				<div class="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
					{#each [["Kecepatan WiFi", cafe.wifi], ["Colokan", cafe.outlets], ["Suasana", cafe.atmosphere], ["Durasi nyaman", cafe.duration]] as [label, value] (label)}<div
							class="rounded-xl bg-surface-container-low p-3"
						>
							<span class="label-meta block text-muted">{label}</span><strong
								class="mt-1 block text-sm text-ink">{value}</strong
							>
						</div>{/each}
				</div>
			</section>
			<section
				class="rounded-2xl border border-hairline bg-surface-container-lowest p-5 shadow-sm md:p-6"
			>
				<h2 class="font-display text-headline-sm font-bold text-ink">Jam terbaik untuk kerja</h2>
				<p class="mt-1 text-sm text-muted">Berdasarkan pola keramaian dari check-in terakhir.</p>
				<div class="mt-4 grid grid-cols-4 gap-2 desktop:grid-cols-7">
					{#each cafe.bestHours as [time, status], index (time)}<div
							class:!bg-primary-container={index < 3}
							class="rounded-xl bg-surface-container-low p-2 text-center"
						>
							<span class="block text-[11px] text-muted">{time}</span><strong
								class="mt-1 block text-xs text-ink">{status}</strong
							>
						</div>{/each}
				</div>
			</section>
			<section
				class="rounded-2xl border border-hairline bg-surface-container-lowest p-5 shadow-sm md:p-6"
			>
				<h2 class="font-display text-headline-sm font-bold text-ink">Kata mereka</h2>
				<p class="mt-1 text-sm text-muted">Ulasan yang fokus pada kondisi untuk bekerja.</p>
				<div class="mt-3 divide-y divide-hairline">
					{#each cafe.reviews as [name, date, text] (name)}<article class="py-4 first:pt-1">
							<div class="flex justify-between gap-3">
								<strong class="text-sm text-ink">{name}</strong><small class="text-xs text-muted"
									>{date}</small
								>
							</div>
							<p class="mt-2 text-sm leading-6 text-muted">{text}</p>
						</article>{/each}
				</div>
			</section>
		</div>
		<div class="grid content-start gap-5">
			<section
				class="rounded-2xl border border-hairline bg-surface-container-lowest p-5 shadow-sm md:p-6"
			>
				<h2 class="font-display text-headline-sm font-bold text-ink">Setup kerja</h2>
				<p class="mt-1 text-sm text-muted">Hal yang bisa kamu harapkan saat sampai.</p>
				<div class="mt-4 grid grid-cols-2 gap-2">
					{#each cafe.amenities as [title, text] (title)}<div
							class="rounded-xl bg-surface-container-low p-3"
						>
							<strong class="block text-sm text-ink">{title}</strong><span
								class="mt-1 block text-xs leading-5 text-muted">{text}</span
							>
						</div>{/each}
				</div>
			</section>
			<section
				class="rounded-2xl border border-hairline bg-surface-container-lowest p-5 shadow-sm md:p-6"
			>
				<h2 class="font-display text-headline-sm font-bold text-ink">Kebijakan WFC</h2>
				<p class="mt-1 text-sm text-muted">Hal praktis sebelum buka laptop.</p>
				<div class="mt-3 divide-y divide-hairline">
					{#each cafe.policies as [key, value, kind] (key)}<div
							class="flex justify-between gap-3 py-3 text-sm"
						>
							<span class="text-ink">{key}</span><strong
								class={kind === "ok" ? "text-success" : "text-warning"}>{value}</strong
							>
						</div>{/each}
				</div>
			</section>
			<section
				class="rounded-2xl border border-hairline bg-surface-container-lowest p-5 shadow-sm md:p-6"
			>
				<h2 class="font-display text-headline-sm font-bold text-ink">Lokasi</h2>
				<p class="mt-1 flex items-start gap-1 text-sm leading-6 text-muted">
					<MapPin size={16} class="mt-1 shrink-0" />{cafe.address}
				</p>
				<div class="mt-4 h-56 overflow-hidden rounded-xl bg-surface-container">
					<iframe
						title={`Lokasi ${cafe.name} di OpenStreetMap`}
						src={mapUrl}
						loading="lazy"
						class="h-full w-full border-0"
					></iframe>
				</div>
				<a
					class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
					href={mapLink}
					target="_blank"
					rel="noreferrer">Buka di OpenStreetMap <ExternalLink size={14} /></a
				>
			</section>
		</div>
	</div>
</main>
<SiteFooter />
