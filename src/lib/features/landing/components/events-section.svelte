<script lang="ts" module>
	import type { Event } from "$lib/features/events";

	export type EventsSectionProps = {
		events: Event[];
		pastEventsTotal?: number;
		showToast: (message: string) => void;
	};
</script>

<script lang="ts">
	/* eslint-disable svelte/no-restricted-html-elements */
	import Bookmark from "@lucide/svelte/icons/bookmark";

	let { events, pastEventsTotal = 0, showToast }: EventsSectionProps = $props();

	const formatDate = (iso: string) =>
		new Intl.DateTimeFormat("id-ID", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric"
		}).format(new Date(iso));

	const price = (event: Event) =>
		(event.pricePromo ?? event.priceNormal)
			? `Rp ${(event.pricePromo ?? event.priceNormal)?.toLocaleString("id-ID")}`
			: "GRATIS";
</script>

<section id="events" class="pt-11">
	<div class="mb-5 flex items-end justify-between gap-4">
		<div>
			<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">
				Rekomendasi Buat Kamu
			</h2>
			<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
				Temukan event seru dan bertemu orang-orang baru.
			</p>
		</div>
		<a
			class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
			href="/events"
		>
			Lihat semua event
		</a>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each events.slice(0, 4) as event (event.id)}
			<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
				<a
					href="/events/{event.slug}"
					class="relative block h-[212px] overflow-hidden bg-gradient-to-br from-[#1d164d] to-[#315c53] text-white"
				>
					{#if event.bannerUrl}
						<img src={event.bannerUrl} alt="" class="h-full w-full object-cover" />
					{:else}
						<div class="grid h-full place-items-center p-5 text-center text-xl font-black">
							{event.title}
						</div>
					{/if}
					<div
						class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/90"
					></div>
					<span
						class="absolute left-3 top-3 rounded-md bg-violet-700 px-2 py-1 text-[9px] font-black"
						>{event.categories[0]?.name ?? "KOMUNITAS"}</span
					>
					<button
						class="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/35"
						aria-label="Simpan event"
						onclick={(e) => {
							e.preventDefault();
							showToast("Event disimpan");
						}}><Bookmark size={16} /></button
					>
					<div class="absolute inset-x-4 bottom-4">
						<h3
							class="text-lg font-black leading-[1.1] [-webkit-text-stroke:0.75px_#334155] [paint-order:stroke_fill]"
						>
							{event.title}
						</h3>
						<p
							class="mt-2 text-[11px] text-white/95 [-webkit-text-stroke:0.35px_#334155] [paint-order:stroke_fill]"
						>
							{formatDate(event.startsAt)}
						</p>
						<p
							class="mt-1 text-[11px] text-white/95 [-webkit-text-stroke:0.35px_#334155] [paint-order:stroke_fill]"
						>
							{event.location}
						</p>
					</div></a
				>
				<div class="flex justify-between px-3.5 py-3 text-[11px] font-bold">
					<span class="flex items-center gap-1.5"
						><span
							class="grid h-6 w-6 place-items-center rounded-full bg-violet-700 text-[8px] font-black text-white"
							aria-hidden="true">PK</span
						>PKUBersua</span
					><span
						class="text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4"
						>{price(event)}</span
					>
				</div>
			</article>
		{:else}
			<p class="col-span-full p-8 text-center text-sm text-[#66747a]">Belum ada event mendatang.</p>
		{/each}
	</div>
</section>

{#if pastEventsTotal > 0}
	<section class="pt-8">
		<div class="flex justify-between">
			<div>
				<h2 class="text-xl font-black">Event Sebelumnya</h2>
				<p class="mt-1 text-sm text-[#66747a]">Lihat apa yang sudah kita selenggarakan.</p>
			</div>
			{#if pastEventsTotal > 6}
				<a class="text-xs font-bold text-[#0a5350]" href="/events">Lihat semua</a>
			{/if}
		</div>
	</section>
{/if}
