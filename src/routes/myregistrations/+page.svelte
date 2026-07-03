<script lang="ts">
	import type { PageData } from "./$types.js";
	import { EmptyState } from "$lib/components/ui/empty-state";

	let { data }: { data: PageData } = $props();
	const registrations = $derived(data.registrations);

	function formatRegDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}

	function eventStatusLabel(eventStart: string): "Akan Datang" | "Berlangsung" | "Selesai" {
		const now = Date.now();
		const start = new Date(eventStart).getTime();
		if (now < start) return "Akan Datang";
		return "Selesai";
	}

	function registrationStatusLabel(
		status: "confirmed" | "cancelled" | "attended" | "no_show"
	): string {
		switch (status) {
			case "confirmed":
				return "Dikonfirmasi";
			case "cancelled":
				return "Dibatalkan";
			case "attended":
				return "Hadir";
			case "no_show":
				return "Tidak Hadir";
		}
	}
</script>

<svelte:head>
	<title>Registrasi Saya — PKUBersua</title>
	<meta name="description" content="Daftar event yang telah Anda booking di PKUBersua." />
</svelte:head>

<header class="sticky top-0 z-10 border-b border-hairline bg-canvas/90 backdrop-blur">
	<div class="container-page flex items-center justify-between py-4">
		<a
			href="/"
			class="font-display text-lg font-bold tracking-tight text-ink"
			aria-label="PKUBersua — beranda"
		>
			PKUBersua
		</a>
	</div>
</header>

<main class="container-page py-[clamp(3rem,7vw,5rem)]">
	<div class="mb-xl flex flex-col gap-3">
		<h1
			class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary"
		>
			Registrasi Saya
		</h1>
		<p class="text-on-surface-variant max-w-prose">
			Daftar event yang telah Anda booking. Klik "Lihat tiket" untuk membuka tiket dengan QR Code
			Anda.
		</p>
	</div>

	{#if registrations.length === 0}
		<EmptyState
			title="Anda belum memiliki registrasi event"
			description="Lihat semua event di halaman arsip dan booking event yang menarik untuk Anda."
		>
			<a
				href="/events"
				class="mt-2 inline-flex h-11 items-center justify-center rounded-md border border-transparent bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-hover"
			>
				Lihat semua event
			</a>
		</EmptyState>
	{:else}
		<ul class="flex flex-col gap-6" data-testid="myregistrations-list">
			{#each registrations as reg (reg.id)}
				<li
					class="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-container-lowest p-md tablet:flex-row tablet:items-center tablet:gap-6"
				>
					<div class="flex-1 flex flex-col gap-1">
						<a
							href="/events/{reg.event.slug}"
							class="font-headline-md text-headline-md font-semibold text-ink hover:text-primary"
						>
							{reg.event.title}
						</a>
						<p class="label-meta text-on-surface-variant">
							{formatRegDate(reg.event.startsAt)} · {reg.event.location}
						</p>
						<div class="flex flex-wrap gap-2 mt-2">
							<span
								class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[0.75rem] font-semibold text-primary"
							>
								{eventStatusLabel(reg.event.startsAt)}
							</span>
							<span
								class="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-[0.75rem] font-semibold text-secondary"
							>
								{registrationStatusLabel(reg.status)}
							</span>
						</div>
						<p class="label-meta text-on-surface-variant mt-1">
							No. Registrasi: <span class="font-label-md font-bold text-ink"
								>{reg.registrationNumber}</span
							>
						</p>
					</div>
					<div class="flex flex-row tablet:flex-col gap-2 tablet:items-end">
						<a
							href="/events/{reg.event.slug}/ticket/{reg.registrationNumber}"
							class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-hover"
						>
							Lihat tiket
						</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<footer class="container-page py-12">
	<p class="label-meta">© 2026 PKUBersua</p>
</footer>
